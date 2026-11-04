// User System v7 — board presence heartbeat & live multiplayer cursor telemetry (contract §5).
// Presence is best-effort: never toast.
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { REALTIME_EVENTS, subscribeRealtime } from '~/utils/realtimeStream'

const PRESENCE = `${API_ROOT}/v1/presence`
const HEARTBEAT_MS = 25000
const CURSOR_THROTTLE_MS = 1400

const boardViewers = new Map() // boardId -> Array<viewer>
const boardListeners = new Map() // boardId -> Set<listener>
const boardEditing = new Map() // boardId -> editing payload
const boardCursor = new Map() // boardId -> cursor payload { xPct, yPct, view, action }
const cursorThrottleState = new Map() // boardId -> { lastSentAt, timerId }

const notifyBoardListeners = (boardId) => {
  const viewers = boardViewers.get(String(boardId)) || []
  const listeners = boardListeners.get(String(boardId))
  if (!listeners) return
  ;[...listeners].forEach(cb => cb(viewers))
}

export const sendPresenceHeartbeatAPI = async (boardId, editing = undefined, cursor = undefined) => {
  const key = String(boardId || '')
  const resolvedEditing = editing !== undefined ? editing : (boardEditing.get(key) || null)
  const resolvedCursor = cursor !== undefined ? cursor : (boardCursor.get(key) || null)
  const body = {}
  if (resolvedEditing) body.editing = resolvedEditing
  if (resolvedCursor) body.cursor = resolvedCursor

  const response = await authorizedAxiosInstance.post(`${PRESENCE}/boards/${boardId}/heartbeat`, body, { silent: true })
  if (Array.isArray(response.data?.viewers)) {
    boardViewers.set(key, response.data.viewers)
    notifyBoardListeners(key)
  }
  return response.data
}

export const leavePresenceAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${PRESENCE}/boards/${boardId}`, { silent: true })
  return response.data
}

export const getPresenceViewers = (boardId) => boardViewers.get(String(boardId || '')) || []

export const subscribePresence = (boardId, listener) => {
  const key = String(boardId || '')
  if (!key || typeof listener !== 'function') return () => {}
  if (!boardListeners.has(key)) boardListeners.set(key, new Set())
  boardListeners.get(key).add(listener)

  const unsubSse = subscribeRealtime(REALTIME_EVENTS.PRESENCE, (payload) => {
    if (String(payload?.boardId || '') === key && Array.isArray(payload?.viewers)) {
      boardViewers.set(key, payload.viewers)
      notifyBoardListeners(key)
    }
  })

  return () => {
    boardListeners.get(key)?.delete(listener)
    unsubSse()
  }
}

export const setActiveCard = (boardId, cardId = null) => {
  const key = String(boardId || '')
  if (!key) return
  const editing = cardId ? { type: 'card', id: cardId } : null
  boardEditing.set(key, editing)
  sendPresenceHeartbeatAPI(key, editing, boardCursor.get(key) || null).catch(() => {})
}

export const updatePresenceCursor = (boardId, cursor = null) => {
  const key = String(boardId || '')
  if (!key || !cursor || typeof cursor !== 'object') return

  const normalized = {
    xPct: Math.max(0, Math.min(100, Math.round((Number(cursor.xPct) || 0) * 10) / 10)),
    yPct: Math.max(0, Math.min(100, Math.round((Number(cursor.yPct) || 0) * 10) / 10)),
    view: String(cursor.view || 'kanban').slice(0, 24),
    action: String(cursor.action || '').slice(0, 64)
  }
  boardCursor.set(key, normalized)

  const now = Date.now()
  const state = cursorThrottleState.get(key) || { lastSentAt: 0, timerId: null }
  const elapsed = now - state.lastSentAt

  if (elapsed >= CURSOR_THROTTLE_MS) {
    if (state.timerId) {
      clearTimeout(state.timerId)
      state.timerId = null
    }
    state.lastSentAt = now
    cursorThrottleState.set(key, state)
    sendPresenceHeartbeatAPI(key, boardEditing.get(key) || null, normalized).catch(() => {})
    return
  }

  if (!state.timerId) {
    state.timerId = setTimeout(() => {
      const current = cursorThrottleState.get(key)
      if (current) {
        current.lastSentAt = Date.now()
        current.timerId = null
      }
      sendPresenceHeartbeatAPI(key, boardEditing.get(key) || null, boardCursor.get(key) || null).catch(() => {})
    }, Math.max(150, CURSOR_THROTTLE_MS - elapsed))
    cursorThrottleState.set(key, state)
  }
}

export const joinPresence = (boardId) => {
  const key = String(boardId || '')
  if (!key) return () => {}
  sendPresenceHeartbeatAPI(key, boardEditing.get(key) || null, boardCursor.get(key) || null).catch(() => {})
  const timer = setInterval(() => {
    sendPresenceHeartbeatAPI(key, boardEditing.get(key) || null, boardCursor.get(key) || null).catch(() => {})
  }, HEARTBEAT_MS)

  return () => {
    clearInterval(timer)
    const throttle = cursorThrottleState.get(key)
    if (throttle?.timerId) clearTimeout(throttle.timerId)
    cursorThrottleState.delete(key)
    boardEditing.delete(key)
    boardCursor.delete(key)
    leavePresenceAPI(key).catch(() => {})
  }
}
