import { describe, it, expect } from 'vitest'
import {
  buildProfileForm,
  buildProfilePayload,
  getTimezones,
  isHttpsUrl,
  nextUsernameChangeAt,
  normalizeSkills,
  usernameError,
  validateProfileForm
} from '../profileForm'

const DAY = 24 * 60 * 60 * 1000

describe('nextUsernameChangeAt', () => {
  it('returns null when never changed', () => {
    expect(nextUsernameChangeAt(null, 1000)).toBeNull()
  })

  it('returns the next allowed time inside the 30-day window', () => {
    const changed = 10 * DAY
    expect(nextUsernameChangeAt(changed, 20 * DAY)).toBe(40 * DAY)
  })

  it('returns null once 30 days passed', () => {
    expect(nextUsernameChangeAt(0, 30 * DAY + 1)).toBeNull()
  })
})

describe('usernameError', () => {
  it('accepts valid usernames', () => {
    expect(usernameError('john.doe_1-x', 'old')).toBeNull()
  })

  it('rejects invalid or unchanged usernames', () => {
    expect(usernameError('Ab', 'old')).toBe('setUsernameInvalid')
    expect(usernameError('UPPER', 'old')).toBe('setUsernameInvalid')
    expect(usernameError('a'.repeat(31), 'old')).toBe('setUsernameInvalid')
    expect(usernameError('old', 'old')).toBe('setUsernameSame')
  })
})

describe('isHttpsUrl', () => {
  it('accepts https only', () => {
    expect(isHttpsUrl('https://github.com/me')).toBe(true)
    expect(isHttpsUrl('http://github.com/me')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('not a url')).toBe(false)
  })
})

describe('getTimezones', () => {
  it('uses Intl.supportedValuesOf when available and ensures UTC', () => {
    const intl = { supportedValuesOf: () => ['Asia/Tokyo'] }
    expect(getTimezones(intl)).toEqual(['UTC', 'Asia/Tokyo'])
  })

  it('falls back to a curated list', () => {
    const list = getTimezones({})
    expect(list).toContain('Asia/Ho_Chi_Minh')
    expect(list).toContain('UTC')
  })
})

describe('buildProfileForm', () => {
  it('fills defaults for a sparse user', () => {
    const form = buildProfileForm({ displayName: 'Ann' })
    expect(form.displayName).toBe('Ann')
    expect(form.workingHours).toEqual({ start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] })
    expect(form.skills).toEqual([])
    expect(form.locale).toBe('')
  })

  it('normalizes saved working days', () => {
    const form = buildProfileForm({ workingHours: { start: '08:30', end: '17:00', days: [5, 1, 1, 9] } })
    expect(form.workingHours).toEqual({ start: '08:30', end: '17:00', days: [1, 5] })
  })
})

describe('validateProfileForm', () => {
  const valid = () => buildProfileForm({ displayName: 'Ann' })

  it('passes a valid form', () => {
    expect(validateProfileForm(valid())).toEqual({})
  })

  it('flags field limits', () => {
    const form = { ...valid(), displayName: ' ', bio: 'x'.repeat(281), department: 'y'.repeat(61) }
    const errors = validateProfileForm(form)
    expect(errors.displayName).toBe('setDisplayNameRequired')
    expect(errors.bio).toBe('setBioTooLong')
    expect(errors.department).toBe('setFieldTooLong')
  })

  it('flags invalid working hours and empty days', () => {
    expect(validateProfileForm({ ...valid(), workingHours: { start: '18:00', end: '09:00', days: [1] } }).workingHours)
      .toBe('setWorkingHoursInvalid')
    expect(validateProfileForm({ ...valid(), workingHours: { start: '09:00', end: '18:00', days: [] } }).workingHours)
      .toBe('setWorkingDaysRequired')
  })

  it('flags non-https social links per row and ignores blank rows', () => {
    const form = {
      ...valid(),
      socialLinks: [{ label: 'Blog', url: 'http://x.dev' }, { label: '', url: '' }, { label: 'Git', url: 'https://g.dev' }]
    }
    expect(validateProfileForm(form).socialLinks).toEqual(['setSocialUrlInvalid', null, null])
  })

  it('flags too many skills', () => {
    const skills = Array.from({ length: 16 }, (_, i) => `s${i}`)
    expect(validateProfileForm({ ...valid(), skills }).skills).toBe('setSkillsTooMany')
  })
})

describe('normalizeSkills', () => {
  it('trims, de-duplicates case-insensitively and caps', () => {
    expect(normalizeSkills([' React ', 'react', '', 'Node'])).toEqual(['React', 'Node'])
  })
})

describe('buildProfilePayload', () => {
  it('trims values, drops blank links and omits empty timezone/locale', () => {
    const form = {
      ...buildProfileForm({ displayName: ' Ann ' }),
      socialLinks: [{ label: ' Site ', url: ' https://a.dev ' }, { label: '', url: '' }]
    }
    const payload = buildProfilePayload(form)
    expect(payload.displayName).toBe('Ann')
    expect(payload.socialLinks).toEqual([{ label: 'Site', url: 'https://a.dev' }])
    expect(payload).not.toHaveProperty('timezone')
    expect(payload).not.toHaveProperty('locale')
  })

  it('includes timezone and locale when set', () => {
    const form = { ...buildProfileForm({ displayName: 'A' }), timezone: 'Asia/Tokyo', locale: 'ja' }
    expect(buildProfilePayload(form)).toMatchObject({ timezone: 'Asia/Tokyo', locale: 'ja' })
  })
})
