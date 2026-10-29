import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchWikiPagesAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { isMotionReduced } from '~/fx/fxSettings'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { DEFAULT_SPRINT_CONFIG } from '~/utils/excelExporter'
import { playUiChime } from '~/utils/soundEffects'
import {
  DEFAULT_LOCAL_DEPTH,
  TIMELAPSE_TICK_MS,
  TOGGLEABLE_TYPES
} from './graphConstants'
import { createGraphEngine } from './graphEngine'
import GraphFiltersPanel from './GraphFiltersPanel'
import GraphInspector from './GraphInspector'
import GraphMinimap from './GraphMinimap'
import {
  applyQuery,
  applyVisibility,
  buildGraph,
  filterByTime,
  getQuerySuggestions,
  getTimeline,
  localSubgraph,
  parseQuery,
  pathEdgeKeys,
  shortestPath
} from './graphModel'
import { GraphLegend, PathFinderBar, TimelapseBar } from './GraphOverlays'
import GraphSearchBox from './GraphSearchBox'
import { loadPins, loadSettings, savePins, saveSettings } from './graphSettings'
import GraphToolbar from './GraphToolbar'
import { useGraphInteractions } from './useGraphInteractions'

function KnowledgeGraphView({ columns = [], themeConfig = {} }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const { t, lang } = useTranslation()
  const isCompact = useMediaQuery('(max-width:1100px)')

  const boardId = board?._id
  const sprintConfig = board?.sprintConfig || DEFAULT_SPRINT_CONFIG
  const accent = themeConfig.accentColor || '#38bdf8'
  const secondary = themeConfig.secondaryAccent || '#a78bfa'

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const searchInputRef = useRef(null)
  const [engine, setEngine] = useState(null)

  const [wikiPages, setWikiPages] = useState([])
  const [settings, setSettings] = useState(loadSettings)
  const [pinnedMap, setPinnedMap] = useState(() => loadPins(boardId))
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('global')
  const [depth, setDepth] = useState(DEFAULT_LOCAL_DEPTH)
  const [selectedId, setSelectedId] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const [pathMode, setPathMode] = useState(false)
  const [pathEnds, setPathEnds] = useState({ fromId: null, toId: null })
  const [timelapse, setTimelapse] = useState({ on: false, playing: false, step: 0 })

  useEffect(() => {
    if (!boardId) return undefined
    let cancelled = false
    fetchWikiPagesAPI(boardId)
      .then(list => { if (!cancelled) setWikiPages(Array.isArray(list) ? list : []) })
      .catch(() => { if (!cancelled) setWikiPages([]) })
    return () => { cancelled = true }
  }, [boardId])

  useEffect(() => { setPinnedMap(loadPins(boardId)) }, [boardId])

  const updateSettings = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const fullGraph = useMemo(
    () => buildGraph({ boardId, columns, wikiPages, sprintConfig }),
    [boardId, columns, wikiPages, sprintConfig]
  )

  const typeCounts = useMemo(() => {
    const counts = Object.fromEntries(TOGGLEABLE_TYPES.map(k => [k, 0]))
    fullGraph.nodes.forEach(n => { if (counts[n.type] !== undefined) counts[n.type] += 1 })
    return counts
  }, [fullGraph])

  const visibleGraph = useMemo(
    () => applyVisibility(fullGraph, { filters: settings.filters, orphans: settings.display.orphans }),
    [fullGraph, settings.filters, settings.display.orphans]
  )

  const timeline = useMemo(() => getTimeline(visibleGraph), [visibleGraph])

  const activeGraph = useMemo(() => {
    let g = visibleGraph
    if (timelapse.on && timeline.length > 0) {
      const ts = timeline[Math.min(timelapse.step, timeline.length - 1)]
      g = filterByTime(g, ts)
    }
    if (mode === 'local' && selectedId && g.byId.has(selectedId)) {
      g = localSubgraph(g, selectedId, depth)
    }
    return g
  }, [visibleGraph, timelapse.on, timelapse.step, timeline, mode, selectedId, depth])

  useEffect(() => {
    if (selectedId && activeGraph.byId.has(selectedId)) return
    const firstCr = activeGraph.nodes.find(n => n.type === 'cr') || activeGraph.nodes[0]
    setSelectedId(firstCr ? firstCr.id : null)
  }, [activeGraph, selectedId])

  const parsedQuery = useMemo(() => parseQuery(query), [query])
  const matchIds = useMemo(() => applyQuery(activeGraph, parsedQuery), [activeGraph, parsedQuery])
  const suggestions = useMemo(() => getQuerySuggestions(activeGraph, query), [activeGraph, query])

  const routePath = useMemo(() => {
    if (!pathMode || !pathEnds.fromId || !pathEnds.toId) return null
    return shortestPath(activeGraph, pathEnds.fromId, pathEnds.toId)
  }, [pathMode, pathEnds, activeGraph])

  // Create and tear down the imperative canvas engine once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const instance = createGraphEngine({
      canvas,
      reducedMotion: isMotionReduced(),
      onPinsChange: (positions) => {
        setPinnedMap(positions)
        savePins(boardId, positions)
      }
    })
    instance.setPins(loadPins(boardId))
    setEngine(instance)
    return () => instance.destroy()
  }, [boardId])

  useEffect(() => {
    if (engine) engine.setData(activeGraph)
  }, [engine, activeGraph])

  useEffect(() => {
    if (!engine) return
    engine.setStyle({ accent, secondary, colors: settings.colors, display: settings.display })
  }, [engine, accent, secondary, settings.colors, settings.display])

  useEffect(() => {
    if (engine) engine.setForces(settings.forces)
  }, [engine, settings.forces])

  useEffect(() => {
    if (!engine) return
    const endpointIds = pathMode && (pathEnds.fromId || pathEnds.toId)
      ? new Set([pathEnds.fromId, pathEnds.toId].filter(Boolean))
      : null
    engine.setView({
      selectedId,
      matchIds,
      pathIds: routePath ? new Set(routePath) : null,
      pathKeys: routePath ? pathEdgeKeys(routePath) : null,
      endpointIds
    })
  }, [engine, selectedId, matchIds, pathMode, pathEnds, routePath])

  // Time-lapse playback timer
  useEffect(() => {
    if (!timelapse.on || !timelapse.playing || timeline.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setTimelapse(prev => {
        if (prev.step >= timeline.length - 1) return { ...prev, playing: false }
        return { ...prev, step: prev.step + 1 }
      })
    }, TIMELAPSE_TICK_MS)
    return () => window.clearInterval(timer)
  }, [timelapse.on, timelapse.playing, timeline.length])

  const focusNode = useCallback((id, center = true) => {
    if (!id) return
    setSelectedId(id)
    if (center && engine) engine.centerOn(id)
  }, [engine])

  const openNodeTarget = useCallback((id) => {
    const node = activeGraph.byId.get(id)
    if (!node) return
    playUiChime('complete')
    if (node.type === 'cr') navigate(`/boards/${boardId}/cr/${node.cardId}`)
    else if (node.type === 'wiki') navigate(`/boards/${boardId}/wiki/${node.pageId}`)
  }, [activeGraph, boardId, navigate])

  const handleSelectFromCanvas = useCallback((id) => {
    if (!id) return
    playUiChime('sparkle')
    setSelectedId(id)
    if (pathMode) {
      setPathEnds(prev => {
        if (!prev.fromId || (prev.fromId && prev.toId)) return { fromId: id, toId: null }
        return { ...prev, toId: id }
      })
    }
  }, [pathMode])

  useGraphInteractions({
    engine,
    canvasRef,
    containerRef,
    handlers: {
      getSelectedId: () => selectedId,
      getNeighborIds: (id) => Array.from(activeGraph.adjacency.get(id) || []),
      onSelect: (id) => { if (id) handleSelectFromCanvas(id) },
      onOpen: openNodeTarget,
      onPinChange: () => playUiChime('sparkle'),
      onToggleLocal: () => setMode(m => (m === 'local' ? 'global' : 'local')),
      onClear: () => { setQuery(''); setPathMode(false) },
      onFocusSearch: () => searchInputRef.current?.focus()
    }
  })

  const handleExportPng = async () => {
    if (!engine) return
    const blob = await engine.exportPng()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chella-knowledge-graph-${sprintConfig.sprintNumber || 'sprint'}.png`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(t('kgExportedToast'))
  }

  const selectedNode = selectedId ? activeGraph.byId.get(selectedId) : null

  return (
    <Box
      ref={containerRef}
      tabIndex={-1}
      sx={{
        width: '100%',
        height: fullscreen ? '100vh' : '100%',
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 1300 : 1,
        bgcolor: fullscreen ? '#050814' : 'transparent',
        px: fullscreen ? 0 : { xs: 1.5, md: 2.5 },
        py: fullscreen ? 0 : 1.5,
        display: 'flex',
        gap: 2,
        outline: 'none'
      }}
    >
      {/* Main Interactive Canvas Card */}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 520,
          borderRadius: fullscreen ? 0 : '18px',
          overflow: 'hidden',
          border: fullscreen ? 'none' : `1px solid ${themeConfig.columnBorder || 'rgba(148,163,184,0.28)'}`,
          boxShadow: '0 18px 44px rgba(0, 0, 0, 0.42)'
        }}
      >
        <GraphToolbar
          t={t}
          accent={accent}
          sprintName={sprintConfig.name || 'Sprint'}
          mode={mode}
          onModeChange={setMode}
          depth={depth}
          onDepthChange={setDepth}
          flags={{
            canLocal: Boolean(selectedId),
            pathMode,
            timelapseOn: timelapse.on,
            timelapseAvailable: timeline.length > 1,
            filtersOpen,
            fullscreen,
            inspectorOpen
          }}
          actions={{
            togglePath: () => {
              setPathMode(v => !v)
              setPathEnds({ fromId: selectedId, toId: null })
            },
            toggleTimelapse: () => setTimelapse(prev => ({ on: !prev.on, playing: !prev.on, step: 0 })),
            toggleFilters: () => setFiltersOpen(v => !v),
            zoomIn: () => engine?.zoomBy(1.25, undefined, undefined, true),
            zoomOut: () => engine?.zoomBy(0.8, undefined, undefined, true),
            fit: () => engine?.fit({ animate: true }),
            exportPng: handleExportPng,
            toggleFullscreen: () => setFullscreen(v => !v),
            toggleInspector: () => setInspectorOpen(v => !v)
          }}
        >
          <GraphSearchBox
            t={t}
            value={query}
            onChange={setQuery}
            inputRef={searchInputRef}
            suggestions={suggestions}
            matchCount={matchIds ? matchIds.size : activeGraph.nodes.length}
            totalCount={activeGraph.nodes.length}
            accent={accent}
          />
        </GraphToolbar>

        {pathMode && (
          <PathFinderBar
            t={t}
            graph={activeGraph}
            fromId={pathEnds.fromId}
            toId={pathEnds.toId}
            path={routePath}
            onPickNode={(id) => focusNode(id, true)}
            onSwap={() => setPathEnds(p => ({ fromId: p.toId, toId: p.fromId }))}
            onClear={() => { setPathMode(false); setPathEnds({ fromId: null, toId: null }) }}
          />
        )}

        {filtersOpen && (
          <Box sx={{ position: 'absolute', top: 66, left: 12, bottom: 52, width: 276, zIndex: 3 }}>
            <GraphFiltersPanel
              t={t}
              accent={accent}
              filters={settings.filters}
              onFiltersChange={(filters) => updateSettings({ filters })}
              display={settings.display}
              onDisplayChange={(display) => updateSettings({ display })}
              forces={settings.forces}
              onForcesChange={(forces) => updateSettings({ forces })}
              colors={settings.colors}
              onColorsChange={(colors) => updateSettings({ colors })}
              counts={typeCounts}
            />
          </Box>
        )}

        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />

        {timelapse.on && timeline.length > 1 && (
          <TimelapseBar
            t={t}
            lang={lang}
            timeline={timeline}
            stepIndex={timelapse.step}
            playing={timelapse.playing}
            accent={accent}
            onStepChange={(step) => setTimelapse(prev => ({ ...prev, playing: false, step }))}
            onTogglePlay={() => setTimelapse(prev => ({ ...prev, playing: !prev.playing, step: prev.step >= timeline.length - 1 ? 0 : prev.step }))}
            onClose={() => setTimelapse({ on: false, playing: false, step: 0 })}
          />
        )}

        <GraphLegend t={t} accent={accent} showTags={settings.filters.tag} />
        {settings.display.minimap && <GraphMinimap engine={engine} accent={accent} />}
      </Box>

      {/* Right Node Inspector & Insights (Desktop side panel / Mobile drawer) */}
      {inspectorOpen && !isCompact && (
        <Box sx={{ width: 356, flexShrink: 0, height: '100%' }}>
          <GraphInspector
            t={t}
            graph={activeGraph}
            selectedNode={selectedNode}
            isPinned={Boolean(selectedNode && pinnedMap[selectedNode.id])}
            accent={accent}
            secondary={secondary}
            onSelectNode={(id) => focusNode(id, true)}
            onTogglePin={(id) => engine?.togglePin(id)}
            onOpenLocal={(id) => { focusNode(id, true); setMode(m => (m === 'local' ? 'global' : 'local')) }}
            onOpenCrStudio={(cardId) => navigate(`/boards/${boardId}/cr/${cardId}`)}
            onQuickEditCr={(card) => { dispatch(updateCurrentActiveCard(card)); dispatch(showModalActiveCard()) }}
            onOpenWikiPage={(pageId) => navigate(`/boards/${boardId}/wiki/${pageId}`)}
          />
        </Box>
      )}

      <Drawer
        anchor="right"
        open={inspectorOpen && isCompact}
        onClose={() => setInspectorOpen(false)}
        PaperProps={{ sx: { width: 340, maxWidth: '90vw', bgcolor: '#0a0f1e' } }}
      >
        <GraphInspector
          embedded
          t={t}
          graph={activeGraph}
          selectedNode={selectedNode}
          isPinned={Boolean(selectedNode && pinnedMap[selectedNode.id])}
          accent={accent}
          secondary={secondary}
          onSelectNode={(id) => focusNode(id, true)}
          onTogglePin={(id) => engine?.togglePin(id)}
          onOpenLocal={(id) => { focusNode(id, true); setMode(m => (m === 'local' ? 'global' : 'local')) }}
          onOpenCrStudio={(cardId) => navigate(`/boards/${boardId}/cr/${cardId}`)}
          onQuickEditCr={(card) => { dispatch(updateCurrentActiveCard(card)); dispatch(showModalActiveCard()) }}
          onOpenWikiPage={(pageId) => navigate(`/boards/${boardId}/wiki/${pageId}`)}
        />
      </Drawer>
    </Box>
  )
}

export default KnowledgeGraphView
