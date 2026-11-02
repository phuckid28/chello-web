// Focus mode store: while the current user's status is `focus` (and not expired) the app silences
// non-error toasts and UI chimes. Tiny external store usable from React and plain modules.
import { useSyncExternalStore } from 'react'

const FOCUS_MODE = 'focus'
// setTimeout delays above 2^31-1 ms overflow and fire immediately
const MAX_TIMER_MS = 2_147_483_647

let focusStatus = null
let expiryTimer = null
let lastActive = false
const listeners = new Set()

export const isFocusActive = (user, now = Date.now()) => {
  const status = user?.status
  if (!status || status.mode !== FOCUS_MODE) return false
  const until = Number(status.until)
  return !status.until || !Number.isFinite(until) || until > now
}

export const getFocusActive = () => isFocusActive({ status: focusStatus })

const emitIfChanged = () => {
  const active = getFocusActive()
  if (active === lastActive) return
  lastActive = active
  listeners.forEach((listener) => listener(active))
}

const clearExpiryTimer = () => {
  if (expiryTimer) clearTimeout(expiryTimer)
  expiryTimer = null
}

const scheduleExpiry = () => {
  clearExpiryTimer()
  const until = Number(focusStatus?.until)
  if (!getFocusActive() || !focusStatus?.until || !Number.isFinite(until)) return
  const delay = Math.min(until - Date.now() + 1, MAX_TIMER_MS)
  expiryTimer = setTimeout(() => {
    emitIfChanged()
    scheduleExpiry()
  }, Math.max(0, delay))
}

export const setFocusFromUser = (user) => {
  focusStatus = user?.status ? { ...user.status } : null
  scheduleExpiry()
  emitIfChanged()
}

export const subscribeFocus = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Test helper: reset module state between cases
export const resetFocusStore = () => {
  clearExpiryTimer()
  focusStatus = null
  lastActive = false
  listeners.clear()
}

// Snapshot is the last emitted value so React always sees a stable result between notifications
const getFocusSnapshot = () => lastActive

export const useFocusMode = () => useSyncExternalStore(subscribeFocus, getFocusSnapshot, () => false)
