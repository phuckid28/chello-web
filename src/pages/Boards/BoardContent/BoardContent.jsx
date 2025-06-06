import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'

import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
  // closestCenter

} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibaries/DndKitSensors'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'

import Columns from './ListColumns/Columns/Columns'
import Card from './ListColumns/Columns/ListCards/Card/Card'

import { cloneDeep, isEmpty } from 'lodash'

import { generatePlaceholderCard } from '~/utils/formatters'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn
}) {
  // Nếu sử dụng PointerSensor mặc định thì phải kết hợp thuộc tính CSS touch-action: none ở nhg phần tử kéo thả - nhg còn bug
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // Yêu cầu di chuyển chuột 10px ms kích hoạt event, tránh bị gọi event khi click only
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // Nhấn giữ 250ms và dung sai của cảm ứng 500px mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // const sensors = useSensors(pointerSensor)
  // Ưu tiên sử dụng mouse và touch để trải nghiệm tốt nhất và tránh bug
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // Cùng 1 thời điểm chỉ có 1 phần tử đang được kéo, column hoặc card
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng trc đó (xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null)

  useEffect(() => {
    // Columns đã được sắp xếp ở component cha cao nhất (boards/_id.jsx)
    setOrderedColumns(board.columns)
  }, [board])

  // Tìm 1 column theo cardId
  const findColumnByCardId = (cardId) => {
    // Nên dùng c.cards thay vì c.cardOrderIds vì ở handleDragOver ta sẽ làm dữ liệu cho card hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Function xử lý việc cập nhật lại state  trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị trí của overCard trong column đích (nơi activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán "cardIndex mới" (trên hoặc dưới overCard) lấy chuẩn ra từ code của thư viên - cần giải thích code thêm
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0

      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.card?.length + 1

      // Clone mảng OrderedColumnState cũ ra 1 cái mới để xử lý data rồi return - cập nhật lại OrderedColumnState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // Column cũ
      if (nextActiveColumn) {
        // Xoá card ở column active (column cũ, thời điểm kéo card ra khỏi đó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm PlaceholderCar nếu column rỗng
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // Column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì xoá
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 columnId khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }

        // Thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Xoá PlaceholderCard nếu có
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      // Nếu function đc gọi từ handleDragEnd là đã kéo thả card xong, lúc này mới gọi API 1 lần ở đây
      if (triggerFrom === 'handleDragEnd') {
        // Gọi lên function moveCardToDifferentColumn nằm ở component cha cao nhất (boards/_id.jsx)
        // Lúc này có thể gọi API ở đây là được thay vì phải lần lượt gọi ngược lên những component cha phía trên
        // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ handleDragStart) chứ không phải activeDrag trong scope handleDragEnd này vì sau khi đi qua onDragOver và tới đây là state của card đã bị cập nhật 1 lần
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }
      // console.log('nextColumns: ', nextColumns)
      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)

    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // Nếu đang kéo card mới set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger trong quá trình kéo -> thả 1 phần tử
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // console.log('handleDragOver: ', event)

    // Xử lý khi kéo Card giữa các columns
    const { active, over } = event

    // Nếu ko tồn tại active và over (kéo ra khỏi phạm vi container) -> return
    if (!active || !over) return

    // activeDraggingCardId: card đang dc kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overcardId:  card đang tương tác trên hoặc dưới so với card đc kéo ở trên
    const { id: overCardId } = over

    // Tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại 1 trong 2 column -> ko làm gì hết tránh crash
    if (!activeColumn || !overColumn) return

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì ko làm gì
    // Vì đây dg làm đoạn xử lý khi kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì ở phần khác ở handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // Trigger khi thả phần tử
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    // Nếu ko tồn tại active và over (kéo ra khỏi phạm vi container) -> return
    if (!active || !over) return

    // Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCardId: card đang dc kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overcardId:  card đang tương tác trên hoặc dưới so với card đc kéo ở trên
      const { id: overCardId } = over

      // Tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tồn tại 1 trong 2 column -> ko làm gì hết tránh crash
      if (!activeColumn || !overColumn) return

      // Hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng activeDragItemData.columnnId hoặc oldColumnWhenDraggingCard._id (set vào state từ handleDragStart) chứ ko phải activeData trong scope handleDragItemData vì khi đi qua onDragOver là state của card đã bị cập nhật 1 lần r
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // Hành động kéo thả card giữa 2 column khác nhau
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      }
      else {
        // Hành động kéo thả card giữa cùng 1 column

        // Lấy vị trí cũ (từ oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex( c => c._id === activeDragItemId )
        // Lấy vị trí mới (từ overColumn)
        const newCardIndex = overColumn?.cards.findIndex( c => c._id === overCardId )

        // Dùng arrayMove vì kéo card trong 1 column thì tg tự với logic với column trong 1 board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

        // Vẫn update state để tránh delay hoặc flickering lúc kéo thả khi chờ gọi API
        setOrderedColumns(prevColumns => {
          // Clone mảng OrderedColumnState cũ ra 1 cái mới để xử lý data rồi return - cập nhật lại OrderedColumnState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm column đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại 2 gtri mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardIds
          // console.log('tarrgetColumnm: ', targetColumn)

          // Return gtri state mới đúng vị trí
          return nextColumns
        })

        // Gọi lên function moveCardInTheSameColumn nằm ở component cha cao nhất (boards/_id.jsx)
        // Lúc này có thể gọi API ở đây là được thay vì phải lần lượt gọi ngược lên những component cha phía trên
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
      }
    }

    // Xử lý kéo thả column trong 1 boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vtri sau khi kéo khác ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ (từ active)
        const oldColumnIndex = orderedColumns.findIndex( c => c._id === active.id )
        // Lấy vị trí mới (từ over)
        const newColumnIndex = orderedColumns.findIndex( c => c._id === over.id )

        // Dùng arrayMove của dnd-kit để sắp xếp lại mảng Columns ban đầu
        // Code của arrayMove: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // Vẫn cập nhật columns sau khi thả để tránh delay hoặc flickering lúc chờ gọi API
        setOrderedColumns(dndOrderedColumns)

        // Gọi lên function moveColumns nằm ở component cha cao nhất (boards/_id.jsx)
        // Lúc này có thể gọi API ở đây là được thay vì phải lần lượt gọi ngược lên những component cha phía trên
        moveColumns(dndOrderedColumns)

      }
    }

    // Những dữ liệu sau khi kéo thả phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // console.log('activeDragItemId: ', activeDragItemId)
  // console.log('activeDragItemdType: ', activeDragItemType)
  // console.log('activeDragItemData: ', activeDragItemData)

  // Animation khi drop phần tử
  const CustomDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  // Custom thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  // args = arguments
  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm, trả về 1 mảng va chạm - intersection vs con trỏ
    const pointerIntersections = pointerWithin(args)

    // Nếu pointerIntersections là mảng rỗng, return không làm gì
    // Fix trường hợp flickering của dnd-kit trong trg hợp: Kéo 1 card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersections?.length) return

    // // Thuật toán phát hiện va chạm sẽ trả về 1 mảng các va chạm
    // // Không cần nữa
    // const intersections =
    //     !!pointerIntersections?.length
    //       ? pointerIntersections
    //       : rectIntersection(args)

    // Tìm overId đầu tiên trong pointerIntersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {

      // Nếu over dg là column thì sẽ tìm tới cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán phát triển va chạm closestCenter đều đc, closestCorners có vẻ mượt hơn
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('over before: ', overId)
        overId = closestCorners ({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('over after: ', overId)
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }

    // Nếu overId là null thì trả về mảng rỗng
    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // Thuật toán phát hiện va chạm (nếu ko có thì card với cover lớn sẽ bị confilct với card và column không kéo qua column được)
      // Sử dụng closestCorners thay cho closestCenter
      // collisionDetection={closestCorners}
      // Cảm biến
      sensors={sensors}
      // Nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu
      // Tự custom thuật toán phát hiện va chạm
      collisionDetection = {collisionDetectionStrategy}

    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        display: 'flex',
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={CustomDropAnimation}>
          {/* Kiểm tra có đang kéo không */}
          {(!activeDragItemType) && null}
          {/* overlay mờ khi kéo */}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Columns column={activeDragItemData} /> }
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} /> }
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent