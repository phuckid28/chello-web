import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Columns from './ListColumns/Columns/Columns'
import Card from './ListColumns/Columns/ListCards/Card/Card'
import CompanionHud from './CompanionHud'

import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { applyFiltersToColumns } from '~/utils/crFilters'
import ThemedLoader from '~/components/Loading/ThemedLoader'

const BoardAnalyticsView = lazy(() => import('./BoardAnalyticsView'))
const ObsidianGraphView = lazy(() => import('./ObsidianGraphView'))
const TimelineView = lazy(() => import('./TimelineView'))

const ViewFallback = () => (
  <Box sx={{ width: '100%', display: 'grid', placeItems: 'center' }}>
    <ThemedLoader size={64} />
  </Box>
)

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board,
  filters,
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
  const [canvasMode, setCanvasMode] = useState('sheet') // 'sheet' (Framed Sheet V2) | 'art' (Full Art Canvas)

  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

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

  const displayedColumns = useMemo(
    () => applyFiltersToColumns(orderedColumns, filters),
    [orderedColumns, filters]
  )

  const renderActiveView = () => {
    if (boardViewMode === 'overview') return <BoardAnalyticsView columns={displayedColumns} themeConfig={themeConfig} />
    if (boardViewMode === 'graph') return <ObsidianGraphView columns={displayedColumns} themeConfig={themeConfig} />
    if (boardViewMode === 'timeline') return <TimelineView columns={displayedColumns} themeConfig={themeConfig} />
    return <ListColumns columns={displayedColumns} />
  }

  const isSheetMode = canvasMode === 'sheet'

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDragState}
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
    >
      {/* Clean-Slate V2 Outer Architectural Frame */}
      <Box
        sx={{
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) => (theme.palette.mode === 'dark'
            ? 'var(--chella-ground-dark, #090c14)'
            : 'var(--chella-ground-light, #eef2f6)'),
          p: { xs: '6px', md: '10px 14px 12px 14px' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Inset Framed Sheet Canvas (taste-skill Framed Sheet + Achromatic Ledger Architecture) */}
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: (theme) => (theme.palette.mode === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.16)'
              : '1px solid rgba(15, 23, 42, 0.10)'),
            boxShadow: (theme) => (theme.palette.mode === 'dark'
              ? '0 12px 36px rgba(0, 0, 0, 0.45)'
              : '0 4px 20px rgba(15, 23, 42, 0.05)'),
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0c101b' : '#f8fafc'),
            backgroundImage: (theme) => {
              if (!isSheetMode) {
                return `${theme.palette.mode === 'dark' ? themeConfig.boardOverlayDark : themeConfig.boardOverlayLight}, url(${themeConfig.heroImage})`
              }
              return theme.palette.mode === 'dark'
                ? 'radial-gradient(rgba(148, 163, 184, 0.10) 1px, transparent 1px)'
                : 'radial-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px)'
            },
            backgroundSize: isSheetMode ? '20px 20px' : 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Curated Art-Direction Gallery Strip (Separates Artwork from Working Text!) */}
          <Box
            sx={{
              height: '46px',
              flexShrink: 0,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
              borderBottom: (theme) => (theme.palette.mode === 'dark'
                ? '1px solid rgba(148, 163, 184, 0.14)'
                : '1px solid rgba(15, 23, 42, 0.08)'),
              background: (theme) => (theme.palette.mode === 'dark'
                ? `linear-gradient(90deg, #0d121f 0%, #111827 58%, rgba(17, 24, 39, 0.35) 100%), url(${themeConfig.heroImage})`
                : `linear-gradient(90deg, #ffffff 0%, #f8fafc 58%, rgba(248, 250, 252, 0.35) 100%), url(${themeConfig.heroImage})`),
              backgroundSize: 'cover',
              backgroundPosition: 'center 32%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, overflow: 'hidden' }}>
              <Typography
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  px: 0.85,
                  py: 0.25,
                  borderRadius: '5px',
                  color: themeConfig.accentColor,
                  bgcolor: 'rgba(15, 23, 42, 0.82)',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {themeConfig.chapterIndex || '03'} / {(themeConfig.styleArchetype || 'ledger').toUpperCase()}
              </Typography>

              <Typography
                component="span"
                sx={{
                  display: { xs: 'none', md: 'inline' },
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  flexShrink: 0
                }}
              >
                {themeConfig.jpTitle}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: { xs: 'none', lg: 'inline' },
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {themeConfig.quote}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
              <Chip
                size="small"
                label={isSheetMode ? 'Canvas: Clean Sheet' : 'Canvas: Full Art'}
                onClick={() => setCanvasMode(isSheetMode ? 'art' : 'sheet')}
                clickable
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  color: '#f8fafc',
                  bgcolor: 'rgba(15, 23, 42, 0.78)',
                  border: `1px solid ${themeConfig.accentColor}`,
                  '&:hover': {
                    bgcolor: 'rgba(15, 23, 42, 0.92)'
                  }
                }}
              />
            </Box>
          </Box>

          {/* Main Isolated Workspace Viewport */}
          <Box
            key={boardViewMode}
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flex: 1,
              width: '100%',
              minHeight: 0,
              pt: '10px',
              pb: '6px',
              animation: 'fxViewSwap 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <Suspense fallback={<ViewFallback />}>
              {renderActiveView()}
            </Suspense>
          </Box>

          <CompanionHud personaKey={personaKey} themeConfig={themeConfig} sprintName={board?.sprintConfig?.name || 'Sprint'} />
        </Box>

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
