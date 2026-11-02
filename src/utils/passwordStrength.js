// Password policy + lightweight strength scorer (contract v7 §1: ≥ 8 chars, ≥ 1 letter + ≥ 1 digit, ≤ 128).
// No external library: the meter is guidance only — the API enforces the same policy.

export const PASSWORD_POLICY = Object.freeze({ min: 8, max: 128 })

const LETTER = /\p{L}/u
const DIGIT = /\d/
const LOWER = /\p{Ll}/u
const UPPER = /\p{Lu}/u
const SYMBOL = /[^\p{L}\d]/u
const LONG_LENGTH = 12
const COMMON_FRAGMENTS = ['password', 'matkhau', '123456', 'qwerty', 'abc123', 'chella', 'letmein', 'admin']
const REPEATED_RUN = /(.)\1{3,}/u
const LEVELS = ['empty', 'weak', 'fair', 'good', 'strong']

export const passwordPolicyError = (password = '') => {
  const value = String(password)
  if (value.length < PASSWORD_POLICY.min) return 'tooShort'
  if (value.length > PASSWORD_POLICY.max) return 'tooLong'
  if (!LETTER.test(value)) return 'needLetter'
  if (!DIGIT.test(value)) return 'needDigit'
  return null
}

const hasWeakPattern = (value) => {
  const lower = value.toLowerCase()
  return REPEATED_RUN.test(value) || COMMON_FRAGMENTS.some(fragment => lower.includes(fragment))
}

/** Returns { score 0..4, level, checks, meetsPolicy } for the strength meter. */
export const scorePassword = (password = '') => {
  const value = String(password)
  const checks = {
    length: value.length >= PASSWORD_POLICY.min,
    letter: LETTER.test(value),
    digit: DIGIT.test(value),
    maxLength: value.length <= PASSWORD_POLICY.max,
    mixedCase: LOWER.test(value) && UPPER.test(value),
    symbol: SYMBOL.test(value)
  }
  const meetsPolicy = passwordPolicyError(value) === null

  if (!value) return { score: 0, level: LEVELS[0], checks, meetsPolicy }
  if (!meetsPolicy) return { score: 1, level: LEVELS[1], checks, meetsPolicy }

  const bonus = [value.length >= LONG_LENGTH, checks.mixedCase, checks.symbol].filter(Boolean).length
  const raw = hasWeakPattern(value) ? 2 : 2 + bonus
  const score = Math.min(4, raw)
  return { score, level: LEVELS[score], checks, meetsPolicy }
}
