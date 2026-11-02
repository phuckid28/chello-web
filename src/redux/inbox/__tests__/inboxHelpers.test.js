import { describe, it, expect } from 'vitest'
import {
  createInboxState,
  insertIntoTabs,
  markAllInTabs,
  mergePage,
  patchInTabs,
  removeFromTabs,
  resolveNotificationPath,
  tabsForNotification
} from '~/redux/inbox/inboxHelpers'

const loadedState = () => {
  const state = createInboxState()
  return Object.keys(state.tabs).reduce((acc, tab) => ({ ...acc, [tab]: { ...state.tabs[tab], loaded: true } }), {})
}

describe('tabsForNotification', () => {
  it('routes by type and unread state', () => {
    expect(tabsForNotification({ type: 'mention', readAt: null })).toEqual(['all', 'unread', 'mention'])
    expect(tabsForNotification({ type: 'card_assigned', readAt: 1 })).toEqual(['all', 'assigned'])
    expect(tabsForNotification({ type: 'workspace_invite' })).toEqual(['all', 'unread', 'invite'])
    expect(tabsForNotification({ type: 'due_soon', readAt: 5 })).toEqual(['all'])
  })
})

describe('mergePage', () => {
  it('replaces on first page and de-duplicates on later pages', () => {
    expect(mergePage([{ _id: 'a' }], [{ _id: 'b' }], null)).toEqual([{ _id: 'b' }])
    expect(mergePage([{ _id: 'a' }], [{ _id: 'a' }, { _id: 'b' }], 'a')).toEqual([{ _id: 'a' }, { _id: 'b' }])
  })
})

describe('tab mutations are immutable', () => {
  it('inserts a live notification only into loaded matching tabs', () => {
    const tabs = loadedState()
    const next = insertIntoTabs({ ...tabs, assigned: { ...tabs.assigned, loaded: false } }, { _id: 'n1', type: 'mention' })
    expect(next.all.items).toHaveLength(1)
    expect(next.unread.items).toHaveLength(1)
    expect(next.mention.items).toHaveLength(1)
    expect(next.assigned.items).toHaveLength(0)
    expect(tabs.all.items).toHaveLength(0)
  })

  it('patches, removes and marks all read without touching the input', () => {
    const tabs = insertIntoTabs(loadedState(), { _id: 'n1', type: 'mention', readAt: null })
    const patched = patchInTabs(tabs, 'n1', { readAt: 10 })
    expect(patched.mention.items[0].readAt).toBe(10)
    expect(tabs.mention.items[0].readAt).toBeNull()
    expect(removeFromTabs(tabs, 'n1').all.items).toEqual([])
    expect(markAllInTabs(tabs, 99).unread.items[0].readAt).toBe(99)
  })
})

describe('resolveNotificationPath', () => {
  it('prefers internal urls', () => {
    expect(resolveNotificationPath({ url: '/boards/b1/cr/c1' })).toBe('/boards/b1/cr/c1')
    expect(resolveNotificationPath({ url: 'https://app.test/inbox' }, 'https://app.test')).toBe('/inbox')
  })

  it('falls back to the resource kind', () => {
    expect(resolveNotificationPath({ url: '//evil.test', resource: { kind: 'board', id: 'b1' } })).toBe('/boards/b1')
    expect(resolveNotificationPath({ resource: { kind: 'card', id: 'c1', boardId: 'b1' } })).toBe('/boards/b1/cr/c1')
    expect(resolveNotificationPath({ resource: { kind: 'workspace', id: 'w1' } })).toBe('/workspaces/w1')
    expect(resolveNotificationPath({ resource: { kind: 'wiki', id: 'p1', boardId: 'b1' } })).toBe('/boards/b1/wiki/p1')
    expect(resolveNotificationPath({ resource: { kind: 'card', id: 'c1' } })).toBeNull()
    expect(resolveNotificationPath(null)).toBeNull()
  })
})
