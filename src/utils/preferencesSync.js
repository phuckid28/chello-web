// Side-effect layer for preference sync: reads/writes the existing local stores (persona theme,
// fx settings, i18n, density…) and debounce-saves changes via PUT /users/preferences.
// localStorage stays the offline cache; the server copy wins on login / GET /users/me.
import { ANIME_THEMES, getSavedPersonaTheme, savePersonaTheme } from '~/utils/animeTheme'
import { FX_SETTINGS_EVENT, getFxSettings, setFxSettings } from '~/fx/fxSettings'
import { getSavedBilingualMode, getSavedLanguage, setAppLanguage, setBilingualMode } from '~/utils/i18n'
import { diffPreferences, mergePreferences, normalizePreferences } from '~/utils/preferences'

export const THEME_KEYS = Object.keys(ANIME_THEMES)
export const LOCAL_PREFERENCES_EVENT = 'chella-preferences-change'
const SAVE_DEBOUNCE_MS = 1200

const LOCAL_KEYS = Object.freeze({
  density: 'chella_density',
  defaultBoardView: 'chella_default_board_view',
  reduceMotion: 'chella_reduce_motion',
  sound: 'chella_sound'
})

const readLocal = (key) => {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS[key])
    if (raw === null) return undefined
    if (raw === 'true' || raw === 'false') return raw === 'true'
    return raw
  } catch (error) {
    // Storage blocked (private mode) — preference simply stays unset locally
    return undefined
  }
}

const writeLocal = (key, value) => {
  try {
    localStorage.setItem(LOCAL_KEYS[key], String(value))
  } catch (error) {
    // Best-effort cache; the server copy remains authoritative
  }
}

/** Snapshot of everything currently applied on this device. */
export const collectLocalPreferences = () => normalizePreferences({
  theme: getSavedPersonaTheme(),
  language: getSavedLanguage(),
  bilingual: getSavedBilingualMode(),
  fx: { ...getFxSettings() },
  density: readLocal('density'),
  defaultBoardView: readLocal('defaultBoardView'),
  reduceMotion: readLocal('reduceMotion'),
  sound: readLocal('sound')
}, THEME_KEYS)

export const getLocalPreference = (key) => readLocal(key)

/** For non-store preferences (density, default board view…): cache + notify the sync loop. */
export const setLocalPreference = (key, value) => {
  if (!LOCAL_KEYS[key]) return
  writeLocal(key, value)
  window.dispatchEvent(new CustomEvent(LOCAL_PREFERENCES_EVENT, { detail: { key, value } }))
}

let applying = false

/** Applies server preferences into the existing stores without echoing a save back. */
export const applyPreferences = (serverPreferences) => {
  const local = collectLocalPreferences()
  const merged = mergePreferences(local, serverPreferences, THEME_KEYS)
  const patch = diffPreferences(local, merged)
  applying = true
  try {
    if (patch.theme) savePersonaTheme(patch.theme)
    if (patch.language) setAppLanguage(patch.language)
    if (typeof patch.bilingual === 'boolean') setBilingualMode(patch.bilingual)
    if (patch.fx) setFxSettings(patch.fx)
    Object.keys(LOCAL_KEYS).forEach((key) => {
      if (patch[key] !== undefined) writeLocal(key, patch[key])
    })
  } finally {
    applying = false
  }
  return merged
}

/**
 * Starts listening to local preference changes and debounce-saves the diff.
 * `getServerPreferences()` returns the last known server copy; `save(patch)` performs the PUT.
 * Returns a cleanup function.
 */
export const startPreferenceSync = ({ getServerPreferences, save }) => {
  let timer = null
  const flush = () => {
    timer = null
    const server = normalizePreferences(getServerPreferences(), THEME_KEYS)
    const patch = diffPreferences(server, collectLocalPreferences())
    if (Object.keys(patch).length) save(patch)
  }
  const schedule = () => {
    if (applying) return
    clearTimeout(timer)
    timer = setTimeout(flush, SAVE_DEBOUNCE_MS)
  }
  const events = ['chello-persona-change', 'chella-i18n-change', FX_SETTINGS_EVENT, LOCAL_PREFERENCES_EVENT]
  events.forEach(name => window.addEventListener(name, schedule))
  return () => {
    clearTimeout(timer)
    events.forEach(name => window.removeEventListener(name, schedule))
  }
}
