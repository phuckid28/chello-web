import { useState, useEffect } from 'react'
import { ANIME_THEMES, getSavedPersonaTheme, savePersonaTheme, normalizeThemeKey } from '~/utils/animeTheme'

// Theme templates control the visual appearance of the entire web app globally.
// Individual Sprint boards all share the same unified structure and inherit the active web app theme.
export const usePersonaTheme = () => {
  const [personaKey, setPersonaKey] = useState(getSavedPersonaTheme)

  useEffect(() => {
    const handlePersonaChange = (event) => {
      if (event.detail && ANIME_THEMES[event.detail]) {
        setPersonaKey(normalizeThemeKey(event.detail))
      }
    }
    window.addEventListener('chello-persona-change', handlePersonaChange)
    return () => window.removeEventListener('chello-persona-change', handlePersonaChange)
  }, [])

  const changePersona = (newKey) => {
    const normalized = normalizeThemeKey(newKey)
    savePersonaTheme(normalized)
    setPersonaKey(normalized)
  }

  return {
    personaKey,
    globalPersonaKey: personaKey,
    themeConfig: ANIME_THEMES[personaKey] || ANIME_THEMES['sora-sky'],
    changePersona
  }
}
