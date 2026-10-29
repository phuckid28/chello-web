import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibaries/DndKitSensors'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'

import Columns from './ListColumns/Columns/Columns'
import Card from './ListColumns/Columns/ListCards/Card/Card'
import BoardAnalyticsView from './BoardAnalyticsView'
import ObsidianGraphView from './ObsidianGraphView'

import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded'

const COMPANION_LINES_BY_THEME = {
  cosmos: [
    '“Dưới dải ngân hà và vòng tròn hoàng đạo, mỗi CR và chủ đề đều là một vì sao được kết nối chặt chẽ. 🌌”',
    '“Mở Obsidian Graph trên thanh công cụ để quan sát toàn bộ mạng lưới CR và người phụ trách! ✦”',
    '“Nhấn vào nút CR Studio trên thẻ bất kỳ để chạy mô phỏng luồng hệ thống trực quan! 🪐”'
  ],
  'wind-chime': [
    '“Gió nhẹ thoang thoảng tiếng chuông gió Furin... hãy thong thả rà soát từng CR trong kỳ Sprint 34 nhé. 🎐”',
    '“Mỗi cột tương ứng một Chủ đề CR, mỗi thẻ là một CR gắn trực tiếp với người phụ trách (Handle by). 🍃”',
    '“Bấm Xuất Excel Sprint để tải về báo cáo khớp 100% với file template mẫu! ☁️”'
  ],
  furina: [
    '“Chào mừng đến Opera Epiclese! Mọi CR trong Sprint 34 đều xứng đáng một màn trình diễn hoàn hảo! 💧”',
    '“Đừng quên kiểm tra các tài liệu FRD trước giờ mở màn nghiệm thu nhé! 🎩”',
    '“Bấm Xuất Excel Sprint trên thanh công cụ bất cứ lúc nào để tổng hợp báo cáo tiến độ! 🍰”',
    '“Nhấn Ctrl + K để triệu hồi bảng điều khiển nhanh của Fontaine! ✨”'
  ],
  nahida: [
    '“Mỗi tài liệu FRD và quy tắc hệ thống là một nhánh tri thức quý giá trong cây Irminsul. 🌿”',
    '“Hãy mở chế độ Obsidian Graph để kết nối các CR có chung luồng nghiệp vụ lại với nhau nhé! 📖”',
    '“Bạn có thể Import trực tiếp file Markdown (.md) hoặc CSV thành CR Ticket chỉ với 1 cú nhấp chuột! 🍀”',
    '“Nhấn Ctrl + K để tra cứu nhanh bất kỳ CR hay tài liệu nào trên bảng! ✨”'
  ],
  default: [
    '“Thỏ bông Usagi luôn đồng hành cùng bạn theo dõi các CR trong kỳ Sprint 34 này... 🐰”',
    '“Dưới bầu trời bình yên, hãy hoàn thiện từng đặc tả FRD một cách thật tỉ mỉ nhé. ☁️”',
    '“Đừng quên kiểm tra cảnh báo Due date trên thanh công cụ để không bỏ lỡ mốc hoàn thành nào. 💌”',
    '“Nhấn Ctrl + K bất cứ lúc nào để mở nhanh Trung tâm Điều khiển! 🎀”'
  ]
}

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

const FLOATING_PARTICLES = [
  { left: '6%', top: '18%', delay: '0s', duration: '6.2s' },
  { left: '19%', top: '76%', delay: '1.2s', duration: '7.5s' },
  { left: '35%', top: '24%', delay: '2.1s', duration: '6.9s' },
  { left: '52%', top: '14%', delay: '0.6s', duration: '7.8s' },
  { left: '68%', top: '70%', delay: '1.6s', duration: '8.2s' },
  { left: '83%', top: '22%', delay: '2.8s', duration: '6.6s' },
  { left: '93%', top: '58%', delay: '1.1s', duration: '7.2s' }
]

