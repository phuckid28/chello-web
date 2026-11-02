import { describe, it, expect } from 'vitest'
import {
  ONBOARDING_STEPS,
  MAX_INVITE_EMAILS,
  shouldShowOnboarding,
  nextStep,
  buildOnboardingPatch,
  parseInviteEmails,
  validateWorkspaceName,
  isOnboardingExemptPath
} from '~/utils/onboarding'

const user = (preferences = {}) => ({ _id: 'u1', preferences })

describe('shouldShowOnboarding', () => {
  it('is true for a logged-in user with an empty loaded workspace tree', () => {
    expect(shouldShowOnboarding(user(), [])).toBe(true)
  })

  it('is false when there is no user', () => {
    expect(shouldShowOnboarding(null, [])).toBe(false)
  })

  it('is false when onboarding is already completed', () => {
    expect(shouldShowOnboarding(user({ onboarding: { completed: true } }), [])).toBe(false)
  })

  it('is still true when onboarding exists but is not completed', () => {
    expect(shouldShowOnboarding(user({ onboarding: { completed: false } }), [])).toBe(true)
  })

  it('is false when the tree is not loaded yet', () => {
    expect(shouldShowOnboarding(user(), undefined)).toBe(false)
    expect(shouldShowOnboarding(user(), null)).toBe(false)
  })

  it('is false when the user already has a workspace', () => {
    expect(shouldShowOnboarding(user(), [{ _id: 'w1' }])).toBe(false)
  })

  it('applies the same rule to global admins', () => {
    expect(shouldShowOnboarding({ ...user(), role: 'admin' }, [])).toBe(true)
  })
})

describe('nextStep', () => {
  it('advances to the following step', () => {
    expect(nextStep({ activeStep: 0 })).toBe(1)
    expect(nextStep({ activeStep: 1 })).toBe(2)
  })

  it('goes to invite after the workspace step when a workspace exists', () => {
    expect(nextStep({ activeStep: 2, workspaceId: 'w1' })).toBe(3)
  })

  it('finishes after the workspace step when no workspace was created', () => {
    expect(nextStep({ activeStep: 2, workspaceId: null })).toBe(ONBOARDING_STEPS.length)
  })

  it('never goes past the finished index', () => {
    expect(nextStep({ activeStep: 3, workspaceId: 'w1' })).toBe(ONBOARDING_STEPS.length)
    expect(nextStep({ activeStep: 99 })).toBe(ONBOARDING_STEPS.length)
  })

  it('treats a missing or invalid step as the first step', () => {
    expect(nextStep({})).toBe(1)
    expect(nextStep()).toBe(1)
  })
})

describe('buildOnboardingPatch', () => {
  it('builds a completed patch with a timestamp', () => {
    const patch = buildOnboardingPatch({ theme: true, language: 1, workspace: false }, true, 1700)
    expect(patch).toEqual({
      onboarding: {
        completed: true,
        steps: { theme: true, language: true, workspace: false, invite: false },
        completedAt: 1700
      }
    })
  })

  it('omits completedAt (null) while in progress', () => {
    const patch = buildOnboardingPatch({ theme: true }, false, 1700)
    expect(patch.onboarding.completed).toBe(false)
    expect(patch.onboarding.completedAt).toBeNull()
  })

  it('does not mutate the input steps and ignores unknown keys', () => {
    const steps = Object.freeze({ theme: true, extra: true })
    const patch = buildOnboardingPatch(steps, false, 1)
    expect(Object.keys(patch.onboarding.steps)).toEqual(ONBOARDING_STEPS)
  })
})

describe('parseInviteEmails', () => {
  it('splits by comma, whitespace and newlines and lowercases', () => {
    const result = parseInviteEmails('A@x.com, b@y.io\nc@z.vn  d@w.co')
    expect(result.valid).toEqual(['a@x.com', 'b@y.io', 'c@z.vn', 'd@w.co'])
    expect(result.invalid).toEqual([])
  })

  it('dedupes case-insensitively and counts duplicates', () => {
    const result = parseInviteEmails('a@x.com A@X.com a@x.com')
    expect(result.valid).toEqual(['a@x.com'])
    expect(result.duplicates).toBe(2)
  })

  it('collects invalid entries', () => {
    const result = parseInviteEmails('nope, a@x.com, @bad.com, c@d')
    expect(result.valid).toEqual(['a@x.com'])
    expect(result.invalid).toEqual(['nope', '@bad.com', 'c@d'])
  })

  it('excludes given emails (e.g. self)', () => {
    const result = parseInviteEmails('me@x.com, you@x.com', { exclude: ['ME@x.com'] })
    expect(result.valid).toEqual(['you@x.com'])
    expect(result.excluded).toEqual(['me@x.com'])
  })

  it(`caps the list at ${MAX_INVITE_EMAILS} and flags overflow`, () => {
    const text = Array.from({ length: 25 }, (_, i) => `u${i}@x.com`).join(',')
    const result = parseInviteEmails(text)
    expect(result.valid).toHaveLength(MAX_INVITE_EMAILS)
    expect(result.overLimit).toBe(true)
  })

  it('handles empty / non-string input', () => {
    expect(parseInviteEmails('')).toEqual({ valid: [], invalid: [], excluded: [], duplicates: 0, overLimit: false })
    expect(parseInviteEmails(undefined).valid).toEqual([])
  })
})

describe('validateWorkspaceName', () => {
  it('requires a name', () => {
    expect(validateWorkspaceName('   ')).toBe('required')
  })

  it('enforces 2–60 characters after trimming', () => {
    expect(validateWorkspaceName(' a ')).toBe('tooShort')
    expect(validateWorkspaceName('x'.repeat(61))).toBe('tooLong')
    expect(validateWorkspaceName('  Chella Lab ')).toBeNull()
  })
})

describe('isOnboardingExemptPath', () => {
  it('exempts onboarding, invite and legal routes', () => {
    expect(isOnboardingExemptPath('/onboarding')).toBe(true)
    expect(isOnboardingExemptPath('/invite/abc')).toBe(true)
    expect(isOnboardingExemptPath('/legal/terms')).toBe(true)
  })

  it('does not exempt normal routes', () => {
    expect(isOnboardingExemptPath('/boards')).toBe(false)
    expect(isOnboardingExemptPath('/onboardingx')).toBe(false)
    expect(isOnboardingExemptPath('')).toBe(false)
  })
})
