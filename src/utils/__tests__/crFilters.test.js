import { describe, it, expect } from 'vitest'
import {
  EMPTY_CR_FILTERS,
  applyFiltersToColumns,
  cardMatchesFilters,
  countActiveFilters
} from '~/utils/crFilters'

const NOW = new Date('2026-10-29T10:00:00').getTime()

const card = (overrides) => ({
  _id: 'c1',
  title: 'Usage Limit monthly sync',
  crCode: 'BNPL-945',
  assignee: 'Ho Thao Dieu, Hoang Vinh Son',
  baStatus: 'Processing',
  priority: 'high',
  deadline: '05/11/2026',
  ...overrides
})

describe('countActiveFilters', () => {
  it('returns 0 for the empty filter set', () => {
    expect(countActiveFilters(EMPTY_CR_FILTERS)).toBe(0)
  })

  it('counts each non-empty dimension once', () => {
    expect(countActiveFilters({ text: 'bnpl', assignees: ['A', 'B'], deadline: 'overdue' })).toBe(3)
  })

  it('ignores whitespace-only text and invalid deadline values', () => {
    expect(countActiveFilters({ text: '   ', deadline: 'bogus' })).toBe(0)
  })
})

describe('cardMatchesFilters', () => {
  it('matches text against Ticket ID, title and assignee (case-insensitive)', () => {
    expect(cardMatchesFilters(card(), { text: 'bnpl-945' }, NOW)).toBe(true)
    expect(cardMatchesFilters(card(), { text: 'hoang vinh' }, NOW)).toBe(true)
    expect(cardMatchesFilters(card(), { text: 'scoring' }, NOW)).toBe(false)
  })

  it('matches any selected Handle by member', () => {
    expect(cardMatchesFilters(card(), { assignees: ['Hoang Vinh Son'] }, NOW)).toBe(true)
    expect(cardMatchesFilters(card(), { assignees: ['Vo Viet Binh'] }, NOW)).toBe(false)
  })

  it('supports the unassigned pseudo-member', () => {
    expect(cardMatchesFilters(card({ assignee: '' }), { assignees: ['__unassigned__'] }, NOW)).toBe(true)
    expect(cardMatchesFilters(card(), { assignees: ['__unassigned__'] }, NOW)).toBe(false)
  })

  it('normalizes status and priority before comparing', () => {
    expect(cardMatchesFilters(card({ baStatus: 'UAT' }), { statuses: ['In testing'] }, NOW)).toBe(true)
    expect(cardMatchesFilters(card({ priority: 'P1' }), { priorities: ['high'] }, NOW)).toBe(true)
    expect(cardMatchesFilters(card(), { priorities: ['low'] }, NOW)).toBe(false)
  })

  it('filters by deadline buckets including at-risk', () => {
    const overdue = card({ deadline: '20/10/2026' })
    const soon = card({ deadline: '30/10/2026' })
    const later = card({ deadline: '05/11/2026' })
    expect(cardMatchesFilters(overdue, { deadline: 'overdue' }, NOW)).toBe(true)
    expect(cardMatchesFilters(soon, { deadline: 'due-soon' }, NOW)).toBe(true)
    expect(cardMatchesFilters(later, { deadline: 'at-risk' }, NOW)).toBe(false)
    expect(cardMatchesFilters(overdue, { deadline: 'at-risk' }, NOW)).toBe(true)
  })

  it('always keeps placeholder cards so empty columns stay droppable', () => {
    expect(cardMatchesFilters({ FE_PlaceholderCard: true }, { text: 'zzz' }, NOW)).toBe(true)
  })
})

describe('applyFiltersToColumns', () => {
  const columns = [{ _id: 'col', title: 'Topic', cards: [card(), card({ _id: 'c2', crCode: 'BNPL-946', title: 'Scoring' })] }]

  it('returns the same reference when no filter is active', () => {
    expect(applyFiltersToColumns(columns, EMPTY_CR_FILTERS, NOW)).toBe(columns)
  })

  it('returns new columns without mutating the input', () => {
    const result = applyFiltersToColumns(columns, { text: 'scoring' }, NOW)
    expect(result[0].cards).toHaveLength(1)
    expect(result[0].cards[0]._id).toBe('c2')
    expect(columns[0].cards).toHaveLength(2)
  })
})
