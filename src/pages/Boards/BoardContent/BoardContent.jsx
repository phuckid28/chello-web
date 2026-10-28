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

import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { soraChibi } from '~/utils/animeTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded'

const SORA_COMPANION_LINES = [
  '“Usagi plush is watching over your tasks today... 🐰”',
  '“Under the distant sky of Okukozome, take one gentle step at a time. ☁️”',
  '“Don’t forget to rest and check your flip-phone messages. 💌”',
  '“Every card completed brings us closer to the promised horizon. 🎀”',
  '“Press Ctrl + K anytime to summon the Okukozome Command Center! ✨”'
]

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
  const { themeConfig } = usePersonaTheme(board?.theme)
  // Yêu cầu di chuyển chuột 10px mới kích hoạt event, tránh bị gọi event khi click only
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // Nhấn giữ 250ms và dung sai của cảm ứng 500px mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [minimizedMascot, setMinimizedMascot] = useState(false)

  // Cùng 1 thời điểm chỉ có 1 phần tử đang được kéo, column hoặc card
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns(board.columns)
  }, [board])

  const resetDragState = () => {
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // Tìm 1 column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Tính toán mảng columns mới khi di chuyển card giữa các column khác nhau
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

  // Function xử lý việc cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau
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

  // Trigger khi bắt đầu kéo phần tử
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger trong quá trình kéo -> thả 1 phần tử
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

  // Trigger khi thả phần tử
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!active || !over) {
      resetDragState()
      return
    }

    // Xử lý kéo thả card
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
      } else {
        // Hành động kéo thả card trong cùng 1 column
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

    // Xử lý kéo thả column trong 1 boardContent
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
        const matchLabel = card.labels?.some(
          l => l.id?.toLowerCase().includes(q) || l.title?.toLowerCase().includes(q)
        )
        return matchTitle || matchLabel
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
          ) : (
            <ListColumns columns={displayedColumns} />
          )}
        </Box>

        {/* Visual Novel Style Chibi Sora & Usagi Plush Mascot HUD */}
        {minimizedMascot ? (
          <Tooltip title="Expand Chibi Sora & Usagi Dialogue Box" placement="left">
            <Avatar
              src={soraChibi}
              alt="Chibi Sora"
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
                border: `2px solid ${themeConfig.secondaryAccent}`,
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
                borderColor: '#f472b6'
              }
            }}
          >
            <Avatar
              src={soraChibi}
              alt="Chibi Sora & Usagi"
              onClick={() => {
                playUiChime('sparkle')
                setQuoteIdx((prev) => (prev + 1) % SORA_COMPANION_LINES.length)
              }}
              sx={{
                width: 46,
                height: 46,
                cursor: 'pointer',
                border: `2px solid ${themeConfig.secondaryAccent}`,
                animation: 'chelloPulseHalo 3s infinite'
              }}
            />
            <Box
              onClick={() => {
                playUiChime('sparkle')
                setQuoteIdx((prev) => (prev + 1) % SORA_COMPANION_LINES.length)
              }}
              sx={{ maxWidth: 235, cursor: 'pointer' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <SoraBunnyIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: themeConfig.accentColor, letterSpacing: 0.3 }}>
                  【 春日野 穹 • Sora & Usagi 】
                </Typography>
                <SoraRibbonIcon sx={{ fontSize: 13 }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.92)', display: 'block', lineHeight: 1.3 }}>
                {SORA_COMPANION_LINES[quoteIdx]}
              </Typography>
            </Box>
            <Tooltip title="Minimize Mascot Box">
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
