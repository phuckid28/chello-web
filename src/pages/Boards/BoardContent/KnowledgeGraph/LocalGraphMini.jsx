import { useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchWikiPagesAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { isMotionReduced } from '~/fx/fxSettings'
import { useFxTheme } from '~/fx/fxThemeStore'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { DEFAULT_SPRINT_CONFIG } from '~/utils/excelExporter'
import { createGraphEngine } from './graphEngine'
import { buildGraph, localSubgraph } from './graphModel'
import { useGraphInteractions } from './useGraphInteractions'

// Compact Obsidian-style Local Graph widget for Knowledge Hub / CR detail sidebars
function LocalGraphMini({ boardId: boardIdProp, centerType = 'wiki', centerKey, height = 210, onOpenPage, onOpenCard }) {
  const params = useParams()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const { t } = useTranslation()
  const { theme } = useFxTheme()

  const boardId = boardIdProp || params.boardId || board?._id
  const activeCenterKey = centerKey || params.pageId || params.cardId
  const centerNodeId = activeCenterKey ? `${centerType === 'cr' ? 'cr' : 'wiki'}-${activeCenterKey}` : null

  const canvasRef = useRef(null)
  const [engine, setEngine] = useState(null)
  const [depth, setDepth] = useState(1)
  const [wikiPages, setWikiPages] = useState([])

  useEffect(() => {
    if (!boardId) return undefined
    let cancelled = false
    fetchWikiPagesAPI(boardId)
      .then(list => { if (!cancelled) setWikiPages(Array.isArray(list) ? list : []) })
      .catch(() => { if (!cancelled) setWikiPages([]) })
    return () => { cancelled = true }
  }, [boardId, activeCenterKey])

  const subgraph = useMemo(() => {
    const full = buildGraph({
      boardId,
      columns: board?.columns || [],
      wikiPages,
      sprintConfig: board?.sprintConfig || DEFAULT_SPRINT_CONFIG
    })
    if (!centerNodeId || !full.byId.has(centerNodeId)) return full
    return localSubgraph(full, centerNodeId, depth)
  }, [boardId, board?.columns, board?.sprintConfig, wikiPages, centerNodeId, depth])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const instance = createGraphEngine({ canvas, reducedMotion: isMotionReduced() })
    setEngine(instance)
    return () => instance.destroy()
  }, [])

  useEffect(() => {
    if (!engine) return
    engine.setStyle({
      accent: theme.accentColor,
      secondary: theme.secondaryAccent,
      display: { labels: true, arrows: false, sizeBy: 'degree', hulls: false, orphans: true, minimap: false, glow: true }
    })
  }, [engine, theme.accentColor, theme.secondaryAccent])

  useEffect(() => {
    if (!engine) return
    engine.setData(subgraph)
    engine.setView({ selectedId: centerNodeId })
  }, [engine, subgraph, centerNodeId])

  const handleOpenNode = (id) => {
    const node = subgraph.byId.get(id)
    if (!node || id === centerNodeId) return
    if (node.type === 'wiki') {
      if (onOpenPage) onOpenPage(node.pageId)
      else if (boardId) navigate(`/boards/${boardId}/wiki/${node.pageId}`)
    } else if (node.type === 'cr') {
      if (onOpenCard && node.card) onOpenCard(node.card)
      else if (boardId) navigate(`/boards/${boardId}/cr/${node.cardId}`)
    }
  }

  useGraphInteractions({
    engine,
    canvasRef,
    keyboard: false,
    handlers: {
      onSelect: (id) => { if (id) handleOpenNode(id) },
      onOpen: handleOpenNode
    }
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.4, color: 'text.secondary', textTransform: 'uppercase' }}>
          {t('kgMiniTitle')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={depth}
          onChange={(_, v) => v && setDepth(v)}
          sx={{ '& .MuiToggleButton-root': { py: 0.1, px: 0.7, fontSize: '0.66rem', fontWeight: 800 } }}
        >
          <ToggleButton value={1}>1</ToggleButton>
          <ToggleButton value={2}>2</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          height,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          bgcolor: '#070b18',
          position: 'relative'
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />
      </Box>
    </Box>
  )
}

export default LocalGraphMini
