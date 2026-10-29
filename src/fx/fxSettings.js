// Visual-effects preferences (themed cursor, trail, sparkles, transitions, celebrations)
// Stored locally and shared through a tiny external store so any component can subscribe.

const STORAGE_KEY = 'chella_fx_settings'
export const FX_SETTINGS_EVENT = 'chella-fx-settings-change'

export const DEFAULT_FX_SETTINGS = Object.freeze({
  cursor: true,
  trail: true,
  sparkles: true,
  transitions: true,
  celebrate: true
})

export const FX_SETTING_KEYS = Object.keys(DEFAULT_FX_SETTINGS)

// Keeps only known boolean flags; anything else falls back to the default
export const normalizeFxSettings = (raw) => {
  const source = raw && typeof raw === 'object' ? raw : {}
  return Object.freeze(
    FX_SETTING_KEYS.reduce((acc, key) => ({
      ...acc,
      [key]: typeof source[key] === 'boolean' ? source[key] : DEFAULT_FX_SETTINGS[key]
    }), {})
  )
}

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return normalizeFxSettings(raw ? JSON.parse(raw) : null)
  } catch (error) {
    // Storage blocked or corrupted JSON — use defaults
    return normalizeFxSettings(null)
  }
}

let current = readStored()
const listeners = new Set()

export const getFxSettings = () => current

export const setFxSettings = (patch) => {
  current = normalizeFxSettings({ ...current, ...patch })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch (error) {
    // Persisting is best-effort; the in-memory value still applies for this session
  }
  listeners.forEach(listener => listener())
  window.dispatchEvent(new CustomEvent(FX_SETTINGS_EVENT, { detail: current }))
}

export const subscribeFxSettings = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const isMotionReduced = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (error) {
    // matchMedia unavailable — assume motion is acceptable
    return false
  }
}

export const isFinePointer = () => {
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  } catch (error) {
    // matchMedia unavailable — treat as a regular desktop pointer
    return true
  }
}
