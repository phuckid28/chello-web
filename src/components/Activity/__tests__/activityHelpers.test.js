import { describe, it, expect } from 'vitest'
import {
  activityTargetPath,
  activityVerbKey,
  formatRelativeTime,
  groupByDay,
  relativeDayName,
  toDayKey
} from '~/components/Activity/activityHelpers'

const NOW = new Date(2026, 10, 2, 12, 0, 0).getTime()

describe('formatRelativeTime', () => {
  it('formats past timestamps in the requested language', () => {
    expect(formatRelativeTime(NOW - 5 * 60 * 1000, 'en', NOW)).toBe('5 minutes ago')
    expect(formatRelativeTime(NOW - 10 * 1000, 'en', NOW)).toBe('now')
    expect(formatRelativeTime(NOW - 3 * 3600 * 1000, 'en', NOW)).toBe('3 hours ago')
  })

  it('returns an empty string for invalid input', () => {
    expect(formatRelativeTime(null, 'en', NOW)).toBe('')
    expect(formatRelativeTime('nope', 'en', NOW)).toBe('')
  })
})

describe('groupByDay', () => {
  it('groups consecutive items by local day', () => {
    const items = [
      { id: 1, createdAt: NOW },
      { id: 2, createdAt: NOW - 3600 * 1000 },
      { id: 3, createdAt: NOW - 30 * 3600 * 1000 }
    ]
    const groups = groupByDay(items)
    expect(groups.map(g => g.items.length)).toEqual([2, 1])
    expect(groups[0].key).toBe(toDayKey(NOW))
  })
})

describe('relativeDayName', () => {
  it('names today and yesterday', () => {
    expect(relativeDayName(toDayKey(NOW), NOW)).toBe('today')
    expect(relativeDayName(toDayKey(NOW - 24 * 3600 * 1000), NOW)).toBe('yesterday')
    expect(relativeDayName('2020-01-01', NOW)).toBeNull()
  })
})

describe('activity verbs and targets', () => {
  it('maps verbs to i18n keys with a generic fallback', () => {
    expect(activityVerbKey('card_moved')).toBe('collabVerbCardMoved')
    expect(activityVerbKey('unknown')).toBe('collabVerbGeneric')
  })

  it('links cards to the CR studio', () => {
    expect(activityTargetPath({ boardId: 'b', cardId: 'c' })).toBe('/boards/b/cr/c')
    expect(activityTargetPath({ boardId: 'b', verb: 'board_created' })).toBeNull()
  })
})
