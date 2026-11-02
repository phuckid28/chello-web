import { describe, it, expect } from 'vitest'
import {
  LOGIN_ERROR_KINDS,
  TERMS_VERSION,
  buildLoginPayload,
  buildRegisterPayload,
  buildRegisteredRedirect,
  formatLockedUntil,
  normalizeTotp,
  passwordPolicyErrorKey,
  readResetParams,
  resolveLoginError,
  splitTemplate
} from '../authHelpers'

describe('resolveLoginError', () => {
  it('switches to the 2FA step on TOTP_REQUIRED from the credentials step', () => {
    expect(resolveLoginError({ status: 401, code: 'TOTP_REQUIRED' }).kind).toBe(LOGIN_ERROR_KINDS.TOTP_REQUIRED)
  })

  it('reports an invalid code when TOTP_REQUIRED / 401 comes back during the 2FA step', () => {
    expect(resolveLoginError({ status: 401, code: 'TOTP_REQUIRED' }, true).kind).toBe(LOGIN_ERROR_KINDS.INVALID_CODE)
    expect(resolveLoginError({ status: 401 }, true).kind).toBe(LOGIN_ERROR_KINDS.INVALID_CODE)
  })

  it('returns the lock state with lockedUntil for ACCOUNT_LOCKED or HTTP 423', () => {
    expect(resolveLoginError({ status: 423, code: 'ACCOUNT_LOCKED', lockedUntil: 123 })).toEqual({ kind: LOGIN_ERROR_KINDS.LOCKED, lockedUntil: 123 })
    expect(resolveLoginError({ status: 423 }, true).kind).toBe(LOGIN_ERROR_KINDS.LOCKED)
  })

  it('uses a neutral invalid-credentials state for other 4xx errors', () => {
    expect(resolveLoginError({ status: 401, message: 'no such user' }).kind).toBe(LOGIN_ERROR_KINDS.INVALID_CREDENTIALS)
    expect(resolveLoginError({ status: 406 }).kind).toBe(LOGIN_ERROR_KINDS.INVALID_CREDENTIALS)
  })

  it('distinguishes network and server failures', () => {
    expect(resolveLoginError({ status: 0 }).kind).toBe(LOGIN_ERROR_KINDS.NETWORK)
    expect(resolveLoginError(undefined).kind).toBe(LOGIN_ERROR_KINDS.NETWORK)
    expect(resolveLoginError({ status: 503 }).kind).toBe(LOGIN_ERROR_KINDS.SERVER)
  })
})

describe('buildLoginPayload', () => {
  const creds = { email: ' a@b.co ', password: 'pw' }

  it('sends only email + password without a second factor', () => {
    expect(buildLoginPayload(creds)).toEqual({ email: 'a@b.co', password: 'pw' })
    expect(buildLoginPayload(creds, { mode: 'totp', code: '' })).toEqual({ email: 'a@b.co', password: 'pw' })
  })

  it('adds totp or backupCode depending on the mode', () => {
    expect(buildLoginPayload(creds, { mode: 'totp', code: '123456' })).toEqual({ email: 'a@b.co', password: 'pw', totp: '123456' })
    expect(buildLoginPayload(creds, { mode: 'backup', code: ' abcd-1234 ' })).toEqual({ email: 'a@b.co', password: 'pw', backupCode: 'abcd-1234' })
  })
})

describe('normalizeTotp', () => {
  it('keeps at most 6 digits', () => {
    expect(normalizeTotp('123 456')).toBe('123456')
    expect(normalizeTotp('12a34b5678')).toBe('123456')
    expect(normalizeTotp()).toBe('')
  })
})

describe('formatLockedUntil', () => {
  it('formats epoch numbers, numeric strings and ISO strings', () => {
    const ms = Date.UTC(2026, 10, 2, 9, 30)
    expect(formatLockedUntil(ms, 'en')).toMatch(/\d/)
    expect(formatLockedUntil(String(ms), 'en')).toBe(formatLockedUntil(ms, 'en'))
    expect(formatLockedUntil(new Date(ms).toISOString(), 'en')).toBe(formatLockedUntil(ms, 'en'))
  })

  it('returns null for missing or invalid values', () => {
    expect(formatLockedUntil(null)).toBeNull()
    expect(formatLockedUntil('')).toBeNull()
    expect(formatLockedUntil('not a date')).toBeNull()
  })
})

describe('register helpers', () => {
  it('always sends acceptTerms + the current terms version', () => {
    expect(buildRegisterPayload({ email: ' x@y.io ', password: 'abc12345' })).toEqual({
      email: 'x@y.io',
      password: 'abc12345',
      acceptTerms: true,
      termsVersion: TERMS_VERSION
    })
    expect(TERMS_VERSION).toBe('2026-11')
  })

  it('url-encodes the registered email in the login redirect', () => {
    expect(buildRegisteredRedirect('a+b@c.io')).toBe('/login?registeredEmail=a%2Bb%40c.io')
  })
})

describe('readResetParams', () => {
  it('is valid only when both email and token are present', () => {
    expect(readResetParams(new URLSearchParams('email=a%40b.co&token=t1'))).toEqual({ email: 'a@b.co', token: 't1', valid: true })
    expect(readResetParams(new URLSearchParams('email=a%40b.co')).valid).toBe(false)
    expect(readResetParams(new URLSearchParams('token=%20')).valid).toBe(false)
    expect(readResetParams(null).valid).toBe(false)
  })
})

describe('splitTemplate', () => {
  it('splits text and {slot} tokens preserving order', () => {
    expect(splitTemplate('I agree to the {terms} and {privacy}')).toEqual([
      { type: 'text', value: 'I agree to the ' },
      { type: 'slot', name: 'terms' },
      { type: 'text', value: ' and ' },
      { type: 'slot', name: 'privacy' }
    ])
    expect(splitTemplate('{terms}と{privacy}に同意します').map(t => t.type)).toEqual(['slot', 'text', 'slot', 'text'])
    expect(splitTemplate()).toEqual([])
  })
})

describe('passwordPolicyErrorKey', () => {
  it('maps policy violations to i18n keys', () => {
    expect(passwordPolicyErrorKey('abc')).toBe('authPwErrTooShort')
    expect(passwordPolicyErrorKey('a1'.repeat(65))).toBe('authPwErrTooLong')
    expect(passwordPolicyErrorKey('12345678')).toBe('authPwErrNeedLetter')
    expect(passwordPolicyErrorKey('abcdefgh')).toBe('authPwErrNeedDigit')
    expect(passwordPolicyErrorKey('abcd1234')).toBeNull()
  })
})
