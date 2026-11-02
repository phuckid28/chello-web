import { useSyncExternalStore } from 'react'
import { ANIME_THEMES, getSavedPersonaTheme, normalizeThemeKey } from '~/utils/animeTheme'

// Effective visual theme for global effects: strictly follows the user's global web app theme.
const PERSONA_EVENT = 'chello-persona-change'
const listeners = new Set()

let personaKey = getSavedPersonaTheme()

const emit = () => listeners.forEach(listener => listener())

export const getFxThemeKey = () => personaKey

// Kept as a no-op for backward compatibility: boards no longer override the global web app theme.
export const setBoardThemeOverride = () => {}

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
