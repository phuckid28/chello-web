import { describe, it, expect } from 'vitest'
import { V7_TRANSLATIONS } from '~/utils/i18nV7'
import { TRANSLATIONS } from '~/utils/i18n'

const CODES = ['vi', 'en', 'ja', 'ko']

describe('i18n v7 dictionary', () => {
  it('has exactly the same keys in vi, en, ja and ko', () => {
    const viKeys = Object.keys(V7_TRANSLATIONS.vi).sort()
    CODES.forEach((code) => {
      expect(Object.keys(V7_TRANSLATIONS[code]).sort(), `key set mismatch in "${code}"`).toEqual(viKeys)
    })
  })

  it('has no empty translations', () => {
    CODES.forEach((code) => {
      Object.entries(V7_TRANSLATIONS[code]).forEach(([key, value]) => {
        expect(typeof value === 'string' && value.trim().length > 0, `empty "${key}" in "${code}"`).toBe(true)
      })
    })
  })

  it('is merged into the global TRANSLATIONS', () => {
    CODES.forEach((code) => {
      expect(TRANSLATIONS[code].v7Save).toBe(V7_TRANSLATIONS[code].v7Save)
    })
  })
})
