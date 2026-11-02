import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './activeBoard/activeBoardSlice'
import { userReducer } from './user/userSlice'
import { activeCardReducer } from './activeCard/activeCardSlice'
import { notificationsReducer } from './notifications/notificationsSlice'
import { workspacesReducer } from './workspaces/workspacesSlice'
import { inboxReducer } from './inbox/inboxSlice'

export const store = configureStore({
  reducer: {
    activeBoard: activeBoardReducer,
    user: userReducer,
    activeCard: activeCardReducer,
    notifications: notificationsReducer,
    workspaces: workspacesReducer,
    inbox: inboxReducer
  }
})
