// Pure helpers for the auth pages (login 2FA / lockout, register, password reset).
// Kept outside components so they stay testable and component files only export components.
import { passwordPolicyError } from '~/utils/passwordStrength'

export const TERMS_VERSION = '2026-11'
export const TOTP_LENGTH = 6

export const LOGIN_ERROR_KINDS = Object.freeze({
  TOTP_REQUIRED: 'totpRequired',
  INVALID_CODE: 'invalidCode',
  LOCKED: 'locked',
  INVALID_CREDENTIALS: 'invalidCredentials',
  NETWORK: 'network',
  SERVER: 'server'
})

const HTTP_LOCKED = 423
const HTTP_SERVER_ERROR = 500

/**
 * Maps the rejected loginUserAPI payload `{ status, code, message, lockedUntil }` to a UI state.
 * `inTwoFactorStep` = the request already carried a totp/backupCode, so another TOTP_REQUIRED / 401 means a bad code.
 */
export const resolveLoginError = (payload = {}, inTwoFactorStep = false) => {
  const { status = 0, code = null, lockedUntil = null } = payload || {}
  if (code === 'ACCOUNT_LOCKED' || status === HTTP_LOCKED) {
    return { kind: LOGIN_ERROR_KINDS.LOCKED, lockedUntil }
  }
  if (code === 'TOTP_REQUIRED') {
    return { kind: inTwoFactorStep ? LOGIN_ERROR_KINDS.INVALID_CODE : LOGIN_ERROR_KINDS.TOTP_REQUIRED }
  }
  if (!status) return { kind: LOGIN_ERROR_KINDS.NETWORK }
  if (status >= HTTP_SERVER_ERROR) return { kind: LOGIN_ERROR_KINDS.SERVER }
  if (inTwoFactorStep) return { kind: LOGIN_ERROR_KINDS.INVALID_CODE }
  return { kind: LOGIN_ERROR_KINDS.INVALID_CREDENTIALS }
}

/** Builds the login body; only one of totp / backupCode is ever sent. */
export const buildLoginPayload = ({ email, password }, twoFactor = null) => {
  const base = { email: String(email || '').trim(), password }
  if (!twoFactor || !twoFactor.code) return base
  const code = String(twoFactor.code).trim()
  return twoFactor.mode === 'backup' ? { ...base, backupCode: code } : { ...base, totp: code }
}

/** Keeps only digits, max 6 — for the TOTP input (paste-friendly: "123 456" → "123456"). */
export const normalizeTotp = (value = '') => String(value).replace(/\D/g, '').slice(0, TOTP_LENGTH)

/** Formats `lockedUntil` (ms epoch or ISO string) in the user's local time; null when unknown/invalid. */
export const formatLockedUntil = (lockedUntil, locale = 'en') => {
  if (lockedUntil === null || lockedUntil === undefined || lockedUntil === '') return null
  const date = new Date(typeof lockedUntil === 'string' && /^\d+$/.test(lockedUntil) ? Number(lockedUntil) : lockedUntil)
  if (Number.isNaN(date.getTime())) return null
  try {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
  } catch {
    // Unknown locale tag → fall back to the runtime default formatting
    return date.toLocaleTimeString()
  }
}

export const buildRegisterPayload = ({ email, password }) => ({
  email: String(email || '').trim(),
  password,
  acceptTerms: true,
  termsVersion: TERMS_VERSION
})

export const buildRegisteredRedirect = (email = '') =>
  `/login?registeredEmail=${encodeURIComponent(String(email).trim())}`

/** Reads `/reset-password?email&token`; `valid` is false when either is missing/blank. */
export const readResetParams = (searchParams) => {
  const email = String(searchParams?.get?.('email') || '').trim()
  const token = String(searchParams?.get?.('token') || '').trim()
  return { email, token, valid: Boolean(email && token) }
}

/**
 * Splits an i18n template with `{slot}` placeholders into text / slot tokens so a component can
 * render links inside translated sentences whatever the word order of the language.
 */
export const splitTemplate = (template = '') =>
  String(template)
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^\{(\w+)\}$/)
      return match ? { type: 'slot', name: match[1] } : { type: 'text', value: part }
    })

export const PASSWORD_POLICY_ERROR_KEYS = Object.freeze({
  tooShort: 'authPwErrTooShort',
  tooLong: 'authPwErrTooLong',
  needLetter: 'authPwErrNeedLetter',
  needDigit: 'authPwErrNeedDigit'
})

/** i18n key of the first policy violation, or null when the password satisfies the policy. */
export const passwordPolicyErrorKey = (password = '') => {
  const error = passwordPolicyError(password)
  return error ? PASSWORD_POLICY_ERROR_KEYS[error] : null
}
