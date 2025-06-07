import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sort'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

// Khởi tạo giá trị State của một Slice trong Redux
const initialState = {
  currentActiveBoard: null
}

// Các hành động gọi api bất đồng bộ và cập nhật dữ liệu vào Redux cần sử dungj Middleware createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // axios sẽ trả kết quả qua poperty của nó là data
    return response.data
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Luôn cần cặp ngoặc nhọn cho các function trong redux (rule của redux)
    updateCurrentActiveBoard: (state, action) => {
      // Chuẩn đặt tên nhận dữ liệu vào redux, gắn nó ra 1 biến có nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần

      // Update dữ liệu currentActiveBoard
      state.currentActiveBoard = board
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload ở đây là response.data trả về ở trên
      let board = action.payload

      // Sắp xếp thứ tự các columns luôn ở đây trc khi đưa dữ liệu xuống bên dưới các component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        // Khi f5/refresh thì cần xử lý vấn đề kéo thả vào 1 column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // Sắp xếp thứ tự các cards luôn ở đây trc khi đưa dữ liệu xuống bên dưới các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // Update dữ liệu currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Actions: Là nơi dành cho các Components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Ở trên sẽ có properties actions vì những actions này được redux tạo tự động theo tên của reducer

export const { updateCurrentActiveBoard } = activeBoardSlice.actions

// Selectors: Là nơi dành cho các Components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentSctiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

// File có tên là activeBoardSlice nhưng cần export ra reducer
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer