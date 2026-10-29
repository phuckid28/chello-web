// Sprint Pulse model: compares real progress against elapsed time and plots deadline load per day.
// Pure functions only (no React) so the numbers stay easy to test.
import { getCardDevProgress, normalizeCrStatus, parseDeadlineTimestamp } from '~/utils/excelExporter'
import { DAY_MS, parseSprintDate } from '~/utils/timeline'

export const HEALTH_LEVELS = Object.freeze({
  NO_DATA: 'noData',
  NOT_STARTED: 'notStarted',
  ON_TRACK: 'onTrack',
  AT_RISK: 'atRisk',
  BEHIND: 'behind',
  COMPLETED: 'completed'
})

const ON_TRACK_TOLERANCE = 0.1
const AT_RISK_TOLERANCE = 0.25
const DONE_STATUSES = ['Deployed', 'Done testing']

const startOfDay = (ts) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const isCrDone = (card) => getCardDevProgress(card) >= 1 || DONE_STATUSES.includes(normalizeCrStatus(card?.baStatus))

export const resolveHealthLevel = ({ total, allDone, started, finished, gap }) => {
  if (total === 0) return HEALTH_LEVELS.NO_DATA
  if (allDone) return HEALTH_LEVELS.COMPLETED
  if (!started) return HEALTH_LEVELS.NOT_STARTED
  if (finished) return HEALTH_LEVELS.BEHIND
  if (gap >= -ON_TRACK_TOLERANCE) return HEALTH_LEVELS.ON_TRACK
  if (gap >= -AT_RISK_TOLERANCE) return HEALTH_LEVELS.AT_RISK
  return HEALTH_LEVELS.BEHIND
}

const buildDueLoad = (cards, rangeStart, dayCount, now) => {
  const today = startOfDay(now)
  const buckets = Array.from({ length: dayCount }, (_, i) => {
    const ts = rangeStart + i * DAY_MS
    return { ts, day: new Date(ts).getDate(), count: 0, done: 0, isToday: ts === today, isPast: ts < today }
  })
  cards.forEach(card => {
    const due = parseDeadlineTimestamp(card)
    if (!due) return
    const index = Math.round((startOfDay(due) - rangeStart) / DAY_MS)
    if (index < 0 || index >= dayCount) return
    buckets[index].count += 1
    if (isCrDone(card)) buckets[index].done += 1
  })
  return buckets
}

export const computeSprintHealth = ({ cards = [], sprintConfig = {}, now = Date.now() }) => {
  const start = parseSprintDate(sprintConfig.startDate)
  const end = parseSprintDate(sprintConfig.endDate)
  const total = cards.length
  const doneCount = cards.filter(isCrDone).length
  const actualRatio = total === 0 ? 0 : cards.reduce((sum, card) => sum + getCardDevProgress(card), 0) / total

  const hasRange = start !== null && end !== null && end >= start
  const dayCount = hasRange ? Math.round((end - start) / DAY_MS) + 1 : 0
  const today = startOfDay(now)
  const elapsedRatio = hasRange ? clamp01((today - start + DAY_MS) / (dayCount * DAY_MS)) : 0
  const started = hasRange && today >= start
  const finished = hasRange && today > end
  const overdueCount = cards.filter(card => {
    const due = parseDeadlineTimestamp(card)
    return due !== null && startOfDay(due) < today && !isCrDone(card)
  }).length

  const level = resolveHealthLevel({
    total,
    allDone: total > 0 && doneCount === total,
    started: hasRange ? started : true,
    finished,
    gap: actualRatio - elapsedRatio
  })

  return {
    level,
    total,
    doneCount,
    overdueCount,
    actualRatio,
    elapsedRatio: hasRange ? elapsedRatio : 0,
    gap: actualRatio - elapsedRatio,
    dayCount,
    dayIndex: hasRange && started ? Math.min(dayCount, Math.round((today - start) / DAY_MS) + 1) : 0,
    daysLeft: hasRange ? Math.max(0, Math.round((end - today) / DAY_MS)) : null,
    dueLoad: hasRange ? buildDueLoad(cards, start, dayCount, now) : []
  }
}
