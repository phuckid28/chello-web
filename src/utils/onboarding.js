// Pure helpers for the first-run onboarding wizard (contract v7 §2 preferences.onboarding, §3 workspaces).
// No browser / store access so everything here stays unit-testable.

export const ONBOARDING_STEPS = Object.freeze(['theme', 'language', 'workspace', 'invite'])
export const MAX_INVITE_EMAILS = 20
export const WORKSPACE_NAME_MIN = 2
export const WORKSPACE_NAME_MAX = 60
export const INVITE_ROLES = Object.freeze(['member', 'admin', 'viewer'])
export const WORKSPACE_ICONS = Object.freeze(['🚀', '🌸', '🌌', '🎐', '🧭', '📚', '🛠️', '🎯', '💡', '🌿', '⚡', '🏯'])
export const ONBOARDING_SESSION_KEY = 'chella_onboarding_checked'

const EXEMPT_PATH = /^\/(onboarding|invite|legal)(\/|$)/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EMAIL_SEPARATORS = /[\s,;]+/

/** True when a logged-in user has not finished onboarding and owns/sees no workspace yet. */
export const shouldShowOnboarding = (user, workspaceTree) => {
  if (!user?._id) return false
  if (user.preferences?.onboarding?.completed === true) return false
  return Array.isArray(workspaceTree) && workspaceTree.length === 0
}

/** Routes that must never be interrupted by the onboarding redirect. */
export const isOnboardingExemptPath = (pathname) => EXEMPT_PATH.test(String(pathname || ''))

/** Index of the next wizard step; `ONBOARDING_STEPS.length` means "finished". */
export const nextStep = ({ activeStep, workspaceId } = {}) => {
  const finished = ONBOARDING_STEPS.length
  const current = Number.isInteger(activeStep) && activeStep >= 0 ? activeStep : 0
  const candidate = Math.min(current + 1, finished)
  // Inviting teammates needs a workspace: skipping creation ends the wizard
  if (ONBOARDING_STEPS[candidate] === 'invite' && !workspaceId) return finished
  return candidate
}

/** PUT /users/preferences payload for the onboarding checklist. */
export const buildOnboardingPatch = (steps = {}, completed = false, now = Date.now()) => ({
  onboarding: {
    completed: Boolean(completed),
    steps: Object.fromEntries(ONBOARDING_STEPS.map((key) => [key, Boolean(steps?.[key])])),
    completedAt: completed ? now : null
  }
})

/** Splits a free-form list (comma / space / newline), lowercases, dedupes, validates and caps it. */
export const parseInviteEmails = (text, { max = MAX_INVITE_EMAILS, exclude = [] } = {}) => {
  const tokens = typeof text === 'string' ? text.split(EMAIL_SEPARATORS).filter(Boolean) : []
  const excludedSet = new Set(exclude.map((email) => String(email).toLowerCase()))
  const seen = new Set()
  const result = tokens.reduce((acc, token) => {
    const email = token.toLowerCase()
    if (seen.has(email)) return { ...acc, duplicates: acc.duplicates + 1 }
    seen.add(email)
    if (!EMAIL_PATTERN.test(email)) return { ...acc, invalid: [...acc.invalid, token] }
    if (excludedSet.has(email)) return { ...acc, excluded: [...acc.excluded, email] }
    return { ...acc, valid: [...acc.valid, email] }
  }, { valid: [], invalid: [], excluded: [], duplicates: 0 })
  return { ...result, valid: result.valid.slice(0, max), overLimit: result.valid.length > max }
}

/** Returns an error code ('required' | 'tooShort' | 'tooLong') or null when valid. */
export const validateWorkspaceName = (name) => {
  const trimmed = String(name || '').trim()
  if (!trimmed) return 'required'
  if (trimmed.length < WORKSPACE_NAME_MIN) return 'tooShort'
  if (trimmed.length > WORKSPACE_NAME_MAX) return 'tooLong'
  return null
}
