// Pure form rules for workspace / invite-link forms (contract v7 §3). Returns i18n keys for errors.

export const WORKSPACE_NAME_MIN = 2
export const WORKSPACE_NAME_MAX = 60
export const WORKSPACE_DESCRIPTION_MAX = 280
export const INVITE_EXPIRY_HOURS = Object.freeze({ min: 1, max: 720 })
export const INVITE_MAX_USES = Object.freeze({ min: 1, max: 100 })

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const DOMAIN = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const validateWorkspaceName = (name) => {
  const length = String(name || '').trim().length
  return length >= WORKSPACE_NAME_MIN && length <= WORKSPACE_NAME_MAX ? null : 'wsNameRule'
}

export const validateWorkspaceDescription = (description) =>
  (String(description || '').length <= WORKSPACE_DESCRIPTION_MAX ? null : 'wsDescriptionRule')

export const isHexColor = (value) => HEX_COLOR.test(String(value || ''))

export const isValidEmail = (value) => EMAIL.test(String(value || '').trim())

export const normalizeDomain = (value) => String(value || '').trim().toLowerCase().replace(/^@+/, '')

export const isValidDomain = (value) => DOMAIN.test(normalizeDomain(value))

// Adds a domain to the list (normalized, de-duplicated). Returns the same list when invalid.
export const addDomain = (domains, value) => {
  const domain = normalizeDomain(value)
  if (!isValidDomain(domain) || domains.includes(domain)) return domains
  return [...domains, domain]
}

// '' → null (optional field); otherwise an integer within bounds, or NaN when invalid
export const parseBoundedInt = (value, { min, max }) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  if (!Number.isInteger(number) || number < min || number > max) return Number.NaN
  return number
}

export const buildInviteLinkPayload = ({ role, expiresInHours, maxUses }) => {
  const expiry = parseBoundedInt(expiresInHours, INVITE_EXPIRY_HOURS)
  const uses = parseBoundedInt(maxUses, INVITE_MAX_USES)
  const errors = {
    ...(Number.isNaN(expiry) ? { expiresInHours: 'wsLinkExpiryRule' } : {}),
    ...(Number.isNaN(uses) ? { maxUses: 'wsLinkMaxUsesRule' } : {})
  }
  if (Object.keys(errors).length) return { errors, payload: null }
  return {
    errors: {},
    payload: {
      role,
      ...(expiry !== null ? { expiresInHours: expiry } : {}),
      ...(uses !== null ? { maxUses: uses } : {})
    }
  }
}

// `{ expired, exhausted, active }` for an invite link at `now` (ms)
export const inviteLinkStatus = (link, now = Date.now()) => {
  const expired = Boolean(link?.expiresAt) && Number(link.expiresAt) <= now
  const exhausted = Boolean(link?.maxUses) && Number(link.uses || 0) >= Number(link.maxUses)
  return { expired, exhausted, active: !expired && !exhausted }
}
