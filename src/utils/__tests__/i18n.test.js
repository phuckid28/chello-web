import { describe, it, expect } from 'vitest'
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '~/utils/i18n'

describe('i18n dictionary & language config', () => {
  it('supports vi, en, ja, ko with both name and label properties', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code)
    expect(codes).toEqual(['vi', 'en', 'ja', 'ko'])
    SUPPORTED_LANGUAGES.forEach((l) => {
      expect(typeof l.name).toBe('string')
      expect(l.name.length).toBeGreaterThan(0)
      expect(typeof l.label).toBe('string')
      expect(l.label.length).toBeGreaterThan(0)
    })
  })

  it('contains matching keys across all 4 languages in TRANSLATIONS', () => {
    const viKeys = Object.keys(TRANSLATIONS.vi)
    expect(viKeys.length).toBeGreaterThan(250)
    ;['en', 'ja', 'ko'].forEach((code) => {
      viKeys.forEach((key) => {
        expect(TRANSLATIONS[code][key], `Missing key "${key}" in locale "${code}"`).toBeDefined()
      })
    })
  })
})
