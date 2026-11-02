// Pure helpers for the /my-work page: due buckets, board grouping, upcoming timeline

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7
export const UPCOMING_DAYS = 14

export const DUE_BUCKETS = Object.freeze(['overdue', 'today', 'week', 'later', 'none'])

const startOfDay = (ts) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const toTs = (value) => {
  if (value === null || value === undefined || value === '') return NaN
  return new Date(value).getTime()
}

/** 'overdue' | 'today' | 'week' (next 7 days) | 'later' | 'none' */
export const dueBucket = (dueDate, now = Date.now()) => {
  const ts = toTs(dueDate)
  if (Number.isNaN(ts)) return 'none'
  const today = startOfDay(now)
  if (ts < today) return 'overdue'
  if (ts < today + DAY_MS) return 'today'
  if (ts < today + WEEK_DAYS * DAY_MS) return 'week'
  return 'later'
}

const byDueDate = (a, b) => {
  const ta = toTs(a.dueDate)
  const tb = toTs(b.dueDate)
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0
  if (Number.isNaN(ta)) return 1
  if (Number.isNaN(tb)) return -1
  return ta - tb
}

/** [{ key: bucket, items }] in bucket order, empty buckets omitted, items sorted by due date. */
export const groupByDueBucket = (items = [], now = Date.now()) =>
  DUE_BUCKETS
    .map(key => ({ key, items: items.filter(item => dueBucket(item.dueDate, now) === key).sort(byDueDate) }))
    .filter(group => group.items.length > 0)

/** [{ key: boardId, title, items }] sorted by board title. */
export const groupByBoard = (items = []) => {
  const groups = items.reduce((acc, item) => {
    const key = String(item.boardId || '')
    const current = acc[key] || { key, title: item.boardTitle || '', items: [] }
    return { ...acc, [key]: { ...current, items: [...current.items, item] } }
  }, {})
  return Object.values(groups)
    .map(group => ({ ...group, items: [...group.items].sort(byDueDate) }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Items due within the next `days` days (today included): [{ dayStart, items }] in date order. */
export const upcomingByDay = (items = [], now = Date.now(), days = UPCOMING_DAYS) => {
  const today = startOfDay(now)
  const end = today + days * DAY_MS
  const upcoming = items
    .filter(item => {
      const ts = toTs(item.dueDate)
      return !Number.isNaN(ts) && ts >= today && ts < end
    })
    .sort(byDueDate)
  return upcoming.reduce((groups, item) => {
    const dayStart = startOfDay(toTs(item.dueDate))
    const last = groups[groups.length - 1]
    if (last && last.dayStart === dayStart) {
      return [...groups.slice(0, -1), { ...last, items: [...last.items, item] }]
    }
    return [...groups, { dayStart, items: [item] }]
  }, [])
}

export const cardPath = (item) => `/boards/${item.boardId}/cr/${item.cardId}`
