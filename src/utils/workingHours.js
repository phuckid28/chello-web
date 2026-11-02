// Local time & working-hours helpers for profile cards. Pure: inject `now` for tests.
// Weekdays follow ISO numbering used by the API: 1 = Monday … 7 = Sunday.

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR
const DAYS_IN_WEEK = 7
const FALLBACK_TIME_ZONE = 'UTC'
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]
const HM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const WEEKDAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }

export const parseHm = (value) => {
  const match = HM_RE.exec(String(value ?? ''))
  return match ? Number(match[1]) * MINUTES_PER_HOUR + Number(match[2]) : null
}

export const isValidTimeZone = (timeZone) => {
  if (!timeZone || typeof timeZone !== 'string') return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

const partsToObject = (parts) => parts.reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {})

export const getZonedParts = (now, timeZone) => {
  const parts = partsToObject(new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short'
  }).formatToParts(now))
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAY_INDEX[parts.weekday] || 1
  }
}

// Offset of `timeZone` from UTC in minutes at instant `now` (e.g. +420 for UTC+7)
export const getTimezoneOffsetMinutes = (now, timeZone) => {
  const p = getZonedParts(now, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  const instant = Math.floor(now.getTime() / 1000) * 1000
  return Math.round((asUtc - instant) / 60000)
}

export const formatOffsetDiff = (diffMinutes) => {
  if (!diffMinutes) return ''
  const sign = diffMinutes > 0 ? '+' : '-'
  const abs = Math.abs(diffMinutes)
  const hours = Math.floor(abs / MINUTES_PER_HOUR)
  const minutes = abs % MINUTES_PER_HOUR
  const hourPart = hours ? `${hours}h` : ''
  const minutePart = minutes ? `${minutes}m` : ''
  return `${sign}${[hourPart, minutePart].filter(Boolean).join(' ')}`
}

const normalizeWorkingHours = (workingHours) => {
  const start = parseHm(workingHours?.start)
  const end = parseHm(workingHours?.end)
  if (start === null || end === null) return null
  const days = Array.isArray(workingHours.days) ? workingHours.days : DEFAULT_WORKING_DAYS
  return { start, end, days }
}

const previousWeekday = (weekday) => ((weekday + DAYS_IN_WEEK - 2) % DAYS_IN_WEEK) + 1

/** @param {{ minutes:number, weekday:number }} local  @param {{start,end,days}} workingHours */
export const isWithinWorkingHours = (local, workingHours) => {
  const wh = normalizeWorkingHours(workingHours)
  if (!wh || !local) return false
  const { minutes, weekday } = local
  if (wh.start === wh.end) return wh.days.includes(weekday)
  if (wh.start < wh.end) return wh.days.includes(weekday) && minutes >= wh.start && minutes < wh.end
  // Overnight shift (e.g. 22:00–06:00): early hours belong to the shift that started yesterday
  if (minutes >= wh.start) return wh.days.includes(weekday)
  if (minutes < wh.end) return wh.days.includes(previousWeekday(weekday))
  return false
}

const resolveViewerTimeZone = (viewerTimeZone) => {
  if (isValidTimeZone(viewerTimeZone)) return viewerTimeZone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE
  } catch {
    return FALLBACK_TIME_ZONE
  }
}

const formatTime = (now, timeZone, locale) => {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit' }).format(now)
  } catch {
    return new Intl.DateTimeFormat('en-US', { timeZone, hour: '2-digit', minute: '2-digit' }).format(now)
  }
}

/**
 * Everything a profile card needs about someone's clock.
 * @returns {{ timeZone, timeZoneValid, timeString, weekday, minutes, hasWorkingHours, isWorking, offsetDiffMinutes, offsetLabel }}
 */
export const getLocalTimeInfo = ({ timeZone, workingHours, now = new Date(), viewerTimeZone, locale } = {}) => {
  const timeZoneValid = isValidTimeZone(timeZone)
  const zone = timeZoneValid ? timeZone : FALLBACK_TIME_ZONE
  const parts = getZonedParts(now, zone)
  const local = { minutes: (parts.hour * MINUTES_PER_HOUR + parts.minute) % MINUTES_PER_DAY, weekday: parts.weekday }
  const hasWorkingHours = Boolean(normalizeWorkingHours(workingHours))
  const viewerZone = resolveViewerTimeZone(viewerTimeZone)
  const offsetDiffMinutes = getTimezoneOffsetMinutes(now, zone) - getTimezoneOffsetMinutes(now, viewerZone)

  return {
    timeZone: zone,
    timeZoneValid,
    timeString: formatTime(now, zone, locale),
    weekday: local.weekday,
    minutes: local.minutes,
    hasWorkingHours,
    isWorking: hasWorkingHours && isWithinWorkingHours(local, workingHours),
    offsetDiffMinutes,
    offsetLabel: formatOffsetDiff(offsetDiffMinutes)
  }
}

// Map app language codes to Intl locales for time formatting
export const LOCALE_BY_LANG = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' }
