import { describe, it, expect } from 'vitest'
import { cardPath, dueBucket, groupByBoard, groupByDueBucket, upcomingByDay } from '~/pages/MyWork/myWorkHelpers'

const NOW = new Date(2026, 10, 2, 10, 0, 0).getTime() // 2 Nov 2026 10:00 local
const at = (day, hour = 12) => new Date(2026, 10, day, hour, 0, 0).getTime()

describe('dueBucket', () => {
  it('classifies due dates relative to today', () => {
    expect(dueBucket(at(1), NOW)).toBe('overdue')
    expect(dueBucket(at(2, 8), NOW)).toBe('today')
    expect(dueBucket(at(5), NOW)).toBe('week')
    expect(dueBucket(at(20), NOW)).toBe('later')
    expect(dueBucket(null, NOW)).toBe('none')
    expect(dueBucket('not a date', NOW)).toBe('none')
  })
})

describe('groupByDueBucket', () => {
  it('keeps bucket order, omits empty buckets and sorts by due date', () => {
    const items = [
      { cardId: 'c', dueDate: at(6) },
      { cardId: 'a', dueDate: null },
      { cardId: 'b', dueDate: at(3) },
      { cardId: 'd', dueDate: at(1) }
    ]
    const groups = groupByDueBucket(items, NOW)
    expect(groups.map(g => g.key)).toEqual(['overdue', 'week', 'none'])
    expect(groups[1].items.map(i => i.cardId)).toEqual(['b', 'c'])
  })
})

describe('groupByBoard', () => {
  it('groups by board and sorts by title', () => {
    const groups = groupByBoard([
      { boardId: 'b2', boardTitle: 'Zeta', cardId: '1' },
      { boardId: 'b1', boardTitle: 'Alpha', cardId: '2' },
      { boardId: 'b2', boardTitle: 'Zeta', cardId: '3' }
    ])
    expect(groups.map(g => g.title)).toEqual(['Alpha', 'Zeta'])
    expect(groups[1].items).toHaveLength(2)
  })
})

describe('upcomingByDay', () => {
  it('returns only the next 14 days grouped per day', () => {
    const groups = upcomingByDay([
      { cardId: 'past', dueDate: at(1) },
      { cardId: 'x', dueDate: at(3, 9) },
      { cardId: 'y', dueDate: at(3, 15) },
      { cardId: 'z', dueDate: at(10) },
      { cardId: 'far', dueDate: at(25) }
    ], NOW)
    expect(groups).toHaveLength(2)
    expect(groups[0].items.map(i => i.cardId)).toEqual(['x', 'y'])
  })
})

describe('cardPath', () => {
  it('links to the CR studio', () => {
    expect(cardPath({ boardId: 'b1', cardId: 'c1' })).toBe('/boards/b1/cr/c1')
  })
})
