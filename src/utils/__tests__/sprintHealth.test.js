import { describe, it, expect } from 'vitest'
import { HEALTH_LEVELS, computeSprintHealth, isCrDone, resolveHealthLevel } from '~/utils/sprintHealth'

const SPRINT = { startDate: '22/10/2026', endDate: '05/11/2026' }
const NOW = new Date('2026-10-29T12:00:00').getTime()

const cr = (overrides = {}) => ({ _id: Math.random().toString(36), baStatus: 'Processing', devProgress: 0, deadline: '2026-11-05', ...overrides })

describe('isCrDone', () => {
  it('treats 100% progress and Deployed/Done testing statuses as done', () => {
    expect(isCrDone(cr({ devProgress: 1 }))).toBe(true)
    expect(isCrDone(cr({ baStatus: 'Deployed' }))).toBe(true)
    expect(isCrDone(cr({ baStatus: 'Done testing' }))).toBe(true)
  })

  it('keeps in-flight CRs open', () => {
    expect(isCrDone(cr({ devProgress: 0.9, baStatus: 'In testing' }))).toBe(false)
  })
})

describe('resolveHealthLevel', () => {
  it('prioritises empty and completed states', () => {
    expect(resolveHealthLevel({ total: 0, allDone: false, started: true, finished: false, gap: 0 })).toBe(HEALTH_LEVELS.NO_DATA)
    expect(resolveHealthLevel({ total: 3, allDone: true, started: true, finished: true, gap: -1 })).toBe(HEALTH_LEVELS.COMPLETED)
  })

  it('classifies the gap between actual and expected progress', () => {
    const base = { total: 4, allDone: false, started: true, finished: false }
    expect(resolveHealthLevel({ ...base, gap: 0.05 })).toBe(HEALTH_LEVELS.ON_TRACK)
    expect(resolveHealthLevel({ ...base, gap: -0.1 })).toBe(HEALTH_LEVELS.ON_TRACK)
    expect(resolveHealthLevel({ ...base, gap: -0.2 })).toBe(HEALTH_LEVELS.AT_RISK)
    expect(resolveHealthLevel({ ...base, gap: -0.4 })).toBe(HEALTH_LEVELS.BEHIND)
  })

  it('flags unfinished work after the sprint ended and pre-start sprints', () => {
    expect(resolveHealthLevel({ total: 2, allDone: false, started: true, finished: true, gap: 0 })).toBe(HEALTH_LEVELS.BEHIND)
    expect(resolveHealthLevel({ total: 2, allDone: false, started: false, finished: false, gap: 0 })).toBe(HEALTH_LEVELS.NOT_STARTED)
  })
})

describe('computeSprintHealth', () => {
  it('reports on-track when progress keeps pace with the calendar', () => {
    const cards = [cr({ devProgress: 0.6 }), cr({ devProgress: 0.5 })]
    const health = computeSprintHealth({ cards, sprintConfig: SPRINT, now: NOW })
    expect(health.level).toBe(HEALTH_LEVELS.ON_TRACK)
    expect(health.dayCount).toBe(15)
    expect(health.dayIndex).toBe(8)
    expect(health.daysLeft).toBe(7)
    expect(health.elapsedRatio).toBeCloseTo(8 / 15, 5)
  })

  it('reports behind when most work is untouched mid-sprint', () => {
    const cards = [cr({ devProgress: 0.1 }), cr({ devProgress: 0 }), cr({ devProgress: 0.2 })]
    expect(computeSprintHealth({ cards, sprintConfig: SPRINT, now: NOW }).level).toBe(HEALTH_LEVELS.BEHIND)
  })

  it('counts overdue CRs that are not done', () => {
    const cards = [cr({ deadline: '2026-10-25' }), cr({ deadline: '2026-10-25', devProgress: 1 }), cr({ deadline: '2026-11-04' })]
    expect(computeSprintHealth({ cards, sprintConfig: SPRINT, now: NOW }).overdueCount).toBe(1)
  })

  it('builds a per-day deadline load and marks today', () => {
    const cards = [cr({ deadline: '2026-10-29' }), cr({ deadline: '2026-10-29', devProgress: 1 }), cr({ deadline: '2026-11-05' })]
    const { dueLoad } = computeSprintHealth({ cards, sprintConfig: SPRINT, now: NOW })
    expect(dueLoad).toHaveLength(15)
    const today = dueLoad.find(d => d.isToday)
    expect(today.day).toBe(29)
    expect(today.count).toBe(2)
    expect(today.done).toBe(1)
    expect(dueLoad[14].count).toBe(1)
  })

  it('ignores deadlines outside the sprint and handles a missing date range', () => {
    const health = computeSprintHealth({ cards: [cr({ deadline: '2027-01-01' })], sprintConfig: {}, now: NOW })
    expect(health.dueLoad).toEqual([])
    expect(health.daysLeft).toBeNull()
    const inRange = computeSprintHealth({ cards: [cr({ deadline: '2027-01-01' })], sprintConfig: SPRINT, now: NOW })
    expect(inRange.dueLoad.reduce((sum, d) => sum + d.count, 0)).toBe(0)
  })

  it('returns completed when every CR is done', () => {
    const cards = [cr({ devProgress: 1 }), cr({ baStatus: 'Deployed' })]
    expect(computeSprintHealth({ cards, sprintConfig: SPRINT, now: NOW }).level).toBe(HEALTH_LEVELS.COMPLETED)
  })

  it('reports no data without cards', () => {
    expect(computeSprintHealth({ cards: [], sprintConfig: SPRINT, now: NOW }).level).toBe(HEALTH_LEVELS.NO_DATA)
  })
})
