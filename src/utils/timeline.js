// Timeline (Jira Roadmap / Gantt) model builder — pure functions, no React
import { getDeadlineStatus, parseDeadlineTimestamp } from '~/utils/excelExporter'

export const DAY_MS = 24 * 60 * 60 * 1000
const FALLBACK_HALF_RANGE_DAYS = 7

const startOfDay = (ts) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Accepts "22/10/2026", "22/10" (current year), "2026-10-22" or timestamps
export const parseSprintDate = (value, fallbackYear = new Date().getFullYear()) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isNaN(value) ? null : startOfDay(value)
  const str = String(value).trim()
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/)
  if (dmy) {
    const [, dd, mm, yyyy] = dmy
    const d = new Date(Number(yyyy || fallbackYear), Number(mm) - 1, Number(dd))
    return Number.isNaN(d.getTime()) ? null : d.getTime()
  }
  const parsed = new Date(str).getTime()
  return Number.isNaN(parsed) ? null : startOfDay(parsed)
}

export const resolveTimelineRange = (sprintConfig, now = Date.now()) => {
  const start = parseSprintDate(sprintConfig?.startDate)
  const end = parseSprintDate(sprintConfig?.endDate)
  if (start && end && end >= start) {
    return { rangeStart: start, rangeEnd: end + DAY_MS - 1 }
  }
  const today = startOfDay(now)
  return {
    rangeStart: today - FALLBACK_HALF_RANGE_DAYS * DAY_MS,
    rangeEnd: today + (FALLBACK_HALF_RANGE_DAYS + 1) * DAY_MS - 1
  }
}

export const buildTimelineDays = (rangeStart, rangeEnd, now = Date.now()) => {
  const days = []
  const today = startOfDay(now)
  for (let ts = rangeStart; ts <= rangeEnd; ts += DAY_MS) {
    const d = new Date(ts)
    days.push({
      ts,
      day: d.getDate(),
      month: d.getMonth() + 1,
      weekday: d.getDay(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: startOfDay(ts) === today
    })
  }
  return days
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const computeBar = (card, rangeStart, rangeEnd) => {
  const span = rangeEnd - rangeStart
  const rawEnd = parseDeadlineTimestamp(card)
  const rawStart = card?.startDate ? new Date(card.startDate).getTime() : null
  const hasDeadline = Boolean(rawEnd)

  let endTs = hasDeadline ? rawEnd : rangeEnd
  let startTs = rawStart && !Number.isNaN(rawStart) ? startOfDay(rawStart) : rangeStart
  if (startTs >= endTs) startTs = startOfDay(endTs)

  const clippedStart = startTs < rangeStart
  const clippedEnd = endTs > rangeEnd
  startTs = clamp(startTs, rangeStart, rangeEnd)
  endTs = clamp(endTs, rangeStart, rangeEnd)

  const startPct = ((startTs - rangeStart) / span) * 100
  const widthPct = Math.max(((endTs - startTs) / span) * 100, 1.5)

  return {
    startPct: Number(startPct.toFixed(3)),
    widthPct: Number(Math.min(widthPct, 100 - startPct).toFixed(3)),
    hasDeadline,
    hasStartDate: Boolean(rawStart),
    clippedStart,
    clippedEnd
  }
}

// items: [{ card, columnTitle }]  →  grouped rows per CR Topic (Column)
export const buildTimelineModel = ({ sprintConfig, items = [], now = Date.now() }) => {
  const { rangeStart, rangeEnd } = resolveTimelineRange(sprintConfig, now)
  const days = buildTimelineDays(rangeStart, rangeEnd, now)
  const todayInRange = now >= rangeStart && now <= rangeEnd
  const todayPct = todayInRange ? ((now - rangeStart) / (rangeEnd - rangeStart)) * 100 : null

  const groupsMap = new Map()
  items.forEach(({ card, columnTitle }) => {
    if (!card || card.FE_PlaceholderCard) return
    const key = columnTitle || 'General Topic'
    if (!groupsMap.has(key)) groupsMap.set(key, [])
    groupsMap.get(key).push({
      card,
      bar: computeBar(card, rangeStart, rangeEnd),
      deadline: getDeadlineStatus(card, now)
    })
  })

  const groups = Array.from(groupsMap.entries()).map(([title, rows]) => ({ title, rows }))
  return { rangeStart, rangeEnd, days, todayPct, groups }
}
