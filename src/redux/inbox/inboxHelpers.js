// Pure, immutable helpers behind inboxSlice and the notification UI (contract v7 §4)

export const INBOX_TABS = Object.freeze(['all', 'unread', 'mention', 'assigned', 'invite'])

const TYPE_TAB = Object.freeze({
  mention: 'mention',
  card_assigned: 'assigned',
  board_invite: 'invite',
  workspace_invite: 'invite'
})

export const emptyTabState = () => ({ items: [], nextCursor: null, loaded: false, loading: false })

export const createInboxState = () => ({
  tabs: INBOX_TABS.reduce((acc, tab) => ({ ...acc, [tab]: emptyTabState() }), {}),
  unreadCount: 0
})

export const isUnread = (notification) => !notification?.readAt

/** Tabs a freshly delivered notification belongs to. */
export const tabsForNotification = (notification) => {
  const typed = TYPE_TAB[notification?.type]
  return ['all', ...(isUnread(notification) ? ['unread'] : []), ...(typed ? [typed] : [])]
}

/** Appends a fetched page (or replaces the list when `cursor` is empty), de-duplicating by _id. */
export const mergePage = (existing = [], incoming = [], cursor) => {
  if (!cursor) return [...incoming]
  const seen = new Set(existing.map(n => n._id))
  return [...existing, ...incoming.filter(n => !seen.has(n._id))]
}

export const prependUnique = (items = [], notification) =>
  (items.some(n => n._id === notification._id) ? items : [notification, ...items])

export const findNotification = (tabs, id) => {
  for (const tab of INBOX_TABS) {
    const hit = tabs[tab]?.items.find(n => n._id === id)
    if (hit) return hit
  }
  return null
}

export const patchInTabs = (tabs, id, patch) =>
  INBOX_TABS.reduce((acc, tab) => {
    const state = tabs[tab]
    return { ...acc, [tab]: { ...state, items: state.items.map(n => (n._id === id ? { ...n, ...patch } : n)) } }
  }, {})

export const removeFromTabs = (tabs, id) =>
  INBOX_TABS.reduce((acc, tab) => {
    const state = tabs[tab]
    return { ...acc, [tab]: { ...state, items: state.items.filter(n => n._id !== id) } }
  }, {})

export const markAllInTabs = (tabs, readAt) =>
  INBOX_TABS.reduce((acc, tab) => {
    const state = tabs[tab]
    return { ...acc, [tab]: { ...state, items: state.items.map(n => (n.readAt ? n : { ...n, readAt })) } }
  }, {})

export const insertIntoTabs = (tabs, notification) => {
  const targets = new Set(tabsForNotification(notification))
  return INBOX_TABS.reduce((acc, tab) => {
    const state = tabs[tab]
    const shouldInsert = targets.has(tab) && state.loaded
    return { ...acc, [tab]: shouldInsert ? { ...state, items: prependUnique(state.items, notification) } : state }
  }, {})
}

// Resource kind → internal route, used when `notification.url` is missing or external
const resourcePath = (resource) => {
  if (!resource?.id) return null
  switch (resource.kind) {
  case 'card': return resource.boardId ? `/boards/${resource.boardId}/cr/${resource.id}` : null
  case 'board': return `/boards/${resource.id}`
  case 'workspace': return `/workspaces/${resource.id}`
  case 'wiki': return resource.boardId ? `/boards/${resource.boardId}/wiki/${resource.id}` : null
  default: return null
  }
}

/** Internal path to open for a notification, or null when nothing navigable exists. */
export const resolveNotificationPath = (notification, origin = '') => {
  const url = typeof notification?.url === 'string' ? notification.url.trim() : ''
  if (url.startsWith('/') && !url.startsWith('//')) return url
  if (url && origin && url.startsWith(`${origin}/`)) return url.slice(origin.length)
  return resourcePath(notification?.resource)
}
