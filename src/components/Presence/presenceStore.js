// Shared board presence sessions (contract v7 §5).
// Several components (BoardBar, ActiveCard, CR studio) may observe the same board; they share one
// heartbeat loop per board. Each component can claim an `editing` field; the latest claim is sent.
import { leavePresenceAPI, sendPresenceHeartbeatAPI } from '~/apis/presenceApi'
import { REALTIME_EVENTS, subscribeRealtime } from '~/utils/realtimeStream'

export const HEARTBEAT_INTERVAL_MS = 20000
// Grace period before leaving, so StrictMode remounts / quick route changes don't flap presence
const LEAVE_DELAY_MS = 1500
const EMPTY_VIEWERS = Object.freeze([])

const sessions = new Map() // boardId -> session
const claims = new Map() // boardId -> Map<token, editing>

const editingKey = (editing) => (editing ? `${editing.cardId}:${editing.field}` : '')

const currentEditing = (boardId) => {
  const values = [...(claims.get(boardId)?.values() || [])].filter(Boolean)
  return values.length ? values[values.length - 1] : null
}

const notify = (session) => session.listeners.forEach(listener => listener())

const setViewers = (session, viewers) => {
  if (!Array.isArray(viewers)) return
  session.viewers = viewers
  notify(session)
}

const isHidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden'

const beat = (boardId) => {
  const session = sessions.get(boardId)
  if (!session || session.refs === 0 || isHidden()) return
  const editing = currentEditing(boardId)
  session.sentKey = editingKey(editing)
  sendPresenceHeartbeatAPI(boardId, editing)
    .then(data => setViewers(session, data?.viewers))
    .catch(() => {
      // Presence is best-effort; the next heartbeat retries silently
    })
}

const startTimer = (session) => {
  clearInterval(session.timer)
  session.timer = setInterval(() => beat(session.boardId), HEARTBEAT_INTERVAL_MS)
}

const leaveNow = (boardId) => {
  leavePresenceAPI(boardId).catch(() => {
    // Entries expire server-side after 45 s anyway
  })
}

const createSession = (boardId) => {
  const session = {
    boardId,
    refs: 0,
    viewers: EMPTY_VIEWERS,
    listeners: new Set(),
    timer: null,
    leaveTimer: null,
    sentKey: '',
    teardown: null
  }
  const onVisibility = () => {
    if (isHidden()) {
      clearInterval(session.timer)
      return
    }
    beat(boardId)
    startTimer(session)
  }
  const onPageHide = () => leaveNow(boardId)
  const onRealtime = (payload) => {
    if (String(payload?.boardId) === String(boardId)) setViewers(session, payload.viewers)
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onPageHide)
  const unsubscribe = subscribeRealtime(REALTIME_EVENTS.PRESENCE, onRealtime)
  session.teardown = () => {
    clearInterval(session.timer)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
    unsubscribe()
  }
  sessions.set(boardId, session)
  return session
}

/** Starts (or joins) the heartbeat loop for a board; returns a release function. */
export const joinPresence = (boardId) => {
  const session = sessions.get(boardId) || createSession(boardId)
  clearTimeout(session.leaveTimer)
  session.refs += 1
  if (session.refs === 1 && !session.timer) {
    beat(boardId)
    startTimer(session)
  }
  let released = false
  return () => {
    if (released) return
    released = true
    session.refs -= 1
    if (session.refs > 0) return
    session.leaveTimer = setTimeout(() => {
      if (session.refs > 0) return
      session.teardown()
      sessions.delete(boardId)
      leaveNow(boardId)
    }, LEAVE_DELAY_MS)
  }
}

/** Records what a component is editing (null clears) and pushes an immediate heartbeat on change. */
export const setEditingClaim = (boardId, token, editing) => {
  const boardClaims = claims.get(boardId) || new Map()
  if (editing) boardClaims.set(token, editing)
  else boardClaims.delete(token)
  if (boardClaims.size) claims.set(boardId, boardClaims)
  else claims.delete(boardId)
  const session = sessions.get(boardId)
  if (session && session.refs > 0 && session.sentKey !== editingKey(currentEditing(boardId))) beat(boardId)
}

export const subscribePresence = (boardId, listener) => {
  const session = sessions.get(boardId)
  if (!session) return () => {}
  session.listeners.add(listener)
  return () => session.listeners.delete(listener)
}

export const getPresenceViewers = (boardId) => sessions.get(boardId)?.viewers || EMPTY_VIEWERS
