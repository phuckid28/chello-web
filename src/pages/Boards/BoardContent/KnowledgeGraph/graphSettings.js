// Persistence helpers for the graph: pinned node layout per board and display / force settings.
// Everything read from localStorage is validated because it is user-editable external data.
import {
  DEFAULT_DISPLAY,
  DEFAULT_FILTERS,
  DEFAULT_FORCES,
  FORCE_LIMITS,
  PIN_STORAGE_PREFIX,
  SETTINGS_STORAGE_KEY
} from './graphConstants'

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    // localStorage can be blocked (private mode) or hold corrupt JSON - fall back to defaults
    return null
  }
}

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // Quota exceeded / storage unavailable - persistence is best effort only
  }
}

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

export const sanitizePins = (raw) => {
  if (!isPlainObject(raw)) return {}
  return Object.fromEntries(Object.entries(raw)
    .filter(([id, p]) => typeof id === 'string' && Number.isFinite(p?.x) && Number.isFinite(p?.y))
    .map(([id, p]) => [id, { x: p.x, y: p.y }]))
}

export const loadPins = (boardId) => (boardId ? sanitizePins(readJson(`${PIN_STORAGE_PREFIX}${boardId}`)) : {})

export const savePins = (boardId, positions) => {
  if (boardId) writeJson(`${PIN_STORAGE_PREFIX}${boardId}`, sanitizePins(positions))
}

const pickBooleans = (raw, defaults) => Object.fromEntries(Object.keys(defaults)
  .map(key => [key, typeof raw?.[key] === 'boolean' ? raw[key] : defaults[key]]))

const clampForce = (key, value) => {
  const { min, max } = FORCE_LIMITS[key]
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : DEFAULT_FORCES[key]
}

const sanitizeColors = (raw) => {
  if (!isPlainObject(raw)) return {}
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => /^#[0-9a-f]{6}$/i.test(String(v))))
}

export const sanitizeSettings = (raw) => {
  const source = isPlainObject(raw) ? raw : {}
  const display = pickBooleans(source.display, DEFAULT_DISPLAY)
  display.sizeBy = source.display?.sizeBy === 'progress' ? 'progress' : 'degree'
  return {
    filters: pickBooleans(source.filters, DEFAULT_FILTERS),
    display,
    forces: Object.fromEntries(Object.keys(DEFAULT_FORCES).map(k => [k, clampForce(k, source.forces?.[k])])),
    colors: sanitizeColors(source.colors)
  }
}

export const loadSettings = () => sanitizeSettings(readJson(SETTINGS_STORAGE_KEY))

export const saveSettings = (settings) => writeJson(SETTINGS_STORAGE_KEY, sanitizeSettings(settings))
