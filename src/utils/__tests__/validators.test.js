import { describe, it, expect } from 'vitest'
import { BACKUP_CODE_RULE, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_RULE, TOTP_RULE } from '../validators'
import { PASSWORD_POLICY } from '../passwordStrength'

describe('PASSWORD_RULE (contract v7 policy)', () => {
  it('accepts 8–128 chars with at least one letter and one digit', () => {
    expect(PASSWORD_RULE.test('abcd1234')).toBe(true)
    expect(PASSWORD_RULE.test('mật khẩu 9_!')).toBe(true)
    expect(PASSWORD_RULE.test('a1'.repeat(64))).toBe(true)
  })

  it('rejects short, long, letter-less or digit-less passwords', () => {
    expect(PASSWORD_RULE.test('abc123')).toBe(false)
    expect(PASSWORD_RULE.test('a1'.repeat(64) + 'x')).toBe(false)
    expect(PASSWORD_RULE.test('12345678')).toBe(false)
    expect(PASSWORD_RULE.test('abcdefgh')).toBe(false)
  })

  it('stays in sync with PASSWORD_POLICY', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(PASSWORD_POLICY.min)
    expect(PASSWORD_MAX_LENGTH).toBe(PASSWORD_POLICY.max)
  })
})

describe('2FA code rules', () => {
  it('TOTP_RULE requires exactly 6 digits', () => {
    expect(TOTP_RULE.test('123456')).toBe(true)
    expect(TOTP_RULE.test('12345')).toBe(false)
    expect(TOTP_RULE.test('12345a')).toBe(false)
  })

  it('BACKUP_CODE_RULE accepts short alphanumeric codes with dashes', () => {
    expect(BACKUP_CODE_RULE.test('abcd-1234')).toBe(true)
    expect(BACKUP_CODE_RULE.test('abc')).toBe(false)
    expect(BACKUP_CODE_RULE.test('abcd 1234')).toBe(false)
  })
})
