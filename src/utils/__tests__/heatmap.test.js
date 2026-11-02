import { describe, it, expect } from 'vitest'
import {
  addDays,
  buildHeatmap,
  computeStreaks,
  intensityLevel,
  parseDateKey,
  toDateKey
} from '../heatmap'

const flatCells = (grid) => grid.weeks.flat().filter(Boolean)

describe('heatmap date helpers', () => {
  it('parses and formats YYYY-MM-DD keys in UTC without timezone drift', () => {
    const ms = parseDateKey('2026-03-08')
    expect(new Date(ms).toISOString()).toBe('2026-03-08T00:00:00.000Z')
    expect(toDateKey(ms)).toBe('2026-03-08')
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('returns null for malformed keys', () => {
    expect(parseDateKey('2026/03/08')).toBeNull()
    expect(parseDateKey('')).toBeNull()
  })
})

describe('intensityLevel', () => {
  it('maps zero to level 0 and the max to level 4', () => {
    expect(intensityLevel(0, 10)).toBe(0)
    expect(intensityLevel(10, 10)).toBe(4)
  })

  it('maps small non-zero counts to at least level 1', () => {
    expect(intensityLevel(1, 100)).toBe(1)
    expect(intensityLevel(50, 100)).toBe(2)
    expect(intensityLevel(51, 100)).toBe(3)
  })

  it('returns 0 when there is no activity at all', () => {
    expect(intensityLevel(0, 0)).toBe(0)
  })
})

describe('buildHeatmap', () => {
  it('builds 53 week columns of 7 days ending in the week containing today (Sunday start)', () => {
    // 2026-11-02 is a Monday
    const grid = buildHeatmap({ days: [], today: '2026-11-02' })
    expect(grid.weeks).toHaveLength(53)
    grid.weeks.forEach((week) => expect(week).toHaveLength(7))
    const lastWeek = grid.weeks[52]
    expect(lastWeek[0].date).toBe('2026-11-01') // Sunday
    expect(lastWeek[1].date).toBe('2026-11-02') // today
    expect(lastWeek[2]).toBeNull() // future
  })

  it('supports Monday-start weeks', () => {
    const grid = buildHeatmap({ days: [], today: '2026-11-02', weekStart: 1 })
    const lastWeek = grid.weeks[grid.weeks.length - 1]
    expect(lastWeek[0].date).toBe('2026-11-02')
    expect(lastWeek.slice(1).every((c) => c === null)).toBe(true)
  })

  it('fills missing days with 0 and keeps counts for known days', () => {
    const grid = buildHeatmap({
      days: [{ date: '2026-11-01', count: 3 }, { date: '2026-10-30', count: 6 }],
      today: '2026-11-02'
    })
    const byDate = Object.fromEntries(flatCells(grid).map((c) => [c.date, c]))
    expect(byDate['2026-11-01'].count).toBe(3)
    expect(byDate['2026-10-31'].count).toBe(0)
    expect(byDate['2026-10-31'].level).toBe(0)
    expect(byDate['2026-10-30'].level).toBe(4)
    expect(grid.total).toBe(9)
    expect(grid.max).toBe(6)
  })

  it('ignores invalid entries and dates outside the grid', () => {
    const grid = buildHeatmap({
      days: [{ date: 'bad', count: 5 }, { date: '2020-01-01', count: 9 }, { date: '2026-11-02', count: -2 }],
      today: '2026-11-02'
    })
    expect(grid.total).toBe(0)
  })

  it('accepts a Date for today using its local calendar day', () => {
    const today = new Date(2026, 10, 2, 23, 30)
    const grid = buildHeatmap({ days: [], today })
    const last = flatCells(grid).pop()
    expect(last.date).toBe('2026-11-02')
  })

  it('emits month labels at the first column of each new month', () => {
    const grid = buildHeatmap({ days: [], today: '2026-11-02' })
    const months = grid.monthLabels.map((m) => m.month)
    expect(months[months.length - 1]).toBe(10) // November
    grid.monthLabels.forEach((label, i) => {
      if (i > 0) expect(label.weekIndex - grid.monthLabels[i - 1].weekIndex).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('computeStreaks', () => {
  it('computes longest and current streak (current may start yesterday)', () => {
    expect(computeStreaks([1, 1, 1, 0, 2, 0, 0])).toEqual({ longest: 3, current: 0 })
    expect(computeStreaks([0, 1, 1])).toEqual({ longest: 2, current: 2 })
    expect(computeStreaks([1, 1, 0])).toEqual({ longest: 2, current: 2 })
    expect(computeStreaks([])).toEqual({ longest: 0, current: 0 })
  })

  it('exposes streaks on the built heatmap', () => {
    const grid = buildHeatmap({
      days: [
        { date: '2026-10-31', count: 1 },
        { date: '2026-11-01', count: 2 },
        { date: '2026-11-02', count: 1 }
      ],
      today: '2026-11-02'
    })
    expect(grid.currentStreak).toBe(3)
    expect(grid.longestStreak).toBe(3)
  })
})