function BoardContent({
  board,
  cardFilterText = '',
  boardViewMode = 'kanban',
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn
}) {
  const { personaKey, themeConfig } = usePersonaTheme(board?.theme)
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [minimizedMascot, setMinimizedMascot] = useState(false)

  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  const lastOverId = useRef(null)

  const companionLines = COMPANION_LINES_BY_THEME[personaKey] || COMPANION_LINES_BY_THEME.default

  useEffect(() => {
    setOrderedColumns(board.columns)
  }, [board])

  const resetDragState = () => {
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  const computeNextColumnsForCardMove = (
    prevColumns,
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

    const isBelowOverItem = active.rect.current.translated &&
      active.rect.current.translated.top > over.rect.top + over.rect.height
    const modifier = isBelowOverItem ? 1 : 0

    const newCardIndex = overCardIndex >= 0
      ? overCardIndex + modifier
      : (overColumn?.cards?.length || 0) + 1

    const nextColumns = cloneDeep(prevColumns)
    const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
    const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

    if (nextActiveColumn) {
      nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

      if (isEmpty(nextActiveColumn.cards)) {
        nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
      }
      nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
    }

    if (nextOverColumn) {
      nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

      const rebuildActiveDraggingCardData = {
        ...activeDraggingCardData,
        columnId: nextOverColumn._id
      }

      nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuildActiveDraggingCardData)
      nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
      nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
    }

    return { nextColumns, nextOverColumn }
  }

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
    if (triggerFrom === 'handleDragEnd') {
      const { nextColumns, nextOverColumn } = computeNextColumnsForCardMove(
        orderedColumns,
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
      setOrderedColumns(nextColumns)
      if (nextOverColumn && oldColumnWhenDraggingCard) {
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }
      return
    }

    setOrderedColumns(prevColumns => {
      const { nextColumns } = computeNextColumnsForCardMove(
        prevColumns,
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = event
    if (!active || !over) return

    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id: overCardId } = over

    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn) return

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

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!active || !over) {
      resetDragState()
      return
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over

      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) {
        resetDragState()
        return
      }

      if (oldColumnWhenDraggingCard?._id !== overColumn._id) {
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
      } else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        if (oldCardIndex !== newCardIndex && oldCardIndex >= 0 && newCardIndex >= 0) {
          const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
          const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

          setOrderedColumns(prevColumns => {
            const nextColumns = cloneDeep(prevColumns)
            const targetColumn = nextColumns.find(column => column._id === overColumn._id)
            if (targetColumn) {
              targetColumn.cards = dndOrderedCards
              targetColumn.cardOrderIds = dndOrderedCardIds
            }
            return nextColumns
          })

          moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
        }
      }
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)

        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        setOrderedColumns(dndOrderedColumns)
        moveColumns(dndOrderedColumns)
      }
    }

    resetDragState()
  }

  const CustomDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    const pointerIntersections = pointerWithin(args)
    if (!pointerIntersections?.length) return

    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  const displayedColumns = cardFilterText.trim()
    ? orderedColumns.map(col => ({
      ...col,
      cards: col.cards.filter(card => {
        if (card.FE_PlaceholderCard) return true
        const q = cardFilterText.trim().toLowerCase()
        const matchTitle = card.title?.toLowerCase().includes(q)
        const matchCrCode = card.crCode?.toLowerCase().includes(q)
        const matchAssignee = card.assignee?.toLowerCase().includes(q)
        const matchSprint = card.sprint?.toLowerCase().includes(q)
        const matchLabel = card.labels?.some(
          l => l.id?.toLowerCase().includes(q) || l.title?.toLowerCase().includes(q)
        )
        return matchTitle || matchCrCode || matchAssignee || matchSprint || matchLabel
      })
    }))
    : orderedColumns

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDragState}
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
    >
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: (theme) => `${
          theme.palette.mode === 'dark' ? themeConfig.boardOverlayDark : themeConfig.boardOverlayLight
        }, url(${themeConfig.heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        display: 'flex',
        p: '12px 0'
      }}>
        {/* Ambient Anime Floating Particles */}
        {FLOATING_PARTICLES.map((p, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              fontSize: '1.25rem',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
              animation: `chelloFloat ${p.duration} ease-in-out ${p.delay} infinite`
            }}
          >
            {themeConfig.particleSymbols[idx % themeConfig.particleSymbols.length]}
          </Box>
        ))}

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100%' }}>
          {boardViewMode === 'overview' ? (
            <BoardAnalyticsView columns={displayedColumns} themeConfig={themeConfig} />
          ) : boardViewMode === 'graph' ? (
            <ObsidianGraphView columns={displayedColumns} themeConfig={themeConfig} />
          ) : (
            <ListColumns columns={displayedColumns} />
          )}
        </Box>

        {/* Visual Novel Style Character Chibi Mascot HUD */}
        {minimizedMascot ? (
          <Tooltip title={`Mở hộp thoại ${themeConfig.characterName}`} placement="left">
            <Avatar
              src={themeConfig.mascotImage}
              alt={themeConfig.characterName}
              onClick={() => {
                playUiChime('sparkle')
                setMinimizedMascot(false)
              }}
              sx={{
                position: 'absolute',
                right: 18,
                bottom: 16,
                zIndex: 2,
                width: 48,
                height: 48,
                cursor: 'pointer',
                border: `2px solid ${themeConfig.accentColor}`,
                animation: 'chelloPulseHalo 2.6s infinite',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.08)' }
              }}
            />
          </Tooltip>
        ) : (
          <Box
            sx={{
              position: 'absolute',
              right: 18,
              bottom: 16,
              zIndex: 2,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.5,
              px: 1.75,
              py: 1.15,
              borderRadius: '18px',
              userSelect: 'none',
              bgcolor: 'rgba(15, 23, 42, 0.84)',
              backdropFilter: 'blur(16px) saturate(160%)',
              border: `1px solid ${themeConfig.accentColor}`,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.42)',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: themeConfig.secondaryAccent
              }
            }}
          >
            <Avatar
              src={themeConfig.mascotImage}
              alt={themeConfig.characterName}
              onClick={() => {
                playUiChime('sparkle')
                setQuoteIdx((prev) => (prev + 1) % companionLines.length)
              }}
              sx={{
                width: 46,
                height: 46,
                cursor: 'pointer',
                border: `2px solid ${themeConfig.accentColor}`,
                animation: 'chelloPulseHalo 3s infinite'
              }}
            />
            <Box
              onClick={() => {
                playUiChime('sparkle')
                setQuoteIdx((prev) => (prev + 1) % companionLines.length)
              }}
              sx={{ maxWidth: 255, cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <SoraBunnyIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: themeConfig.accentColor, letterSpacing: 0.3 }} noWrap>
                  【 {themeConfig.characterName} 】
                </Typography>
                <SoraRibbonIcon sx={{ fontSize: 13 }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.92)', display: 'block', lineHeight: 1.3 }}>
                {companionLines[quoteIdx % companionLines.length]}
              </Typography>
            </Box>
            <Tooltip title="Thu gọn hộp thoại nhân vật">
              <IconButton
                size="small"
                onClick={() => setMinimizedMascot(true)}
                sx={{ color: 'rgba(248, 250, 252, 0.65)', p: 0.4, '&:hover': { color: 'white' } }}
              >
                <CloseFullscreenRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <DragOverlay dropAnimation={CustomDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Columns column={activeDragItemData} />}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
