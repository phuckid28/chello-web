import { useState, useEffect, useCallback } from 'react'
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  getSavedBilingualMode,
  getSavedLanguage,
  getSavedSecondaryLanguage,
  setAppLanguage,
  setBilingualMode,
  setSecondaryLanguage
} from '~/utils/i18n'

export const useTranslation = () => {
  const [lang, setLangState] = useState(getSavedLanguage)
  const [secondaryLang, setSecondaryLangState] = useState(getSavedSecondaryLanguage)
  const [bilingual, setBilingualState] = useState(getSavedBilingualMode)

  useEffect(() => {
    const handleChange = (e) => {
      if (e.detail) {
        setLangState(e.detail.lang || getSavedLanguage())
        setSecondaryLangState(e.detail.secondaryLang || getSavedSecondaryLanguage())
        setBilingualState(Boolean(e.detail.bilingual))
      }
    }
    window.addEventListener('chella-i18n-change', handleChange)
    return () => window.removeEventListener('chella-i18n-change', handleChange)
  }, [])

  const t = useCallback((key, fallback = '') => {
    const primaryDict = TRANSLATIONS[lang] || TRANSLATIONS.vi
    const primaryText = primaryDict[key] || TRANSLATIONS.en[key] || fallback || key

    if (!bilingual) return primaryText

    const effectiveSecondary = secondaryLang === lang
      ? (lang === 'en' ? 'vi' : 'en')
      : secondaryLang
    const secondaryDict = TRANSLATIONS[effectiveSecondary] || TRANSLATIONS.en
    const secondaryText = secondaryDict[key]

    if (!secondaryText || secondaryText === primaryText) {
      return primaryText
    }
    return `${primaryText} • ${secondaryText}`
  }, [lang, secondaryLang, bilingual])

  const tPrimary = useCallback((key, fallback = '') => {
    const primaryDict = TRANSLATIONS[lang] || TRANSLATIONS.vi
    return primaryDict[key] || TRANSLATIONS.en[key] || fallback || key
  }, [lang])

  const formatMessage = useCallback((keyOrTemplate = '', vars = {}) => {
    const primaryDict = TRANSLATIONS[lang] || TRANSLATIONS.vi
    const template = primaryDict[keyOrTemplate] || TRANSLATIONS.en[keyOrTemplate] || String(keyOrTemplate)
    return String(template).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
  }, [lang])

  return {
    lang,
    secondaryLang,
    bilingual,
    t,
    tPrimary,
    formatMessage,
    changeLanguage: setAppLanguage,
    changeSecondaryLanguage: setSecondaryLanguage,
    toggleBilingual: () => setBilingualMode(!bilingual),
    languages: SUPPORTED_LANGUAGES
  }
}
