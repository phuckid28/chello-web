// Single shared EventSource for GET /v1/invitations/stream (contract v7 §4/§5).
// Components subscribe by event name (BE_NOTIFICATION, BE_PRESENCE, BE_USER_INVITED_TO_BOARD…);
// the connection opens on the first subscriber and closes when the last one leaves.
import { API_ROOT } from '~/utils/constants'

const STREAM_URL = `${API_ROOT}/v1/invitations/stream`

let source = null
const handlers = new Map() // eventName -> Set<handler>
const attached = new Map() // eventName -> dispatcher bound on the EventSource

const parsePayload = (event) => {
  try {
    return JSON.parse(event.data)
  } catch (error) {
    // Malformed SSE payloads are ignored rather than crashing subscribers
    return null
  }
}

const totalSubscribers = () => [...handlers.values()].reduce((sum, set) => sum + set.size, 0)

const ensureSource = () => {
  if (source || typeof EventSource === 'undefined') return source
  source = new EventSource(STREAM_URL, { withCredentials: true })
  handlers.forEach((_, eventName) => attachDispatcher(eventName))
  return source
}

function attachDispatcher(eventName) {
  if (!source || attached.has(eventName)) return
  const dispatcher = (event) => {
    const payload = parsePayload(event)
    if (payload === null) return
    ;[...(handlers.get(eventName) || [])].forEach(handler => handler(payload))
  }
  source.addEventListener(eventName, dispatcher)
  attached.set(eventName, dispatcher)
}

const closeSource = () => {
  if (!source) return
  attached.forEach((dispatcher, eventName) => source.removeEventListener(eventName, dispatcher))
  attached.clear()
  source.close()
  source = null
}

/** Subscribe to a server-sent event; returns an unsubscribe function. */
export const subscribeRealtime = (eventName, handler) => {
  if (!handlers.has(eventName)) handlers.set(eventName, new Set())
  handlers.get(eventName).add(handler)
  ensureSource()
  attachDispatcher(eventName)

  return () => {
    handlers.get(eventName)?.delete(handler)
    if (totalSubscribers() === 0) closeSource()
  }
}

export const REALTIME_EVENTS = Object.freeze({
  NOTIFICATION: 'BE_NOTIFICATION',
  PRESENCE: 'BE_PRESENCE',
  BOARD_INVITE: 'BE_USER_INVITED_TO_BOARD'
})
