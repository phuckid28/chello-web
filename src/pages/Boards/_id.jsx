// Board Details
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
// import { mockData } from '~/apis/mock-data'
import { useEffect } from 'react'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import { Box, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentSctiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

function Board() {
  const dispatch = useDispatch()
  // Không sử dụng state của component -> sử dụng state của redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentSctiveBoard)

  const { boardId } = useParams()
  console.log('🚀 ~ Board ~ boardId:', boardId)

  useEffect(() => {
    // Call API
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  // Gọi API xử lý khi kéo thả Column xong
  // Gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong board)
  const moveColumns = ( dndOrderedColumns ) => {
    // Update dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    // Trường hợp sử dụng spread operator này thì không bị lỗi vì ở đây không sử dụng push làm thay đổi trực tiếp mở rộng kiểu mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds bằng 2 mảng mới. Tương tự như sử dụng concat ở createNewColumn
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })

  }

  // Gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng) khi di chuyển card trong cùng 1 column
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // Update dữ liệu state board
    // Cannot assign to read only property 'cards' of obj
    // Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc read only - (nested object - can thiệp sâu dữ liệu)
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update board
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // Khi di chuyển card sang column khác:
  // - Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (xoá _id của card ra khỏi mảng)
  // - Cập nhật mảng CardOrderIds của column tiếp theo (thêm _id của card vào mảng)
  // - Cập nhật lại trường columnId mới của card đã kéo
  const moveCardToDifferentColumn = ( currentCardId, prevColumnId, nextColumnId, dndOrderedColumns ) => {

    // Update dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    // Tương tự đoạn xử lý hàm moveColumns nên không ảnh hưởng redux toolkit immutability
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API xử lý BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý khi kéo card cuối cùng ra khỏi column
    // Column rỗng sẽ có placeholder card, cần xoá đi trc khi gửi cho BE
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })

  }

  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading board...</Typography>
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}

        // createNewCard={createNewCard}
        // deleteColumnDetails={deleteColumnDetails}

        // 3 trường hợp move dưới đây sẽ giữ nguyên để code xử lý kéo thả ở BoardContent không bị quá dài không thuận tiện trong đọc code/mantain
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board
