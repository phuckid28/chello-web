import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

// Khởi tạo giá trị State của một Slice trong Redux
const initialState = {
  currentUser: null
}

// Các hành động gọi api bất đồng bộ và cập nhật dữ liệu vào Redux cần sử dungj Middleware createAsyncThunk đi kèm với extraReducers
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    // axios sẽ trả kết quả qua poperty của nó là data
    return response.data
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {},
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload ở đây là response.data trả về ở trên
      const user = action.payload
      state.currentUser = user
    })
  }
})

// Actions: Là nơi dành cho các Components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Ở trên sẽ có properties actions vì những actions này được redux tạo tự động theo tên của reducer

// export const {} = userSlice.actions

// Selectors: Là nơi dành cho các Components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer