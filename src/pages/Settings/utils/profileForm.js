// Pure helpers for the Settings → Profile tab (contract §2 PUT /users/profile, PUT /users/username)

export const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/
export const USERNAME_COOLDOWN_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

export const PROFILE_LIMITS = Object.freeze({
  displayName: 50,
  bio: 280,
  jobTitle: 60,
  department: 60,
  skills: 15,
  skillLength: 30,
  socialLinks: 5,
  socialLabel: 40
})

export const PROFILE_LOCALES = Object.freeze(['vi', 'en', 'ja', 'ko'])
export const WEEKDAYS = Object.freeze([1, 2, 3, 4, 5, 6, 7])
export const DEFAULT_WORKING_HOURS = Object.freeze({ start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] })

const FALLBACK_TIMEZONES = Object.freeze([
  'UTC', 'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai',
  'Asia/Hong_Kong', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Moscow', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Sao_Paulo', 'Pacific/Auckland'
])

/** IANA timezone list from the runtime, or a curated fallback for older browsers. */
export const getTimezones = (intl = globalThis.Intl) => {
  try {
    const zones = intl?.supportedValuesOf?.('timeZone')
    if (Array.isArray(zones) && zones.length) return zones.includes('UTC') ? zones : ['UTC', ...zones]
  } catch (error) {
    // Older engines throw for unknown keys — fall through to the curated list
  }
  return [...FALLBACK_TIMEZONES]
}

export const guessTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch (error) {
    return ''
  }
}

/** Next time the username may change (ms), or null when it can change now. */
export const nextUsernameChangeAt = (usernameChangedAt, now = Date.now()) => {
  if (!usernameChangedAt) return null
  const next = Number(usernameChangedAt) + USERNAME_COOLDOWN_DAYS * DAY_MS
  return Number.isFinite(next) && next > now ? next : null
}

export const usernameError = (username, currentUsername) => {
  const value = String(username || '').trim()
  if (value === currentUsername) return 'setUsernameSame'
  if (!USERNAME_REGEX.test(value)) return 'setUsernameInvalid'
  return null
}

export const isHttpsUrl = (value) => {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch (error) {
    return false
  }
}

const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ''))

const normalizeDays = (days) => {
  const valid = Array.isArray(days) ? days.filter((d) => WEEKDAYS.includes(d)) : []
  return [...new Set(valid)].sort((a, b) => a - b)
}

/** Form state derived from a SelfUser. */
export const buildProfileForm = (user = {}) => {
  const hours = user?.workingHours || {}
  return {
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    jobTitle: user?.jobTitle || '',
    department: user?.department || '',
    timezone: user?.timezone || '',
    locale: PROFILE_LOCALES.includes(user?.locale) ? user.locale : '',
    workingHours: {
      start: isTime(hours.start) ? hours.start : DEFAULT_WORKING_HOURS.start,
      end: isTime(hours.end) ? hours.end : DEFAULT_WORKING_HOURS.end,
      days: Array.isArray(hours.days) ? normalizeDays(hours.days) : [...DEFAULT_WORKING_HOURS.days]
    },
    skills: Array.isArray(user?.skills) ? [...user.skills] : [],
    socialLinks: Array.isArray(user?.socialLinks)
      ? user.socialLinks.map((link) => ({ label: link?.label || '', url: link?.url || '' }))
      : []
  }
}

const isBlankLink = (link) => !link.label.trim() && !link.url.trim()

const linkError = (link) => {
  if (!link.label.trim()) return 'setSocialLabelRequired'
  if (link.label.trim().length > PROFILE_LIMITS.socialLabel) return 'setSocialLabelTooLong'
  if (!isHttpsUrl(link.url)) return 'setSocialUrlInvalid'
  return null
}

const lengthError = (value, max, key) => (value.trim().length > max ? key : null)

/** Returns `{ field: i18nKey }` (socialLinks → array of key|null); empty object when valid. */
export const validateProfileForm = (form) => {
  const errors = {}
  const name = form.displayName.trim()
  if (!name) errors.displayName = 'setDisplayNameRequired'
  else if (name.length > PROFILE_LIMITS.displayName) errors.displayName = 'setDisplayNameTooLong'
  const checks = [
    ['bio', lengthError(form.bio, PROFILE_LIMITS.bio, 'setBioTooLong')],
    ['jobTitle', lengthError(form.jobTitle, PROFILE_LIMITS.jobTitle, 'setFieldTooLong')],
    ['department', lengthError(form.department, PROFILE_LIMITS.department, 'setFieldTooLong')]
  ]
  checks.forEach(([field, error]) => { if (error) errors[field] = error })
  const { start, end, days } = form.workingHours
  if (!isTime(start) || !isTime(end) || start >= end) errors.workingHours = 'setWorkingHoursInvalid'
  else if (!days.length) errors.workingHours = 'setWorkingDaysRequired'
  if (form.skills.length > PROFILE_LIMITS.skills) errors.skills = 'setSkillsTooMany'
  else if (form.skills.some((s) => s.length > PROFILE_LIMITS.skillLength)) errors.skills = 'setSkillTooLong'
  const links = form.socialLinks.filter((link) => !isBlankLink(link))
  if (links.length > PROFILE_LIMITS.socialLinks) errors.socialLinksTotal = 'setSocialTooMany'
  const linkErrors = form.socialLinks.map((link) => (isBlankLink(link) ? null : linkError(link)))
  if (linkErrors.some(Boolean)) errors.socialLinks = linkErrors
  return errors
}

/** Normalizes skill chips: trimmed, de-duplicated (case-insensitive), capped. */
export const normalizeSkills = (skills) => {
  const seen = new Set()
  return skills
    .map((s) => String(s || '').trim().slice(0, PROFILE_LIMITS.skillLength))
    .filter((s) => {
      const key = s.toLowerCase()
      if (!s || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, PROFILE_LIMITS.skills)
}

/** PUT /users/profile body built from a validated form. */
export const buildProfilePayload = (form) => {
  const payload = {
    displayName: form.displayName.trim(),
    bio: form.bio.trim(),
    jobTitle: form.jobTitle.trim(),
    department: form.department.trim(),
    workingHours: { ...form.workingHours, days: normalizeDays(form.workingHours.days) },
    skills: normalizeSkills(form.skills),
    socialLinks: form.socialLinks
      .filter((link) => !isBlankLink(link))
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
  }
  return {
    ...payload,
    ...(form.timezone ? { timezone: form.timezone } : {}),
    ...(form.locale ? { locale: form.locale } : {})
  }
}
