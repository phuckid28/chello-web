// User System v7 — board presence heartbeat (contract §5). Presence is best-effort: never toast.
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { REALTIME_EVENTS, subscribeRealtime } from '~/utils/realtimeStream'

const PRESENCE = `${API_ROOT}/v1/presence`
const HEARTBEAT_MS = 25000

const boardViewers = new Map() // boardId -> Array<viewer>
const boardListeners = new Map() // boardId -> Set<listener>
const boardEditing = new Map() // boardId -> editing payload

const notifyBoardListeners = (boardId) => {
  const viewers = boardViewers.get(String(boardId)) || []
  const listeners = boardListeners.get(String(boardId))
  if (!listeners) return
  ;[...listeners].forEach(cb => cb(viewers))
}

export const sendPresenceHeartbeatAPI = async (boardId, editing = null) => {
  const body = editing ? { editing } : {}
  const response = await authorizedAxiosInstance.post(`${PRESENCE}/boards/${boardId}/heartbeat`, body, { silent: true })
  if (Array.isArray(response.data?.viewers)) {
    boardViewers.set(String(boardId), response.data.viewers)
    notifyBoardListeners(boardId)
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
  sendPresenceHeartbeatAPI(key, editing).catch(() => {})
}

export const joinPresence = (boardId) => {
  const key = String(boardId || '')
  if (!key) return () => {}
  sendPresenceHeartbeatAPI(key, boardEditing.get(key) || null).catch(() => {})
  const timer = setInterval(() => {
    sendPresenceHeartbeatAPI(key, boardEditing.get(key) || null).catch(() => {})
  }, HEARTBEAT_MS)

  return () => {
    clearInterval(timer)
    boardEditing.delete(key)
    leavePresenceAPI(key).catch(() => {})
  }
}
