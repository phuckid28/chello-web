import { useSyncExternalStore } from 'react'
import { ANIME_THEMES, getSavedPersonaTheme, normalizeThemeKey } from '~/utils/animeTheme'

// Effective visual theme for global effects: the board's theme while a board is open,
// otherwise the user's saved persona theme.
const PERSONA_EVENT = 'chello-persona-change'
const listeners = new Set()

let personaKey = getSavedPersonaTheme()
let boardOverride = null

const emit = () => listeners.forEach(listener => listener())

export const getFxThemeKey = () => (boardOverride && ANIME_THEMES[boardOverride] ? normalizeThemeKey(boardOverride) : personaKey)

export const setBoardThemeOverride = (themeKey) => {
  const next = themeKey && ANIME_THEMES[themeKey] ? normalizeThemeKey(themeKey) : null
  if (next === boardOverride) return
  boardOverride = next
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener(PERSONA_EVENT, (event) => {
    if (event.detail && ANIME_THEMES[event.detail]) {
      personaKey = normalizeThemeKey(event.detail)
      emit()
    }
  })
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useFxThemeKey = () => useSyncExternalStore(subscribe, getFxThemeKey, getFxThemeKey)

export const useFxTheme = () => {
  const key = useFxThemeKey()
  return { key, theme: ANIME_THEMES[key] || ANIME_THEMES['sora-sky'] }
}
