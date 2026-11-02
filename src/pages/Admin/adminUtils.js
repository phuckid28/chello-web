// Pure helpers for the global admin console (contract v7 §7). Kept out of component files.

export const SEARCH_DEBOUNCE_MS = 350
const MAX_X_LABELS = 8
const BAR_GAP_RATIO = 0.25
const TICK_COUNT = 4

export const isUserLocked = (user, now = Date.now()) => Boolean(user?.lockedUntil) && Number(user.lockedUntil) > now

export const patchUserInList = (users, userId, patch) =>
  users.map((user) => (user._id === userId ? { ...user, ...patch } : user))

export const replaceUserInList = (users, updated) => {
  if (!updated?._id) return users
  return patchUserInList(users, updated._id, updated)
}

export const appendUniqueUsers = (users, items = []) => {
  const known = new Set(users.map((user) => user._id))
  return [...users, ...items.filter((item) => item?._id && !known.has(item._id))]
}

export const normalizeUsersPage = (response) => {
  if (Array.isArray(response)) return { items: response, nextCursor: null }
  return {
    items: Array.isArray(response?.items) ? response.items : [],
    nextCursor: response?.nextCursor || null
  }
}

const niceTicks = (max) => {
  if (max <= 0) return [0, 1]
  const step = Math.max(1, Math.ceil(max / TICK_COUNT))
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
}

/** Geometry for the inline SVG signup bar chart. */
export const buildSignupChart = (signups, { width, height, padding }) => {
  const series = Array.isArray(signups) ? signups : []
  const counts = series.map((point) => (Number.isFinite(Number(point?.count)) && point.count !== '' ? Number(point.count) : 0))
  const max = counts.length ? Math.max(...counts) : 0
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const ticks = niceTicks(max)
  const scaleMax = Math.max(max, ticks[ticks.length - 1], 1)
  const slot = series.length ? plotWidth / series.length : 0
  const labelEvery = Math.max(1, Math.ceil(series.length / MAX_X_LABELS))
  const bars = series.map((point, index) => {
    const count = counts[index]
    const barHeight = (count / scaleMax) * plotHeight
    return {
      date: String(point?.date ?? ''),
      count,
      x: padding.left + index * slot + (slot * BAR_GAP_RATIO) / 2,
      width: slot * (1 - BAR_GAP_RATIO),
      y: padding.top + plotHeight - barHeight,
      height: barHeight,
      showLabel: index % labelEvery === 0
    }
  })
  const tickLines = ticks.map((value) => ({ value, y: padding.top + plotHeight - (value / scaleMax) * plotHeight }))
  return { bars, max, ticks, tickLines, plotHeight, plotWidth }
}
