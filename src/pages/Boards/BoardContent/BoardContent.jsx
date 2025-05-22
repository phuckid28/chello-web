import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'

import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects

} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'

import Columns from './ListColumns/Columns/Columns'
import Card from './ListColumns/Columns/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
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

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  // Trigger khi bắt đầu kéo phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)

    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }

  // Trigger khi thả phần tử
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    // Ktra nếu không tồn tại over
    if (!over) return

    // Nếu vtri sau khi kéo khác ban đầu
    if (active.id !== over.id) {
      // Lấy vị trí cũ (từ active)
      const oldIndex = orderedColumns.findIndex( c => c._id === active.id )
      // Lấy vị trí mới (từ over)
      const newIndex = orderedColumns.findIndex( c => c._id === over.id )

      // Dùng arrayMove của dnd-kit để sắp xếp lại mảng Columns ban đầu
      // Code của arrayMove: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // 2 console log dữ liệu này sau dùng để xử lý gọi api
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

      // console.log('dndOderedColumns: ', dndOrderedColumns)
      // console.log('dndOderedColumnsIds: ', dndOrderedColumnsIds)

      // Cập nhật columns sau khi thả
      setOrderedColumns(dndOrderedColumns)
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
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

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
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