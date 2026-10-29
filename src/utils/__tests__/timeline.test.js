import { describe, it, expect } from 'vitest'
import { DAY_MS, buildTimelineModel, computeBar, parseSprintDate, resolveTimelineRange } from '~/utils/timeline'

const SPRINT = { startDate: '22/10/2026', endDate: '05/11/2026' }
const NOW = new Date('2026-10-29T12:00:00').getTime()

describe('parseSprintDate', () => {
  it('parses DD/MM/YYYY, DD/MM and ISO dates to local midnight', () => {
    expect(parseSprintDate('22/10/2026')).toBe(new Date(2026, 9, 22).getTime())
    expect(parseSprintDate('5/11', 2026)).toBe(new Date(2026, 10, 5).getTime())
    expect(parseSprintDate('2026-10-22T15:00:00')).toBe(new Date(2026, 9, 22).getTime())
  })

  it('returns null for empty or invalid values', () => {
    expect(parseSprintDate('')).toBeNull()
    expect(parseSprintDate('not a date')).toBeNull()
  })
})

describe('resolveTimelineRange', () => {
  it('spans the full sprint inclusive of the last day', () => {
    const { rangeStart, rangeEnd } = resolveTimelineRange(SPRINT, NOW)
    expect(rangeStart).toBe(new Date(2026, 9, 22).getTime())
    expect(rangeEnd).toBe(new Date(2026, 10, 6).getTime() - 1)
  })

  it('falls back to a 15-day window around today when the sprint is invalid', () => {
    const { rangeStart, rangeEnd } = resolveTimelineRange({ startDate: 'x' }, NOW)
    expect(Math.round((rangeEnd - rangeStart) / DAY_MS)).toBe(15)
  })
})

describe('computeBar', () => {
  const { rangeStart, rangeEnd } = resolveTimelineRange(SPRINT, NOW)

  it('draws from sprint start to deadline when no start date exists', () => {
    const bar = computeBar({ deadline: '05/11/2026' }, rangeStart, rangeEnd)
    expect(bar.startPct).toBe(0)
    expect(bar.widthPct).toBeGreaterThan(95)
    expect(bar.hasDeadline).toBe(true)
  })

  it('clips bars that start before the sprint', () => {
    const bar = computeBar({ startDate: new Date(2026, 8, 1).getTime(), deadline: '25/10/2026' }, rangeStart, rangeEnd)
    expect(bar.clippedStart).toBe(true)
    expect(bar.startPct).toBe(0)
  })

  it('keeps a minimum visible width for same-day CRs', () => {
    const bar = computeBar({ startDate: new Date(2026, 9, 28).getTime(), deadline: '28/10/2026' }, rangeStart, rangeEnd)
    expect(bar.widthPct).toBeGreaterThanOrEqual(1.5)
  })
})

describe('buildTimelineModel', () => {
  it('groups CRs by topic and exposes a today marker inside the sprint', () => {
    const model = buildTimelineModel({
      sprintConfig: SPRINT,
      now: NOW,
      items: [
        { card: { _id: 'a', deadline: '30/10/2026' }, columnTitle: 'Usage Limit' },
        { card: { _id: 'b', deadline: '01/11/2026' }, columnTitle: 'Usage Limit' },
        { card: { _id: 'c', FE_PlaceholderCard: true }, columnTitle: 'Empty' }
      ]
    })
    expect(model.days).toHaveLength(15)
    expect(model.groups).toHaveLength(1)
    expect(model.groups[0].rows).toHaveLength(2)
    expect(model.todayPct).toBeGreaterThan(0)
    expect(model.todayPct).toBeLessThan(100)
  })
})
