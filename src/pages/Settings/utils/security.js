// Pure helpers for Settings → Security / Sessions (contract §1)

export const AUDIT_EVENTS = Object.freeze([
  'login_success', 'login_failed', 'account_locked', 'logout', 'password_changed', 'password_reset',
  'session_revoked', 'token_reuse_detected', 'totp_enabled', 'totp_disabled', 'email_verified',
  'profile_updated', 'username_changed', 'data_exported', 'deletion_scheduled', 'deletion_cancelled'
])

// Events that deserve visual emphasis in the audit list
export const WARNING_AUDIT_EVENTS = Object.freeze([
  'login_failed', 'account_locked', 'token_reuse_detected', 'totp_disabled', 'deletion_scheduled'
])

const toPascal = (snake) => String(snake || '')
  .split('_')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')

/** `login_success` → `setAuditLoginSuccess`; unknown events → `setAuditUnknown`. */
export const auditEventKey = (event) => (AUDIT_EVENTS.includes(event) ? `setAudit${toPascal(event)}` : 'setAuditUnknown')

/** `JBSWY3DPEHPK3PXP` → `JBSW Y3DP EHPK 3PXP` */
export const groupSecret = (secret = '', size = 4) => {
  const clean = String(secret).replace(/\s+/g, '')
  return (clean.match(new RegExp(`.{1,${size}}`, 'g')) || []).join(' ')
}

/** Plain-text body for the downloadable backup codes file. */
export const backupCodesText = (codes = [], { title = 'Chella backup codes', account = '', generatedAt = '' } = {}) => [
  ...[title, account, generatedAt].filter(Boolean),
  '',
  ...codes.map((code, i) => `${String(i + 1).padStart(2, '0')}. ${code}`),
  ''
].join('\n')

/** Maps `passwordPolicyError()` codes to i18n keys. */
export const PASSWORD_ERROR_KEYS = Object.freeze({
  tooShort: 'setPwTooShort',
  tooLong: 'setPwTooLong',
  needLetter: 'setPwNeedLetter',
  needDigit: 'setPwNeedDigit'
})

const BROWSERS = [
  ['Edge', /Edg(?:e|A|iOS)?\/[\d.]+/],
  ['Opera', /OPR\/|Opera/],
  ['Samsung Internet', /SamsungBrowser/],
  ['Chrome', /(?:Chrome|CriOS)\/[\d.]+/],
  ['Firefox', /(?:Firefox|FxiOS)\/[\d.]+/],
  ['Safari', /Version\/[\d.]+.*Safari/]
]

const SYSTEMS = [
  ['iOS', /iPhone|iPad|iPod/],
  ['Android', /Android/],
  ['Windows', /Windows/],
  ['macOS', /Mac OS X|Macintosh/],
  ['ChromeOS', /CrOS/],
  ['Linux', /Linux/]
]

const firstMatch = (list, ua) => (list.find(([, re]) => re.test(ua)) || [])[0] || ''

/** Short `{ browser, os }` summary of a user-agent string (best effort, no library). */
export const summarizeUserAgent = (ua = '') => {
  const value = String(ua || '')
  return { browser: firstMatch(BROWSERS, value), os: firstMatch(SYSTEMS, value) }
}

/** "Chrome · Windows" style label from session fields or a raw user agent. */
export const deviceLabel = ({ deviceName, browser, os, userAgent } = {}) => {
  const parsed = summarizeUserAgent(userAgent)
  const parts = [browser || parsed.browser, os || parsed.os].filter(Boolean)
  if (deviceName && !parts.includes(deviceName)) parts.unshift(deviceName)
  return parts.join(' · ')
}

/** Sessions sorted with the current device first, then most recently used. */
export const sortSessions = (sessions = []) => [...sessions].sort((a, b) => {
  if (a.current !== b.current) return a.current ? -1 : 1
  return (b.lastUsedAt || b.createdAt || 0) - (a.lastUsedAt || a.createdAt || 0)
})
