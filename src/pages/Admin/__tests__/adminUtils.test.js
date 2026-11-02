import { describe, it, expect } from 'vitest'
import {
  isUserLocked,
  patchUserInList,
  replaceUserInList,
  appendUniqueUsers,
  normalizeUsersPage,
  buildSignupChart
} from '~/pages/Admin/adminUtils'

describe('isUserLocked', () => {
  it('is true only while lockedUntil is in the future', () => {
    expect(isUserLocked({ lockedUntil: 2000 }, 1000)).toBe(true)
    expect(isUserLocked({ lockedUntil: 500 }, 1000)).toBe(false)
    expect(isUserLocked({ lockedUntil: null }, 1000)).toBe(false)
    expect(isUserLocked(null, 1000)).toBe(false)
  })
})

describe('user list updates', () => {
  const users = Object.freeze([Object.freeze({ _id: 'a', isActive: true }), Object.freeze({ _id: 'b', isActive: true })])

  it('patches one user immutably', () => {
    const next = patchUserInList(users, 'b', { isActive: false })
    expect(next).not.toBe(users)
    expect(next[1]).toEqual({ _id: 'b', isActive: false })
    expect(next[0]).toBe(users[0])
  })

  it('replaces a user by id, merging server fields', () => {
    const next = replaceUserInList(users, { _id: 'a', isActive: false, role: 'admin' })
    expect(next[0]).toEqual({ _id: 'a', isActive: false, role: 'admin' })
  })

  it('ignores replacements without an id', () => {
    expect(replaceUserInList(users, null)).toBe(users)
  })

  it('appends a page without duplicating ids', () => {
    const next = appendUniqueUsers(users, [{ _id: 'b' }, { _id: 'c' }])
    expect(next.map((u) => u._id)).toEqual(['a', 'b', 'c'])
  })
})

describe('normalizeUsersPage', () => {
  it('accepts the paginated shape', () => {
    expect(normalizeUsersPage({ items: [{ _id: 'a' }], nextCursor: 'a' })).toEqual({ items: [{ _id: 'a' }], nextCursor: 'a' })
  })

  it('accepts a bare array and garbage', () => {
    expect(normalizeUsersPage([{ _id: 'a' }])).toEqual({ items: [{ _id: 'a' }], nextCursor: null })
    expect(normalizeUsersPage(undefined)).toEqual({ items: [], nextCursor: null })
  })
})

describe('buildSignupChart', () => {
  const size = { width: 300, height: 100, padding: { top: 10, right: 10, bottom: 20, left: 30 } }

  it('scales bars to the max count inside the plot area', () => {
    const chart = buildSignupChart([{ date: '2026-11-01', count: 2 }, { date: '2026-11-02', count: 4 }], size)
    expect(chart.max).toBe(4)
    expect(chart.bars).toHaveLength(2)
    const [first, second] = chart.bars
    expect(second.height).toBeCloseTo(70)
    expect(first.height).toBeCloseTo(35)
    expect(second.y + second.height).toBeCloseTo(80)
    expect(first.x).toBeGreaterThanOrEqual(30)
    expect(second.x + second.width).toBeLessThanOrEqual(290)
  })

  it('returns integer ticks and handles an all-zero / empty series', () => {
    const chart = buildSignupChart([{ date: 'd', count: 0 }], size)
    expect(chart.max).toBe(0)
    expect(chart.bars[0].height).toBe(0)
    expect(chart.ticks.every(Number.isInteger)).toBe(true)
    expect(buildSignupChart(undefined, size).bars).toEqual([])
  })

  it('ignores invalid counts and thins x labels for long series', () => {
    const series = Array.from({ length: 30 }, (_, i) => ({ date: `d${i}`, count: i === 3 ? 'x' : 1 }))
    const chart = buildSignupChart(series, size)
    expect(chart.bars[3].count).toBe(0)
    expect(chart.bars.filter((bar) => bar.showLabel).length).toBeLessThanOrEqual(8)
  })
})
