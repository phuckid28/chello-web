import { describe, it, expect } from 'vitest'
import {
  AUDIT_EVENTS,
  auditEventKey,
  backupCodesText,
  deviceLabel,
  groupSecret,
  sortSessions,
  summarizeUserAgent
} from '../security'
import {
  buildNotificationSettings,
  buildPrivacy,
  notificationTypeKey,
  setChannelForAll,
  toggleChannel
} from '../preferences'
import { exportFileName, relativeTimeParts } from '../format'
import { resolveSettingsTab } from '../tabs'

describe('security helpers', () => {
  it('maps every contract audit event to a key', () => {
    expect(AUDIT_EVENTS).toHaveLength(16)
    expect(auditEventKey('login_success')).toBe('setAuditLoginSuccess')
    expect(auditEventKey('token_reuse_detected')).toBe('setAuditTokenReuseDetected')
    expect(auditEventKey('whatever')).toBe('setAuditUnknown')
  })

  it('groups a TOTP secret in blocks of 4', () => {
    expect(groupSecret('JBSWY3DPEHPK3PXPA')).toBe('JBSW Y3DP EHPK 3PXP A')
    expect(groupSecret('')).toBe('')
  })

  it('builds a numbered backup codes file', () => {
    const text = backupCodesText(['aaaa-bbbb', 'cccc-dddd'], { title: 'T', account: 'me@x.dev' })
    expect(text).toBe('T\nme@x.dev\n\n01. aaaa-bbbb\n02. cccc-dddd\n')
  })

  it('summarizes common user agents', () => {
    const chromeWin = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
    const edge = `${chromeWin} Edg/120.0`
    const safariIos = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
    expect(summarizeUserAgent(chromeWin)).toEqual({ browser: 'Chrome', os: 'Windows' })
    expect(summarizeUserAgent(edge).browser).toBe('Edge')
    expect(summarizeUserAgent(safariIos)).toEqual({ browser: 'Safari', os: 'iOS' })
    expect(summarizeUserAgent('')).toEqual({ browser: '', os: '' })
  })

  it('builds a device label from session fields', () => {
    expect(deviceLabel({ browser: 'Firefox', os: 'Linux' })).toBe('Firefox · Linux')
    expect(deviceLabel({ deviceName: 'Desktop', browser: 'Chrome', os: 'macOS' })).toBe('Desktop · Chrome · macOS')
  })

  it('sorts the current session first then by last use', () => {
    const sorted = sortSessions([
      { _id: 'a', lastUsedAt: 5 },
      { _id: 'b', lastUsedAt: 1, current: true },
      { _id: 'c', lastUsedAt: 9 }
    ])
    expect(sorted.map((s) => s._id)).toEqual(['b', 'c', 'a'])
  })
})

describe('notification & privacy helpers', () => {
  it('applies contract defaults', () => {
    const settings = buildNotificationSettings({})
    expect(Object.keys(settings.channels)).toHaveLength(9)
    expect(settings.channels.mention).toEqual({ inApp: true, email: true })
    expect(settings.channels.card_comment).toEqual({ inApp: true, email: false })
    expect(settings.quietHours).toEqual({ enabled: false, start: '22:00', end: '07:00' })
    expect(settings.emailDigest).toBe('off')
  })

  it('keeps saved values', () => {
    const settings = buildNotificationSettings({
      channels: { mention: { inApp: false, email: false } },
      quietHours: { enabled: true, start: '23:00', end: 'bad' },
      emailDigest: 'weekly'
    })
    expect(settings.channels.mention).toEqual({ inApp: false, email: false })
    expect(settings.quietHours).toEqual({ enabled: true, start: '23:00', end: '07:00' })
    expect(settings.emailDigest).toBe('weekly')
  })

  it('toggles immutably', () => {
    const base = buildNotificationSettings({})
    const next = toggleChannel(base, 'due_soon', 'email')
    expect(next.channels.due_soon.email).toBe(true)
    expect(base.channels.due_soon.email).toBe(false)
    const allOff = setChannelForAll(base, 'inApp', false)
    expect(Object.values(allOff.channels).every((c) => c.inApp === false)).toBe(true)
    expect(base.channels.mention.inApp).toBe(true)
  })

  it('names notification type keys', () => {
    expect(notificationTypeKey('card_status_changed')).toBe('setNotifTypeCardStatusChanged')
  })

  it('applies privacy defaults', () => {
    expect(buildPrivacy({})).toEqual({ profileVisibility: 'members', showEmail: false, showActivity: true, showHeatmap: true })
    expect(buildPrivacy({ profileVisibility: 'public', showEmail: true }).showEmail).toBe(true)
  })
})

describe('format & tabs helpers', () => {
  it('computes relative time parts', () => {
    expect(relativeTimeParts(0, 3 * 60 * 1000)).toEqual({ value: -3, unit: 'minute' })
    expect(relativeTimeParts(2 * 24 * 3600 * 1000, 0)).toEqual({ value: 2, unit: 'day' })
    expect(relativeTimeParts('x', 0)).toBeNull()
  })

  it('builds the export file name from the local date', () => {
    expect(exportFileName(new Date(2026, 0, 5))).toBe('chella-export-2026-01-05.json')
  })

  it('resolves settings tabs from the path', () => {
    expect(resolveSettingsTab('/settings/sessions')).toBe('sessions')
    expect(resolveSettingsTab('/settings/data?x=1')).toBe('data')
    expect(resolveSettingsTab('/settings')).toBe('account')
    expect(resolveSettingsTab('/settings/unknown')).toBe('account')
  })
})
