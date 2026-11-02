import { describe, it, expect } from 'vitest'
import { PASSWORD_POLICY, scorePassword, passwordPolicyError } from '~/utils/passwordStrength'

describe('passwordPolicyError (contract: ≥8, ≥1 letter + ≥1 digit, ≤128)', () => {
  it('flags passwords that are too short', () => {
    expect(passwordPolicyError('a1b2c3')).toBe('tooShort')
    expect(passwordPolicyError('')).toBe('tooShort')
  })

  it('flags passwords that are too long', () => {
    expect(passwordPolicyError(`a1${'x'.repeat(127)}`)).toBe('tooLong')
  })

  it('requires at least one letter and one digit', () => {
    expect(passwordPolicyError('12345678')).toBe('needLetter')
    expect(passwordPolicyError('abcdefgh')).toBe('needDigit')
  })

  it('accepts a compliant password, including unicode letters', () => {
    expect(passwordPolicyError('chella2026')).toBe(null)
    expect(passwordPolicyError('mậtkhẩu99')).toBe(null)
    expect(passwordPolicyError(`a1${'x'.repeat(126)}`)).toBe(null)
  })

  it('exposes the policy bounds', () => {
    expect(PASSWORD_POLICY).toEqual({ min: 8, max: 128 })
  })
})

describe('scorePassword', () => {
  it('returns level empty with score 0 for an empty value', () => {
    const result = scorePassword('')
    expect(result.score).toBe(0)
    expect(result.level).toBe('empty')
    expect(result.meetsPolicy).toBe(false)
  })

  it('rates policy-violating passwords as weak', () => {
    expect(scorePassword('abc').level).toBe('weak')
    expect(scorePassword('abcdefghijkl').level).toBe('weak')
  })

  it('rates a minimal compliant password as fair', () => {
    const result = scorePassword('abcdef12')
    expect(result.meetsPolicy).toBe(true)
    expect(result.level).toBe('fair')
  })

  it('rewards length, mixed case and symbols', () => {
    expect(scorePassword('Abcdef1234').level).toBe('good')
    expect(scorePassword('Abcdef12!xyzQ').level).toBe('strong')
    expect(scorePassword('Abcdef12!xyzQ').score).toBe(4)
  })

  it('penalises obvious patterns', () => {
    expect(scorePassword('password123').level).toBe('fair')
    expect(scorePassword('aaaaaaaa1').level).toBe('fair')
  })

  it('reports individual checks', () => {
    expect(scorePassword('Ab1!').checks).toEqual({
      length: false,
      letter: true,
      digit: true,
      maxLength: true,
      mixedCase: true,
      symbol: true
    })
  })
})
