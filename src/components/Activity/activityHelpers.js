// Pure helpers for activity feeds, notifications and inbox timestamps (contract v7 §4, §6)

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY
const JUST_NOW_SECONDS = 45

const RELATIVE_STEPS = [
  { limit: HOUR, unit: 'minute', size: MINUTE },
  { limit: DAY, unit: 'hour', size: HOUR },
  { limit: WEEK, unit: 'day', size: DAY },
  { limit: MONTH, unit: 'week', size: WEEK },
  { limit: YEAR, unit: 'month', size: MONTH },
  { limit: Infinity, unit: 'year', size: YEAR }
]

const toTimestamp = (value) => {
  if (value === null || value === undefined || value === '') return NaN
  return new Date(value).getTime()
}

/** Localized "5 minutes ago" style label; empty string for invalid input. */
export const formatRelativeTime = (value, lang = 'en', now = Date.now()) => {
  const ts = toTimestamp(value)
  if (Number.isNaN(ts)) return ''
  const seconds = Math.round((ts - now) / 1000)
  const abs = Math.abs(seconds)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  if (abs < JUST_NOW_SECONDS) return rtf.format(0, 'second')
  const step = RELATIVE_STEPS.find(s => abs < s.limit)
  return rtf.format(Math.round(seconds / step.size), step.unit)
}

/** Local calendar day key `YYYY-MM-DD` (empty string for invalid input). */
export const toDayKey = (value) => {
  const ts = toTimestamp(value)
  if (Number.isNaN(ts)) return ''
  const d = new Date(ts)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** Groups an already-sorted list into consecutive day buckets: [{ key, items }]. */
export const groupByDay = (items = [], getValue = (item) => item.createdAt) =>
  items.reduce((groups, item) => {
    const key = toDayKey(getValue(item))
    const last = groups[groups.length - 1]
    if (last && last.key === key) {
      return [...groups.slice(0, -1), { ...last, items: [...last.items, item] }]
    }
    return [...groups, { key, items: [item] }]
  }, [])

/** 'today' | 'yesterday' | null for a day key relative to `now`. */
export const relativeDayName = (dayKey, now = Date.now()) => {
  if (dayKey === toDayKey(now)) return 'today'
  if (dayKey === toDayKey(now - DAY * 1000)) return 'yesterday'
  return null
}

// Activity verb → i18n key (collab dictionary). Unknown verbs fall back to a generic sentence.
const VERB_KEYS = Object.freeze({
  card_created: 'collabVerbCardCreated',
  card_updated: 'collabVerbCardUpdated',
  card_moved: 'collabVerbCardMoved',
  card_status_changed: 'collabVerbCardStatusChanged',
  card_completed: 'collabVerbCardCompleted',
  comment_added: 'collabVerbCommentAdded',
  wiki_created: 'collabVerbWikiCreated',
  wiki_updated: 'collabVerbWikiUpdated',
  board_created: 'collabVerbBoardCreated',
  member_added: 'collabVerbMemberAdded',
  role_changed: 'collabVerbRoleChanged'
})

export const activityVerbKey = (verb) => VERB_KEYS[verb] || 'collabVerbGeneric'

// Path for the resource an activity points at (card → CR studio, wiki → wiki page)
export const activityTargetPath = (activity) => {
  if (!activity?.boardId) return null
  if (activity.cardId) return `/boards/${activity.boardId}/cr/${activity.cardId}`
  if (String(activity.verb || '').startsWith('wiki_') && activity.meta?.pageId) {
    return `/boards/${activity.boardId}/wiki/${activity.meta.pageId}`
  }
  return null
}
