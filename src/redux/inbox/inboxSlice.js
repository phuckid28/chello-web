// Notifications inbox state (contract v7 §4): items + cursor per tab, unread badge, optimistic actions
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  archiveNotificationAPI,
  fetchNotificationsAPI,
  fetchUnreadCountAPI,
  markAllNotificationsReadAPI,
  markNotificationReadAPI,
  markNotificationUnreadAPI
} from '~/apis/notificationApi'
import {
  createInboxState,
  findNotification,
  insertIntoTabs,
  isUnread,
  markAllInTabs,
  mergePage,
  patchInTabs,
  removeFromTabs
} from './inboxHelpers'

export const INBOX_PAGE_SIZE = 20

export const fetchInboxTab = createAsyncThunk(
  'inbox/fetchTab',
  async ({ tab, cursor = null }) => {
    const params = { tab, limit: INBOX_PAGE_SIZE, ...(cursor ? { cursor } : {}) }
    const data = await fetchNotificationsAPI(params)
    return { items: Array.isArray(data?.items) ? data.items : [], nextCursor: data?.nextCursor || null, unreadCount: data?.unreadCount }
  }
)

export const fetchUnreadCount = createAsyncThunk('inbox/fetchUnreadCount', async () => {
  const data = await fetchUnreadCountAPI()
  return Number(data?.unreadCount) || 0
})

export const markNotificationRead = createAsyncThunk('inbox/markRead', (id) => markNotificationReadAPI(id))
export const markNotificationUnread = createAsyncThunk('inbox/markUnread', (id) => markNotificationUnreadAPI(id))
export const archiveNotification = createAsyncThunk('inbox/archive', (id) => archiveNotificationAPI(id))
export const markAllNotificationsRead = createAsyncThunk('inbox/markAllRead', () => markAllNotificationsReadAPI())

const clampCount = (value) => Math.max(0, value)

// Every tab becomes stale (refetched on next view) when the server rejects an optimistic action
const invalidateTabs = (state) => {
  Object.keys(state.tabs).forEach((tab) => {
    state.tabs[tab] = { ...state.tabs[tab], loaded: false }
  })
}

const applyReadState = (state, id, readAt) => {
  const current = findNotification(state.tabs, id)
  if (!current) return
  const wasUnread = isUnread(current)
  const willBeUnread = !readAt
  state.tabs = patchInTabs(state.tabs, id, { readAt })
  if (wasUnread && !willBeUnread) state.unreadCount = clampCount(state.unreadCount - 1)
  if (!wasUnread && willBeUnread) state.unreadCount += 1
}

export const inboxSlice = createSlice({
  name: 'inbox',
  initialState: createInboxState(),
  reducers: {
    notificationReceived: (state, action) => {
      const notification = action.payload
      if (!notification?._id || findNotification(state.tabs, notification._id)) return
      state.tabs = insertIntoTabs(state.tabs, notification)
      if (isUnread(notification)) state.unreadCount += 1
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxTab.pending, (state, action) => {
        const { tab } = action.meta.arg
        state.tabs[tab] = { ...state.tabs[tab], loading: true }
      })
      .addCase(fetchInboxTab.fulfilled, (state, action) => {
        const { tab, cursor } = action.meta.arg
        const { items, nextCursor, unreadCount } = action.payload
        const current = state.tabs[tab]
        state.tabs[tab] = { items: mergePage(current.items, items, cursor), nextCursor, loaded: true, loading: false }
        if (Number.isFinite(unreadCount)) state.unreadCount = unreadCount
      })
      .addCase(fetchInboxTab.rejected, (state, action) => {
        const { tab } = action.meta.arg
        state.tabs[tab] = { ...state.tabs[tab], loading: false, loaded: true }
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        applyReadState(state, action.meta.arg, Date.now())
      })
      .addCase(markNotificationUnread.pending, (state, action) => {
        applyReadState(state, action.meta.arg, null)
      })
      .addCase(archiveNotification.pending, (state, action) => {
        const current = findNotification(state.tabs, action.meta.arg)
        if (current && isUnread(current)) state.unreadCount = clampCount(state.unreadCount - 1)
        state.tabs = removeFromTabs(state.tabs, action.meta.arg)
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.tabs = markAllInTabs(state.tabs, Date.now())
        state.unreadCount = 0
      })
      .addMatcher(
        (action) => action.type.startsWith('inbox/') && action.type.endsWith('/rejected') && !action.type.startsWith('inbox/fetch'),
        (state) => invalidateTabs(state)
      )
  }
})

export const { notificationReceived } = inboxSlice.actions

export const selectInboxTab = (tab) => (state) => state.inbox.tabs[tab]
export const selectUnreadCount = (state) => state.inbox.unreadCount

export const inboxReducer = inboxSlice.reducer
