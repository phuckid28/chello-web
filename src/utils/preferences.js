// Pure helpers for server-synced user preferences (contract v7 §2 PUT /users/preferences).
// No browser or store access here so the logic stays unit-testable.

export const LANGUAGE_CODES = Object.freeze(['vi', 'en', 'ja', 'ko'])
export const DENSITIES = Object.freeze(['comfortable', 'compact'])
export const BOARD_VIEWS = Object.freeze(['overview', 'kanban', 'timeline', 'graph'])
const BOOLEAN_KEYS = Object.freeze(['bilingual', 'reduceMotion', 'sound'])

export const DEFAULT_PREFERENCES = Object.freeze({
  density: 'comfortable',
  defaultBoardView: 'overview'
})

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizeFx = (fx) => {
  if (!isPlainObject(fx)) return null
  const entries = Object.entries(fx).filter(([, value]) => typeof value === 'boolean')
  return entries.length ? Object.fromEntries(entries) : null
}

/** Keeps only known keys with valid values. `themeKeys` = allowed global theme keys. */
export const normalizePreferences = (raw, themeKeys = []) => {
  if (!isPlainObject(raw)) return {}
  const result = {}
  if (themeKeys.includes(raw.theme)) result.theme = raw.theme
  if (LANGUAGE_CODES.includes(raw.language)) result.language = raw.language
  if (DENSITIES.includes(raw.density)) result.density = raw.density
  if (BOARD_VIEWS.includes(raw.defaultBoardView)) result.defaultBoardView = raw.defaultBoardView
  BOOLEAN_KEYS.forEach((key) => {
    if (typeof raw[key] === 'boolean') result[key] = raw[key]
  })
  const fx = normalizeFx(raw.fx)
  if (fx) result.fx = fx
  if (isPlainObject(raw.onboarding)) result.onboarding = { ...raw.onboarding }
  return result
}

/** Server preferences win; the local cache fills the gaps (offline / first sync). */
export const mergePreferences = (local, server, themeKeys = []) => {
  const safeLocal = normalizePreferences(local, themeKeys)
  const safeServer = normalizePreferences(server, themeKeys)
  const merged = { ...safeLocal, ...safeServer }
  if (safeLocal.fx || safeServer.fx) merged.fx = { ...(safeLocal.fx || {}), ...(safeServer.fx || {}) }
  return merged
}

/** Minimal partial patch turning `prev` into `next` (fx flags are diffed individually). */
export const diffPreferences = (prev = {}, next = {}) => {
  const patch = {}
  Object.keys(next).forEach((key) => {
    if (key === 'fx') return
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) patch[key] = next[key]
  })
  const prevFx = prev.fx || {}
  const changedFx = Object.entries(next.fx || {}).filter(([flag, value]) => prevFx[flag] !== value)
  if (changedFx.length) patch.fx = Object.fromEntries(changedFx)
  return patch
}
