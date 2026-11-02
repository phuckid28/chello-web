// Settings tab registry (routes /settings/<key> are registered in App.jsx)

export const SETTINGS_TAB_KEYS = Object.freeze([
  'account', 'profile', 'security', 'sessions', 'notifications', 'privacy', 'appearance', 'data'
])

export const DEFAULT_SETTINGS_TAB = 'account'

export const TAB_LABEL_KEYS = Object.freeze({
  account: 'tabAccount',
  profile: 'setTabProfile',
  security: 'tabSecurity',
  sessions: 'setTabSessions',
  notifications: 'setTabNotifications',
  privacy: 'setTabPrivacy',
  appearance: 'tabAppearance',
  data: 'setTabData'
})

/** `/settings/security` → `security`; unknown or missing segments → `account`. */
export const resolveSettingsTab = (pathname = '') => {
  const match = String(pathname).match(/\/settings\/([^/?#]+)/)
  const key = match ? match[1].toLowerCase() : ''
  return SETTINGS_TAB_KEYS.includes(key) ? key : DEFAULT_SETTINGS_TAB
}
