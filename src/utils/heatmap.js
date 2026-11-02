// Contribution heatmap helpers (GitHub-style 52/53-week grid).
// Everything works on 'YYYY-MM-DD' keys interpreted as UTC midnights, so the grid never drifts
// with the viewer's timezone or DST.

const DAY_MS = 24 * 60 * 60 * 1000
const DAYS_PER_WEEK = 7
const DEFAULT_WEEKS = 53
const MAX_LEVEL = 4
const MIN_MONTH_LABEL_GAP = 2
const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const pad2 = (n) => String(n).padStart(2, '0')

export const parseDateKey = (key) => {
  const match = DATE_KEY_RE.exec(String(key || ''))
  if (!match) return null
  const ms = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(ms) ? null : ms
}

export const toDateKey = (ms) => {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

export const addDays = (key, amount) => toDateKey(parseDateKey(key) + amount * DAY_MS)

// A Date means "the viewer's today" → use its local calendar day; strings are taken as-is
const normalizeToday = (today) => {
  if (typeof today === 'string' && parseDateKey(today) !== null) return today
  const d = today instanceof Date && !Number.isNaN(today.getTime()) ? today : new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export const intensityLevel = (count, max) => {
  if (!count || count <= 0 || !max || max <= 0) return 0
  return Math.min(MAX_LEVEL, Math.max(1, Math.ceil((count / max) * MAX_LEVEL)))
}

const toCountMap = (days) => (Array.isArray(days) ? days : []).reduce((acc, entry) => {
  const count = Number(entry?.count)
  if (parseDateKey(entry?.date) === null || !Number.isFinite(count) || count <= 0) return acc
  return { ...acc, [entry.date]: (acc[entry.date] || 0) + count }
}, {})

// counts: chronological daily counts ending today. Current streak may end yesterday (today not done yet).
export const computeStreaks = (counts = []) => {
  const longest = counts.reduce(
    (acc, count) => {
      const run = count > 0 ? acc.run + 1 : 0
      return { run, best: Math.max(acc.best, run) }
    },
    { run: 0, best: 0 }
  ).best

  let index = counts.length - 1
  if (index >= 0 && counts[index] <= 0) index -= 1
  let current = 0
  while (index >= 0 && counts[index] > 0) {
    current += 1
    index -= 1
  }
  return { longest, current }
}

const buildMonthLabels = (weeks) => {
  const raw = weeks.reduce((acc, week, weekIndex) => {
    const first = week.find(Boolean)
    if (!first) return acc
    const month = new Date(parseDateKey(first.date)).getUTCMonth()
    const prev = acc[acc.length - 1]
    return prev && prev.month === month ? acc : [...acc, { weekIndex, month }]
  }, [])
  return raw.filter((label, i) => !raw[i + 1] || raw[i + 1].weekIndex - label.weekIndex >= MIN_MONTH_LABEL_GAP)
}

/**
 * Build a heatmap grid.
 * @param {{ days?: {date:string,count:number}[], today?: string|Date, weeks?: number, weekStart?: 0|1 }} options
 *   weekStart 0 = Sunday rows first, 1 = Monday rows first.
 * @returns {{ weeks: (null|{date,count,level})[][], monthLabels: {weekIndex,month}[], total, max, longestStreak, currentStreak }}
 */
export const buildHeatmap = ({ days = [], today, weeks = DEFAULT_WEEKS, weekStart = 0 } = {}) => {
  const todayKey = normalizeToday(today)
  const todayMs = parseDateKey(todayKey)
  const rowOfToday = (new Date(todayMs).getUTCDay() - weekStart + DAYS_PER_WEEK) % DAYS_PER_WEEK
  const startMs = todayMs - (rowOfToday + (weeks - 1) * DAYS_PER_WEEK) * DAY_MS
  const countMap = toCountMap(days)

  const rawWeeks = Array.from({ length: weeks }, (_, w) => Array.from({ length: DAYS_PER_WEEK }, (__, d) => {
    const ms = startMs + (w * DAYS_PER_WEEK + d) * DAY_MS
    if (ms > todayMs) return null
    const date = toDateKey(ms)
    return { date, count: countMap[date] || 0 }
  }))

  const cells = rawWeeks.flat().filter(Boolean)
  const max = cells.reduce((m, c) => Math.max(m, c.count), 0)
  const total = cells.reduce((sum, c) => sum + c.count, 0)
  const { longest, current } = computeStreaks(cells.map((c) => c.count))
  const gridWeeks = rawWeeks.map((week) => week.map((cell) => (cell ? { ...cell, level: intensityLevel(cell.count, max) } : null)))

  return {
    weeks: gridWeeks,
    monthLabels: buildMonthLabels(gridWeeks),
    total,
    max,
    longestStreak: longest,
    currentStreak: current
  }
}

export const HEATMAP_LEVELS = [0, 1, 2, 3, 4]
