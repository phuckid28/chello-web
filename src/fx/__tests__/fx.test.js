import { describe, it, expect } from 'vitest'
import { getRouteTone, getTransitionKey } from '~/fx/routeTransition'
import { DEFAULT_FX_SETTINGS, normalizeFxSettings } from '~/fx/fxSettings'
import { getRevealRadius } from '~/fx/themeReveal'
import { buildBurst, capParticles, createParticle, getMotion, particleAlpha, shouldEmitTrail, stepParticle } from '~/fx/particles'
import { buildCursorValues } from '~/fx/cursorArt'
import { PRIMARY_THEME_KEYS } from '~/utils/animeTheme'

describe('route transitions', () => {
  it('maps routes to a tone', () => {
    expect(getRouteTone('/boards')).toBe('list')
    expect(getRouteTone('/boards/abc')).toBe('board')
    expect(getRouteTone('/boards/abc/cr/123')).toBe('cr')
    expect(getRouteTone('/boards/abc/wiki/p1')).toBe('wiki')
    expect(getRouteTone('/settings/security')).toBe('settings')
  })

  it('keeps one key across Knowledge Hub pages and settings tabs', () => {
    expect(getTransitionKey('/boards/abc/wiki')).toBe(getTransitionKey('/boards/abc/wiki/p9'))
    expect(getTransitionKey('/settings/account')).toBe(getTransitionKey('/settings/appearance'))
    expect(getTransitionKey('/boards/abc')).not.toBe(getTransitionKey('/boards/def'))
  })
})

describe('fx settings', () => {
  it('falls back to defaults and drops unknown keys', () => {
    expect(normalizeFxSettings(null)).toEqual(DEFAULT_FX_SETTINGS)
    expect(normalizeFxSettings({ cursor: false, bogus: true, trail: 'yes' })).toEqual({ ...DEFAULT_FX_SETTINGS, cursor: false })
  })
})

describe('theme reveal', () => {
  it('reaches the farthest viewport corner', () => {
    expect(getRevealRadius(0, 0, 300, 400)).toBe(500)
    expect(getRevealRadius(150, 200, 300, 400)).toBeCloseTo(Math.hypot(150, 200), 5)
  })
})

describe('particles', () => {
  const colors = { accent: '#fff', secondary: '#000' }

  it('expires particles when their life runs out', () => {
    const p = createParticle({ x: 0, y: 0, vx: 1, vy: 0, life: 2, size: 3, glyph: null, color: '#fff', motion: getMotion('cosmos') })
    expect(stepParticle(p, 1)).not.toBeNull()
    expect(stepParticle(p, 3)).toBeNull()
  })

  it('does not mutate the previous particle state', () => {
    const p = createParticle({ x: 5, y: 5, vx: 2, vy: 0, life: 10, size: 3, glyph: null, color: '#fff', motion: getMotion('furina') })
    const next = stepParticle(p, 1)
    expect(p.x).toBe(5)
    expect(next.x).toBeGreaterThan(5)
  })

  it('builds the requested number of burst particles', () => {
    expect(buildBurst({ x: 0, y: 0, themeKey: 'nahida', colors, symbols: ['🌿'], count: 7 })).toHaveLength(7)
  })

  it('throttles trail emission by distance', () => {
    expect(shouldEmitTrail(null, 0, 0)).toBe(true)
    expect(shouldEmitTrail({ x: 0, y: 0 }, 5, 5)).toBe(false)
    expect(shouldEmitTrail({ x: 0, y: 0 }, 30, 0)).toBe(true)
  })

  it('caps the particle pool and keeps alpha within 0..1', () => {
    const many = Array.from({ length: 400 }, () => createParticle({ x: 0, y: 0, vx: 0, vy: 0, life: 10, size: 2, glyph: null, color: '#fff', motion: getMotion('x') }))
    expect(capParticles(many).length).toBeLessThanOrEqual(180)
    const alpha = particleAlpha(many[0])
    expect(alpha).toBeGreaterThanOrEqual(0)
    expect(alpha).toBeLessThanOrEqual(1)
  })
})

describe('cursor art', () => {
  it('produces an arrow and pointer cursor for every primary theme', () => {
    PRIMARY_THEME_KEYS.forEach(key => {
      const { defaultCursor, pointerCursor } = buildCursorValues(key, { accent: '#38bdf8', secondary: '#f472b6' })
      expect(defaultCursor).toMatch(/^url\("data:image\/svg\+xml,.+"\) 4 3, auto$/)
      expect(pointerCursor).toMatch(/, pointer$/)
      expect(defaultCursor).not.toBe(pointerCursor)
    })
  })
})
