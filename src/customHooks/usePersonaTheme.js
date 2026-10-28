import { useState, useEffect } from 'react'
import { ANIME_THEMES, getSavedPersonaTheme, savePersonaTheme } from '~/utils/animeTheme'

export const usePersonaTheme = (boardThemeOverride = null) => {
  const [personaKey, setPersonaKey] = useState(getSavedPersonaTheme)

  useEffect(() => {
    const handlePersonaChange = (event) => {
      if (event.detail && ANIME_THEMES[event.detail]) {
        setPersonaKey(event.detail)
      }
    }
    window.addEventListener('chello-persona-change', handlePersonaChange)
    return () => window.removeEventListener('chello-persona-change', handlePersonaChange)
  }, [])

  const effectiveKey = (boardThemeOverride && ANIME_THEMES[boardThemeOverride])
    ? boardThemeOverride
    : personaKey

  const changePersona = (newKey) => {
    savePersonaTheme(newKey)
    setPersonaKey(newKey)
  }

  return {
    personaKey: effectiveKey,
    globalPersonaKey: personaKey,
    themeConfig: ANIME_THEMES[effectiveKey] || ANIME_THEMES.furina,
    changePersona
  }
}
