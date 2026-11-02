// Pure formatting / error helpers shared by Settings tabs

const SECOND = 1000
const UNITS = Object.freeze([
  ['year', 365 * 24 * 3600 * SECOND],
  ['month', 30 * 24 * 3600 * SECOND],
  ['week', 7 * 24 * 3600 * SECOND],
  ['day', 24 * 3600 * SECOND],
  ['hour', 3600 * SECOND],
  ['minute', 60 * SECOND],
  ['second', SECOND]
])

/** `{ value, unit }` for Intl.RelativeTimeFormat (negative = past). */
export const relativeTimeParts = (timestamp, now = Date.now()) => {
  const diff = Number(timestamp) - now
  if (!Number.isFinite(diff)) return null
  const abs = Math.abs(diff)
  const [unit, ms] = UNITS.find(([, size]) => abs >= size) || UNITS[UNITS.length - 1]
  return { value: Math.round(diff / ms), unit }
}

export const formatRelativeTime = (timestamp, lang, now = Date.now()) => {
  const parts = relativeTimeParts(timestamp, now)
  if (!parts) return ''
  try {
    return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(parts.value, parts.unit)
  } catch (error) {
    return new Date(Number(timestamp)).toLocaleString()
  }
}

export const formatDateTime = (timestamp, lang) => {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' })
}

export const formatDate = (timestamp, lang) => {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(lang, { dateStyle: 'medium' })
}

const pad = (n) => String(n).padStart(2, '0')

/** `chella-export-YYYY-MM-DD.json` using the local calendar date. */
export const exportFileName = (date = new Date()) =>
  `chella-export-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`

export const apiErrorMessage = (error, fallback = '') => error?.response?.data?.message || fallback
export const apiErrorCode = (error) => error?.response?.data?.code || ''
export const apiErrorStatus = (error) => error?.response?.status || error?.response?.data?.statusCode || 0

/** Triggers a browser download for in-memory content. */
export const downloadTextFile = (content, fileName, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Clipboard write with a boolean result (no throw). */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    return false
  }
}

/** Localized short weekday name for ISO weekday 1 (Mon) … 7 (Sun). */
export const weekdayLabel = (isoDay, lang) => {
  // 2024-01-01 was a Monday
  const date = new Date(Date.UTC(2024, 0, isoDay))
  try {
    return date.toLocaleDateString(lang, { weekday: 'short', timeZone: 'UTC' })
  } catch (error) {
    return String(isoDay)
  }
}
