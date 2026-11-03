import { describe, it, expect } from 'vitest'
import {
  isUserLocked,
  patchUserInList,
  replaceUserInList,
  appendUniqueUsers,
  normalizeUsersPage,
  buildSignupChart,
  formatBytes,
  formatUptime,
  buildDualLineChart,
  buildStackedStatusChart,
  getThreatBadgeMeta
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

describe('v8 observability formatters & SVG chart builders', () => {
  const size = { width: 400, height: 140, padding: { top: 10, right: 10, bottom: 20, left: 40 } }

  it('formats bytes and uptime human-readably', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
    expect(formatUptime(125)).toBe('2m 5s')
    expect(formatUptime(90061)).toBe('1d 1h 1m')
  })

  it('builds dual-line SVG paths for Bytes In vs Bytes Out', () => {
    const series = [
      { label: '10:00', bytesIn: 1000, bytesOut: 4000 },
      { label: '10:01', bytesIn: 2500, bytesOut: 8000 },
      { label: '10:02', bytesIn: 500, bytesOut: 2000 }
    ]
    const chart = buildDualLineChart(series, { ...size, keyA: 'bytesIn', keyB: 'bytesOut' })
    expect(chart.max).toBe(8000)
    expect(chart.points).toHaveLength(3)
    expect(chart.pathA).toContain('M ')
    expect(chart.pathB).toContain('L ')
    expect(chart.areaA).toContain('Z')
  })

  it('builds stacked HTTP status bars (2xx, 4xx, 429, 5xx)', () => {
    const series = [
      { label: '10:00', status2xx: 10, status3xx: 2, status4xx: 3, status429: 1, status5xx: 0 },
      { label: '10:01', status2xx: 20, status3xx: 0, status4xx: 5, status429: 4, status5xx: 1 }
    ]
    const chart = buildStackedStatusChart(series, size)
    expect(chart.max).toBe(30)
    expect(chart.columns).toHaveLength(2)
    expect(chart.columns[1].total).toBe(30)
    expect(chart.columns[1].segments.length).toBeGreaterThan(0)
  })

  it('maps threat levels to badge colors and label keys', () => {
    expect(getThreatBadgeMeta('critical').color).toBe('error')
    expect(getThreatBadgeMeta('high').color).toBe('warning')
    expect(getThreatBadgeMeta('normal').color).toBe('success')
  })
})
