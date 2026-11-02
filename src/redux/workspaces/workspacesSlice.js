import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import {
  fetchWorkspaceTreeAPI,
  createWorkspaceAPI,
  updateWorkspaceAPI,
  moveWorkspaceAPI,
  deleteWorkspaceAPI
} from '~/apis'
import { findNode } from '~/utils/workspaceTree'

export const CURRENT_WORKSPACE_STORAGE_KEY = 'chella_current_workspace'

const readStoredWorkspaceId = () => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(CURRENT_WORKSPACE_STORAGE_KEY)
  } catch (error) {
    return null // storage disabled (private mode) — fall back to no selection
  }
}

const persistWorkspaceId = (workspaceId) => {
  try {
    if (workspaceId) localStorage.setItem(CURRENT_WORKSPACE_STORAGE_KEY, workspaceId)
    else localStorage.removeItem(CURRENT_WORKSPACE_STORAGE_KEY)
  } catch (error) {
    // storage disabled — the selection simply is not remembered across reloads
  }
}

const initialState = {
  tree: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  currentWorkspaceId: readStoredWorkspaceId()
}

export const fetchWorkspaceTree = createAsyncThunk('workspaces/fetchTree', async () => {
  const tree = await fetchWorkspaceTreeAPI()
  return Array.isArray(tree) ? tree : []
})

// Every mutation refreshes the tree so myRole / levels / paths come from the server
const mutateAndRefresh = (type, request) => createAsyncThunk(type, async (arg, { dispatch }) => {
  const result = await request(arg)
  await dispatch(fetchWorkspaceTree())
  return result
})

export const createWorkspace = mutateAndRefresh('workspaces/create', (data) => createWorkspaceAPI(data))
export const updateWorkspace = mutateAndRefresh('workspaces/update', ({ workspaceId, data }) => updateWorkspaceAPI(workspaceId, data))
export const moveWorkspace = mutateAndRefresh('workspaces/move', ({ workspaceId, parentId }) => moveWorkspaceAPI(workspaceId, parentId))
export const deleteWorkspace = mutateAndRefresh('workspaces/delete', (workspaceId) => deleteWorkspaceAPI(workspaceId))

export const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setCurrentWorkspaceId: (state, action) => {
      state.currentWorkspaceId = action.payload || null
    },
    clearWorkspaces: (state) => {
      state.tree = []
      state.status = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaceTree.pending, (state) => {
      state.status = 'loading'
    })
    builder.addCase(fetchWorkspaceTree.fulfilled, (state, action) => {
      state.tree = action.payload
      state.status = 'succeeded'
    })
    builder.addCase(fetchWorkspaceTree.rejected, (state) => {
      state.status = 'failed'
    })
    builder.addCase(deleteWorkspace.fulfilled, (state, action) => {
      if (state.currentWorkspaceId === action.meta.arg) state.currentWorkspaceId = null
    })
  }
})

export const { setCurrentWorkspaceId, clearWorkspaces } = workspacesSlice.actions

// Selects (and remembers) the current workspace; `null` = "All boards"
export const selectWorkspace = (workspaceId) => (dispatch) => {
  persistWorkspaceId(workspaceId)
  dispatch(setCurrentWorkspaceId(workspaceId))
}

export const selectWorkspaceTree = (state) => state.workspaces.tree
export const selectWorkspaceTreeStatus = (state) => state.workspaces.status
export const selectCurrentWorkspaceId = (state) => state.workspaces.currentWorkspaceId
export const selectCurrentWorkspace = createSelector(
  [selectWorkspaceTree, selectCurrentWorkspaceId],
  (tree, workspaceId) => findNode(tree, workspaceId)
)

export const workspacesReducer = workspacesSlice.reducer
