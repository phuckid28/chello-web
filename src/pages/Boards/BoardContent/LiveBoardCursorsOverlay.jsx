import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getPresenceViewers, subscribePresence, updatePresenceCursor } from '~/apis'
import { getCursorColorForUser } from '~/fx/swarmEngine'
import { FX_AI_CURSOR_EVENT } from '~/fx/fxEvents'
import { playSpatialKeyTick } from '~/utils/soundEffects'
import FigmaCursorPointer from './parts/FigmaCursorPointer'

function LiveBoardCursorsOverlay({
  boardId,
  boardViewMode = 'kanban',
  activeDragLabel = '',
  containerRef
}) {
  const currentUser = useSelector(selectCurrentUser)
  const currentUserId = String(currentUser?._id || '')
  const [viewers, setViewers] = useState(() => (boardId ? getPresenceViewers(boardId) : []))
  const [containerSize, setContainerSize] = useState({ width: 1280, height: 720 })
  const [aiCursor, setAiCursor] = useState(null)
  const lastMoveSentRef = useRef(0)

  // Track container dimensions for percentage -> pixel mapping
  useEffect(() => {
    const el = containerRef?.current
    if (!el) return undefined

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }
    updateSize()

    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(updateSize)
      ro.observe(el)
      return () => ro.disconnect()
    }
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [containerRef])

  // Subscribe to board presence viewers
  useEffect(() => {
    if (!boardId) return undefined
    setViewers(getPresenceViewers(boardId))
    const unsub = subscribePresence(boardId, (nextViewers) => {
      setViewers(Array.isArray(nextViewers) ? nextViewers : [])
    })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [boardId])

  // Broadcast pointer coordinates inside board container (throttled in presenceApi)
  useEffect(() => {
    const el = containerRef?.current
    if (!el || !boardId) return undefined

    const handlePointerMove = (e) => {
      const now = performance.now()
      if (now - lastMoveSentRef.current < 320) return
      lastMoveSentRef.current = now

      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      const xPct = ((e.clientX - rect.left) / rect.width) * 100
      const yPct = ((e.clientY - rect.top) / rect.height) * 100
      if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > 100) return

      updatePresenceCursor(boardId, {
        xPct,
        yPct,
        view: boardViewMode,
        action: activeDragLabel || ''
      })
    }

    el.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => el.removeEventListener('pointermove', handlePointerMove)
  }, [boardId, boardViewMode, activeDragLabel, containerRef])

  // Listen for AI Co-Pilot Cursor events (e.g. from Gemini AI CR Assistant)
  useEffect(() => {
    let stepTimer = null
    let hideTimer = null

    const handleAiEvent = (event) => {
      const detail = event?.detail || {}
      const vw = window.innerWidth || 1280
      const vh = window.innerHeight || 720
      const baseX = Number.isFinite(detail.x) ? detail.x : vw * 0.54
      const baseY = Number.isFinite(detail.y) ? detail.y : vh * 0.42
      const durationMs = Math.max(1200, Math.min(8000, Number(detail.durationMs) || 2800))

      const prefersReducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      setAiCursor({
        name: detail.label || '🤖 Gemini AI',
        badge: detail.badge || '✨ AI Co-Pilot',
        tool: detail.mode === 'conflict_check' ? 'cross' : 'ibeam',
        color: '#A855F7',
        x: Math.max(40, Math.min(vw - 180, baseX - 60)),
        y: Math.max(40, Math.min(vh - 90, baseY - 24))
      })

      if (!prefersReducedMotion) {
        let tick = 0
        stepTimer = setInterval(() => {
          tick += 1
          const offsetX = Math.cos(tick * 1.15) * 72 + (tick % 3) * 18
          const offsetY = Math.sin(tick * 0.9) * 28 + (tick % 2) * 12
          const nextX = Math.max(40, Math.min(vw - 180, baseX + offsetX))
          const nextY = Math.max(40, Math.min(vh - 90, baseY + offsetY))

          playSpatialKeyTick({ x: nextX, viewportWidth: vw })
          setAiCursor((prev) => (prev ? { ...prev, x: nextX, y: nextY } : null))
        }, 280)
      }

      hideTimer = setTimeout(() => {
        if (stepTimer) clearInterval(stepTimer)
        setAiCursor(null)
      }, durationMs)
    }

    window.addEventListener(FX_AI_CURSOR_EVENT, handleAiEvent)
    return () => {
      window.removeEventListener(FX_AI_CURSOR_EVENT, handleAiEvent)
      if (stepTimer) clearInterval(stepTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [])

  const remoteCursors = (viewers || [])
    .filter((v) => {
      const uid = String(v?.userId || v?.user?._id || v?._id || '')
      return uid && uid !== currentUserId && (v?.cursor || v?.activeCardTitle)
    })
    .map((v, idx) => {
      const userObj = v.user || v
      const displayName = userObj?.displayName || userObj?.username || `Member ${idx + 1}`
      const color = getCursorColorForUser(displayName)
      const hasCoords = v.cursor && Number.isFinite(v.cursor.xPct) && Number.isFinite(v.cursor.yPct)
      const x = hasCoords
        ? (v.cursor.xPct / 100) * containerSize.width
        : containerSize.width - 210 - (idx % 3) * 70
      const y = hasCoords
        ? (v.cursor.yPct / 100) * containerSize.height
        : 24 + idx * 34
      const badge = v.cursor?.action
        ? v.cursor.action
        : v.activeCardTitle
          ? `✏️ ${String(v.activeCardTitle).slice(0, 22)}`
          : ''

      return {
        id: String(v.userId || userObj?._id || idx),
        name: displayName,
        color,
        x,
        y,
        tool: v.activeCardTitle ? 'ibeam' : 'arrow',
        badge
      }
    })

  return (
    <>
      {/* Board-scoped remote collaborator cursors */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 25
        }}
      >
        {remoteCursors.map((cursor) => (
          <FigmaCursorPointer
            key={cursor.id}
            x={cursor.x}
            y={cursor.y}
            name={cursor.name}
            color={cursor.color}
            tool={cursor.tool}
            badge={cursor.badge}
            smoothTransition
          />
        ))}
      </Box>

      {/* Viewport-wide AI Co-Pilot Cursor (visible above board & ActiveCard modal) */}
      {aiCursor && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1500,
            overflow: 'hidden'
          }}
        >
          <FigmaCursorPointer
            x={aiCursor.x}
            y={aiCursor.y}
            name={aiCursor.name}
            color={aiCursor.color}
            tool={aiCursor.tool}
            badge={aiCursor.badge}
            isAi
            smoothTransition
          />
        </Box>
      )}
    </>
  )
}

export default LiveBoardCursorsOverlay
