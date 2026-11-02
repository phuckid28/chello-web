import { describe, it, expect } from 'vitest'
import {
  validateWorkspaceName,
  validateWorkspaceDescription,
  isHexColor,
  isValidEmail,
  isValidDomain,
  addDomain,
  parseBoundedInt,
  buildInviteLinkPayload,
  inviteLinkStatus,
  INVITE_EXPIRY_HOURS
} from '~/components/Workspace/workspaceValidation'

describe('workspaceValidation — fields', () => {
  it('requires a 2–60 character name', () => {
    expect(validateWorkspaceName('A')).toBe('wsNameRule')
    expect(validateWorkspaceName('  AB  ')).toBeNull()
    expect(validateWorkspaceName('x'.repeat(61))).toBe('wsNameRule')
  })

  it('limits descriptions to 280 characters', () => {
    expect(validateWorkspaceDescription('')).toBeNull()
    expect(validateWorkspaceDescription('x'.repeat(281))).toBe('wsDescriptionRule')
  })

  it('validates hex colors, emails and domains', () => {
    expect(isHexColor('#38bdf8')).toBe(true)
    expect(isHexColor('38bdf8')).toBe(false)
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('nope')).toBe(false)
    expect(isValidDomain('@Company.com')).toBe(true)
    expect(isValidDomain('localhost')).toBe(false)
  })

  it('adds normalized, unique domains without mutating the list', () => {
    const list = ['a.com']
    const next = addDomain(list, ' @B.com ')
    expect(next).toEqual(['a.com', 'b.com'])
    expect(list).toEqual(['a.com'])
    expect(addDomain(next, 'b.com')).toBe(next)
    expect(addDomain(next, 'bad')).toBe(next)
  })
})

describe('workspaceValidation — invite links', () => {
  it('parses optional bounded integers', () => {
    expect(parseBoundedInt('', INVITE_EXPIRY_HOURS)).toBeNull()
    expect(parseBoundedInt('24', INVITE_EXPIRY_HOURS)).toBe(24)
    expect(parseBoundedInt('0', INVITE_EXPIRY_HOURS)).toBeNaN()
    expect(parseBoundedInt('721', INVITE_EXPIRY_HOURS)).toBeNaN()
    expect(parseBoundedInt('1.5', INVITE_EXPIRY_HOURS)).toBeNaN()
  })

  it('builds the payload, omitting empty optional fields', () => {
    expect(buildInviteLinkPayload({ role: 'member', expiresInHours: '', maxUses: '' }))
      .toEqual({ errors: {}, payload: { role: 'member' } })
    expect(buildInviteLinkPayload({ role: 'viewer', expiresInHours: '48', maxUses: '5' }).payload)
      .toEqual({ role: 'viewer', expiresInHours: 48, maxUses: 5 })
  })

  it('reports field errors', () => {
    const result = buildInviteLinkPayload({ role: 'member', expiresInHours: '999', maxUses: '101' })
    expect(result.payload).toBeNull()
    expect(result.errors).toEqual({ expiresInHours: 'wsLinkExpiryRule', maxUses: 'wsLinkMaxUsesRule' })
  })

  it('computes link status', () => {
    const now = 1000
    expect(inviteLinkStatus({ expiresAt: 999 }, now)).toMatchObject({ expired: true, active: false })
    expect(inviteLinkStatus({ maxUses: 2, uses: 2 }, now)).toMatchObject({ exhausted: true, active: false })
    expect(inviteLinkStatus({ expiresAt: 5000, maxUses: 2, uses: 1 }, now).active).toBe(true)
  })
})
