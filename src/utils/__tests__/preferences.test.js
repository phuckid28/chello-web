import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  mergePreferences,
  diffPreferences
} from '~/utils/preferences'

const THEMES = ['sora-sky', 'cosmos', 'wind']

describe('normalizePreferences', () => {
  it('drops unknown keys and invalid enum values', () => {
    const result = normalizePreferences({
      theme: 'nope',
      language: 'fr',
      density: 'tiny',
      defaultBoardView: 'graph',
      hacker: true
    }, THEMES)
    expect(result).toEqual({ defaultBoardView: 'graph' })
  })

  it('keeps valid values including nested fx booleans', () => {
    const result = normalizePreferences({
      theme: 'cosmos',
      language: 'ja',
      bilingual: true,
      density: 'compact',
      reduceMotion: false,
      sound: true,
      fx: { cursor: false, trail: 'yes', sparkles: true }
    }, THEMES)
    expect(result).toEqual({
      theme: 'cosmos',
      language: 'ja',
      bilingual: true,
      density: 'compact',
      reduceMotion: false,
      sound: true,
      fx: { cursor: false, sparkles: true }
    })
  })

  it('returns an empty object for garbage input', () => {
    expect(normalizePreferences(null, THEMES)).toEqual({})
    expect(normalizePreferences('x', THEMES)).toEqual({})
  })
})

describe('mergePreferences', () => {
  it('lets server values win over the local cache', () => {
    const local = { theme: 'sora-sky', language: 'vi', fx: { cursor: true, trail: true } }
    const server = { theme: 'wind', fx: { trail: false } }
    expect(mergePreferences(local, server, THEMES)).toEqual({
      theme: 'wind',
      language: 'vi',
      fx: { cursor: true, trail: false }
    })
  })

  it('falls back to local values when the server has none (first sync)', () => {
    const local = { theme: 'cosmos', language: 'en' }
    expect(mergePreferences(local, undefined, THEMES)).toEqual(local)
  })

  it('ignores invalid server values instead of applying them', () => {
    const local = { theme: 'cosmos', density: 'comfortable' }
    expect(mergePreferences(local, { theme: 'evil', density: 'huge' }, THEMES)).toEqual(local)
  })

  it('does not mutate its inputs', () => {
    const local = Object.freeze({ fx: Object.freeze({ cursor: true }) })
    const server = Object.freeze({ fx: Object.freeze({ trail: false }) })
    expect(() => mergePreferences(local, server, THEMES)).not.toThrow()
  })
})

describe('diffPreferences', () => {
  it('returns only changed top-level keys and changed fx flags', () => {
    const prev = { theme: 'cosmos', language: 'vi', fx: { cursor: true, trail: true } }
    const next = { theme: 'wind', language: 'vi', fx: { cursor: true, trail: false } }
    expect(diffPreferences(prev, next)).toEqual({ theme: 'wind', fx: { trail: false } })
  })

  it('returns an empty patch when nothing changed', () => {
    const prefs = { theme: 'cosmos', fx: { cursor: true } }
    expect(diffPreferences(prefs, { ...prefs, fx: { ...prefs.fx } })).toEqual({})
  })

  it('exposes sane defaults', () => {
    expect(DEFAULT_PREFERENCES.density).toBe('comfortable')
    expect(DEFAULT_PREFERENCES.defaultBoardView).toBe('overview')
  })
})
