// Pure helpers for Settings → Notifications / Privacy / Appearance (contract §2, §4)

export const NOTIFICATION_TYPES = Object.freeze([
  'mention', 'card_assigned', 'card_comment', 'card_status_changed', 'due_soon',
  'board_invite', 'workspace_invite', 'role_changed', 'security_alert'
])
export const NOTIFICATION_CHANNELS = Object.freeze(['inApp', 'email'])
export const DEFAULT_EMAIL_TYPES = Object.freeze(['mention', 'card_assigned', 'workspace_invite', 'board_invite', 'security_alert'])
export const DIGEST_OPTIONS = Object.freeze(['off', 'daily', 'weekly'])
export const DEFAULT_QUIET_HOURS = Object.freeze({ enabled: false, start: '22:00', end: '07:00' })

export const VISIBILITY_OPTIONS = Object.freeze(['public', 'members', 'private'])
export const DEFAULT_PRIVACY = Object.freeze({
  profileVisibility: 'members',
  showEmail: false,
  showActivity: true,
  showHeatmap: true
})

export const DENSITY_OPTIONS = Object.freeze(['comfortable', 'compact'])
export const BOARD_VIEW_OPTIONS = Object.freeze(['overview', 'kanban', 'timeline', 'graph'])

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const bool = (value, fallback) => (typeof value === 'boolean' ? value : fallback)
const pickTime = (value, fallback) => (TIME_RE.test(String(value || '')) ? value : fallback)

/** `card_status_changed` → `setNotifTypeCardStatusChanged` */
export const notificationTypeKey = (type) => `setNotifType${String(type)
  .split('_')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')}`

/** Full notification settings with contract defaults filled in. */
export const buildNotificationSettings = (saved = {}) => {
  const channels = Object.fromEntries(NOTIFICATION_TYPES.map((type) => {
    const current = saved?.channels?.[type] || {}
    return [type, {
      inApp: bool(current.inApp, true),
      email: bool(current.email, DEFAULT_EMAIL_TYPES.includes(type))
    }]
  }))
  const quiet = saved?.quietHours || {}
  return {
    channels,
    quietHours: {
      enabled: bool(quiet.enabled, DEFAULT_QUIET_HOURS.enabled),
      start: pickTime(quiet.start, DEFAULT_QUIET_HOURS.start),
      end: pickTime(quiet.end, DEFAULT_QUIET_HOURS.end)
    },
    emailDigest: DIGEST_OPTIONS.includes(saved?.emailDigest) ? saved.emailDigest : 'off'
  }
}

/** Immutable toggle of one channel cell. */
export const toggleChannel = (settings, type, channel) => ({
  ...settings,
  channels: {
    ...settings.channels,
    [type]: { ...settings.channels[type], [channel]: !settings.channels[type][channel] }
  }
})

/** Immutable set of one channel for every type (column "all on/off"). */
export const setChannelForAll = (settings, channel, value) => ({
  ...settings,
  channels: Object.fromEntries(Object.entries(settings.channels)
    .map(([type, cell]) => [type, { ...cell, [channel]: value }]))
})

export const buildPrivacy = (saved = {}) => ({
  profileVisibility: VISIBILITY_OPTIONS.includes(saved?.profileVisibility)
    ? saved.profileVisibility
    : DEFAULT_PRIVACY.profileVisibility,
  showEmail: bool(saved?.showEmail, DEFAULT_PRIVACY.showEmail),
  showActivity: bool(saved?.showActivity, DEFAULT_PRIVACY.showActivity),
  showHeatmap: bool(saved?.showHeatmap, DEFAULT_PRIVACY.showHeatmap)
})

/** Shallow structural equality for small settings objects (used to enable Save). */
export const isSameSettings = (a, b) => JSON.stringify(a) === JSON.stringify(b)
