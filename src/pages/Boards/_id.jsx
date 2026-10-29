import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { useEffect, useMemo, useState } from 'react'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'

import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { EMPTY_CR_FILTERS, applyFiltersToColumns, normalizeFilters } from '~/utils/crFilters'
import { BOARD_VIEWS, SWITCH_VIEW_EVENT, persistBoardView, readBoardView } from '~/utils/boardEvents'
import { useDeadlineReminder } from '~/customHooks/useDeadlineReminder'
import { useTranslation } from '~/customHooks/useTranslation'

const FILTER_STORAGE_PREFIX = 'chella_board_filters_'

const readStoredFilters = (boardId) => {
  try {
    const raw = sessionStorage.getItem(`${FILTER_STORAGE_PREFIX}${boardId}`)
    return raw ? normalizeFilters(JSON.parse(raw)) : { ...EMPTY_CR_FILTERS }
  } catch (e) {
    // Corrupted or unavailable storage — start with no filters
    return { ...EMPTY_CR_FILTERS }
  }
}

const countRealCards = (columns = []) => columns.reduce(
  (sum, col) => sum + (col.cards || []).filter(c => !c.FE_PlaceholderCard).length,
  0
)

function Board() {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const { tPrimary } = useTranslation()
  const { boardId } = useParams()
  const [filters, setFiltersState] = useState(() => readStoredFilters(boardId))
  const [boardViewMode, setBoardViewModeState] = useState(readBoardView)

  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId))
    setFiltersState(readStoredFilters(boardId))
  }, [dispatch, boardId])

  useEffect(() => {
    const handleSwitchView = (e) => {
      if (BOARD_VIEWS.includes(e.detail)) setBoardViewModeState(e.detail)
    }
    window.addEventListener(SWITCH_VIEW_EVENT, handleSwitchView)
    return () => window.removeEventListener(SWITCH_VIEW_EVENT, handleSwitchView)
  }, [])

  useDeadlineReminder(board?._id === boardId ? board : null, tPrimary('reminderToast'))

  const setFilters = (next) => {
    const normalized = normalizeFilters(next)
    setFiltersState(normalized)
    try {
      sessionStorage.setItem(`${FILTER_STORAGE_PREFIX}${boardId}`, JSON.stringify(normalized))
    } catch (e) {
      // Persisting filters is a convenience only
    }
  }

  const setBoardViewMode = (view) => {
    setBoardViewModeState(view)
    persistBoardView(view)
  }

  const filteredColumns = useMemo(
    () => applyFiltersToColumns(board?.columns || [], filters),
    [board?.columns, filters]
  )
  const filterStats = useMemo(() => ({
    shown: countRealCards(filteredColumns),
    total: countRealCards(board?.columns)
  }), [filteredColumns, board?.columns])

  // Gọi API xử lý khi kéo thả Column xong
  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  // Gọi API để cập nhật mảng cardOrderIds của Column chứa nó khi di chuyển card trong cùng 1 column
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // Khi di chuyển card sang column khác
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    dispatch(updateCurrentActiveBoard(newBoard))

    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds || []
    // Column rỗng sẽ có placeholder card, cần xoá đi trước khi gửi cho BE
    if (prevCardOrderIds[0]?.includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds || []
    })
  }

  if (!board) {
    return <PageLoadingSpinner caption='Chella — A clone of "C"onfluence - tr"ELL"o - jir"A"' />
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <ActiveCard />
      <AppBar boardTheme={board?.theme} />
      <BoardBar
        board={board}
        filters={filters}
        setFilters={setFilters}
        filterStats={filterStats}
        boardViewMode={boardViewMode}
        setBoardViewMode={setBoardViewMode}
      />
      <BoardContent
        board={board}
        filters={filters}
        boardViewMode={boardViewMode}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board
