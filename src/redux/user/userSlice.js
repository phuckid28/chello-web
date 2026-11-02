import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'

const USER_STORAGE_KEY = 'chello_current_user'

const loadPersistedUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

const savePersistedUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch (error) {
    // Ignore storage quota errors
  }
}

// Khởi tạo giá trị State của một Slice trong Redux
const initialState = {
  currentUser: loadPersistedUser()
}

// Các hành động gọi api bất đồng bộ và cập nhật dữ liệu vào Redux cần sử dụng Middleware createAsyncThunk đi kèm với extraReducers
// Login rejects with { status, code, message, lockedUntil } so the form can render the 2FA step / lockout inline
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
      return response.data
    } catch (error) {
      const payload = error?.response?.data || {}
      return rejectWithValue({
        status: error?.response?.status || 0,
        code: payload.code || null,
        message: payload.message || error?.message || '',
        lockedUntil: payload.lockedUntil || null
      })
    }
  }
)

// Refreshes the SelfUser (profile, preferences, privacy, 2FA flags…) from GET /users/me
export const fetchMeAPI = createAsyncThunk(
  'user/fetchMeAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/me`, { silent: true })
    return response.data
  }
)

export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage = true) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data
  }
)

export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    return response.data
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null
      savePersistedUser(null)
    },
    // Any endpoint returning a SelfUser (profile, status, privacy, preferences…) replaces the cached user
    setCurrentUser: (state, action) => {
      const user = action.payload
      if (!user || typeof user !== 'object') return
      state.currentUser = user
      savePersistedUser(user)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
      savePersistedUser(user)
    })
    builder.addCase(fetchMeAPI.fulfilled, (state, action) => {
      const user = action.payload
      if (!user || typeof user !== 'object') return
      state.currentUser = user
      savePersistedUser(user)
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.currentUser = null
      savePersistedUser(null)
    })
    builder.addCase(logoutUserAPI.rejected, (state) => {
      state.currentUser = null
      savePersistedUser(null)
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
      savePersistedUser(user)
    })
  }
})

export const { clearCurrentUser, setCurrentUser } = userSlice.actions

export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer
