import { useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded'
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded'
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import {
  DEFAULT_SPRINT_CONFIG,
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  getStatusOption,
  normalizeCrStatus,
  parseAssigneeList
} from '~/utils/excelExporter'
import { playUiChime } from '~/utils/soundEffects'

// Extract [[BNPL-xxx]] wiki-links from markdown text
const extractWikiLinks = (text) => {
  if (!text) return []
  const matches = String(text).match(/\[\[([^\]]+)\]\]/g) || []
  return matches.map(m => m.slice(2, -2).trim().toUpperCase())
}

function ObsidianGraphView({ columns = [], themeConfig }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const sprintConfig = board?.sprintConfig || DEFAULT_SPRINT_CONFIG

  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const dragNodeRef = useRef(null)
  const panRef = useRef({ x: 0, y: 0, isPanning: false, startX: 0, startY: 0 })

  const [zoom, setZoom] = useState(1)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTopics, setShowTopics] = useState(true)
  const [showMembers, setShowMembers] = useState(true)
  const [showFrds, setShowFrds] = useState(true)

  // Build Obsidian Graph Data (Sprint -> Topics -> CRs <-> CRs -> Assignees & FRDs)
  const graphData = useMemo(() => {
    const nodes = []
    const edges = []
    const nodeMap = new Map()
    const crCodeToNodeId = new Map()

    const addNode = (node) => {
      if (!nodeMap.has(node.id)) {
        nodeMap.set(node.id, node)
        nodes.push(node)
      }
      return nodeMap.get(node.id)
    }

    const sprintNodeId = `sprint-${board?._id || 'root'}`
    addNode({
      id: sprintNodeId,
      label: sprintConfig.name || 'Sprint 34',
      subLabel: `${sprintConfig.startDate} – ${sprintConfig.endDate}`,
      type: 'sprint',
      radius: 24,
      color: themeConfig.accentColor || '#38bdf8',
      x: 420,
      y: 270,
      vx: 0,
      vy: 0
    })

    const allCards = []
    columns.forEach((col, colIdx) => {
      const topicNodeId = `topic-${col._id}`
      const angle = (colIdx / Math.max(1, columns.length)) * Math.PI * 2
      if (showTopics) {
        addNode({
          id: topicNodeId,
          label: col.title || 'CR Topic',
          subLabel: 'CR Topic (Column)',
          type: 'topic',
          radius: 17,
          color: '#818cf8',
          x: 420 + Math.cos(angle) * 145,
          y: 270 + Math.sin(angle) * 145,
          vx: 0,
          vy: 0
        })
        edges.push({ source: sprintNodeId, target: topicNodeId, kind: 'topic' })
      }

      const realCards = (col.cards || []).filter(c => !c.FE_PlaceholderCard)
      realCards.forEach((card, cardIdx) => {
        allCards.push({ card, col, topicNodeId, colIdx, cardIdx })
        const cardNodeId = `cr-${card._id}`
        const statusOpt = getStatusOption(card.baStatus)
        const cAngle = angle + (cardIdx - realCards.length / 2) * 0.35
        const crCode = (card.crCode || `CR-${allCards.length}`).toUpperCase()
        crCodeToNodeId.set(crCode, cardNodeId)

        addNode({
          id: cardNodeId,
          label: crCode,
          subLabel: card.title,
          type: 'cr',
          radius: 15,
          color: statusOpt.color,
          cardData: { ...card, columnTitle: col.title },
          x: 420 + Math.cos(cAngle) * 255,
          y: 270 + Math.sin(cAngle) * 235,
          vx: 0,
          vy: 0
        })

        if (showTopics) {
          edges.push({ source: topicNodeId, target: cardNodeId, kind: 'contains' })
        } else {
          edges.push({ source: sprintNodeId, target: cardNodeId, kind: 'contains' })
        }

        // Member (Handle by) nodes
        if (showMembers) {
          const assignees = parseAssigneeList(card.assignee)
          assignees.forEach((person, pIdx) => {
            const memberNodeId = `member-${person.toLowerCase().replace(/\s+/g, '-')}`
            addNode({
              id: memberNodeId,
              label: person,
              subLabel: 'Handle by (PIC)',
              type: 'member',
              radius: 12,
              color: '#f472b6',
              x: 420 + Math.cos(cAngle + 0.2 * (pIdx + 1)) * 340,
              y: 270 + Math.sin(cAngle + 0.2 * (pIdx + 1)) * 310,
              vx: 0,
              vy: 0
            })
            edges.push({ source: cardNodeId, target: memberNodeId, kind: 'assigned' })
          })
        }

        // Attached FRD document nodes
        if (showFrds && card.frdDocuments?.length) {
          card.frdDocuments.forEach((doc, dIdx) => {
            const docNodeId = `frd-${doc.id || `${card._id}-${dIdx}`}`
            addNode({
              id: docNodeId,
              label: doc.name.slice(0, 22),
              subLabel: 'FRD Document',
              type: 'frd',
              radius: 10,
              color: '#34d399',
              x: 420 + Math.cos(cAngle - 0.22) * 330,
              y: 270 + Math.sin(cAngle - 0.22) * 300,
              vx: 0,
              vy: 0
            })
            edges.push({ source: cardNodeId, target: docNodeId, kind: 'frd' })
          })
        }
      })
    })

    // Add CR <-> CR Knowledge Links (both explicit linkedCardIds and [[WikiLinks]] in description/note)
    allCards.forEach(({ card }) => {
      const sourceId = `cr-${card._id}`
      ;(card.linkedCardIds || []).forEach(targetCardId => {
        const targetId = `cr-${targetCardId}`
        if (nodeMap.has(targetId)) {
          edges.push({ source: sourceId, target: targetId, kind: 'wikilink' })
        }
      })

      const wikiCodes = [
        ...extractWikiLinks(card.description),
        ...extractWikiLinks(card.note)
      ]
      wikiCodes.forEach(code => {
        const targetId = crCodeToNodeId.get(code)
        if (targetId && targetId !== sourceId) {
          edges.push({ source: sourceId, target: targetId, kind: 'wikilink' })
        }
      })
    })

    return { nodes, edges }
  }, [board?._id, columns, sprintConfig, themeConfig.accentColor, showTopics, showMembers, showFrds])

  useEffect(() => {
    nodesRef.current = graphData.nodes.map(n => ({ ...n }))
    edgesRef.current = graphData.edges.map(e => ({ ...e }))
    if (!selectedNode && nodesRef.current.length > 0) {
      const firstCr = nodesRef.current.find(n => n.type === 'cr') || nodesRef.current[0]
      setSelectedNode(firstCr)
    }
  }, [graphData])

  // Interactive Force-Directed Simulation & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    let animationFrameId = null

    const stepPhysicsAndDraw = () => {
      const width = canvas.width
      const height = canvas.height
      const nodes = nodesRef.current
      const edges = edgesRef.current
      const q = searchQuery.trim().toLowerCase()

      // 1. Physics forces
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        if (dragNodeRef.current?.id === a.id) continue

        // Gentle pull toward center
        const cx = width / 2
        const cy = height / 2
        a.vx += (cx - a.x) * 0.0008
        a.vy += (cy - a.y) * 0.0008

        // Node-to-node repulsion
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distSq = Math.max(120, dx * dx + dy * dy)
          const dist = Math.sqrt(distSq)
          const force = 1650 / distSq
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          a.vx -= fx
          a.vy -= fy
          if (dragNodeRef.current?.id !== b.id) {
            b.vx += fx
            b.vy += fy
          }
        }
      }

      // Spring attraction along edges
      edges.forEach(edge => {
        const s = nodes.find(n => n.id === edge.source)
        const t = nodes.find(n => n.id === edge.target)
        if (!s || !t) return
        const dx = t.x - s.x
        const dy = t.y - s.y
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy))
        const targetDist = edge.kind === 'wikilink' ? 140 : edge.kind === 'topic' ? 130 : 105
        const diff = (dist - targetDist) * 0.009
        const fx = (dx / dist) * diff
        const fy = (dy / dist) * diff
        if (dragNodeRef.current?.id !== s.id) {
          s.vx += fx
          s.vy += fy
        }
        if (dragNodeRef.current?.id !== t.id) {
          t.vx -= fx
          t.vy -= fy
        }
      })

      // Update positions with damping
      nodes.forEach(n => {
        if (dragNodeRef.current?.id === n.id) return
        n.vx *= 0.84
        n.vy *= 0.84
        n.x = Math.max(40, Math.min(width - 40, n.x + n.vx))
        n.y = Math.max(40, Math.min(height - 40, n.y + n.vy))
      })

      // 2. Render Graph
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(panRef.current.x + width / 2, panRef.current.y + height / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(-width / 2, -height / 2)

      // Determine active focus node (hovered or selected)
      const activeId = hoveredNodeId || selectedNode?.id
      const connectedIds = new Set()
      if (activeId) {
        connectedIds.add(activeId)
        edges.forEach(e => {
          if (e.source === activeId) connectedIds.add(e.target)
          if (e.target === activeId) connectedIds.add(e.source)
        })
      }

      // Draw Edges
      edges.forEach(edge => {
        const s = nodes.find(n => n.id === edge.source)
        const t = nodes.find(n => n.id === edge.target)
        if (!s || !t) return

        const isHighlighted = activeId && (edge.source === activeId || edge.target === activeId)
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)

        if (edge.kind === 'wikilink') {
          ctx.setLineDash([5, 4])
          ctx.strokeStyle = isHighlighted ? '#f5d061' : 'rgba(245, 208, 97, 0.45)'
          ctx.lineWidth = isHighlighted ? 2.4 : 1.4
        } else {
          ctx.setLineDash([])
          ctx.strokeStyle = isHighlighted
            ? (themeConfig.accentColor || '#38bdf8')
            : hoveredNodeId
              ? 'rgba(148, 163, 184, 0.14)'
              : 'rgba(148, 163, 184, 0.34)'
          ctx.lineWidth = isHighlighted ? 2.2 : 1.1
        }
        ctx.stroke()
      })
      ctx.setLineDash([])

      // Draw Nodes
      nodes.forEach(node => {
        const matchesSearch = !q ||
          node.label.toLowerCase().includes(q) ||
          (node.subLabel || '').toLowerCase().includes(q)
        const isNeighbor = !hoveredNodeId || connectedIds.has(node.id)
        const alpha = (!matchesSearch || !isNeighbor) ? 0.25 : 1

        ctx.save()
        ctx.globalAlpha = alpha

        // Outer Halo for selected or hovered node
        if (node.id === hoveredNodeId || node.id === selectedNode?.id) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 7, 0, Math.PI * 2)
          ctx.fillStyle = `${node.color}33`
          ctx.fill()
          ctx.strokeStyle = node.color
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.shadowColor = node.color
        ctx.shadowBlur = node.id === hoveredNodeId ? 18 : 8
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#0f172a'
        ctx.lineWidth = 2
        ctx.stroke()

        // Node label
        ctx.font = `${node.type === 'sprint' || node.type === 'cr' ? '700' : '600'} 11.5px "Plus Jakarta Sans", sans-serif`
        ctx.fillStyle = '#f8fafc'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x, node.y + node.radius + 15)

        ctx.restore()
      })

      ctx.restore()
      animationFrameId = window.requestAnimationFrame(stepPhysicsAndDraw)
    }

    animationFrameId = window.requestAnimationFrame(stepPhysicsAndDraw)
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId)
    }
  }, [zoom, hoveredNodeId, selectedNode, searchQuery, themeConfig.accentColor])

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const rawX = ((e.clientX - rect.left) / rect.width) * canvas.width
    const rawY = ((e.clientY - rect.top) / rect.height) * canvas.height
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const worldX = (rawX - panRef.current.x - cx) / zoom + cx
    const worldY = (rawY - panRef.current.y - cy) / zoom + cy
    return { worldX, worldY, rawX, rawY }
  }

  const findHitNode = (worldX, worldY) => {
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = worldX - n.x
      const dy = worldY - n.y
      if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) {
        return n
      }
    }
    return null
  }

  const handleMouseDown = (e) => {
    const { worldX, worldY, rawX, rawY } = getCanvasPoint(e)
    const hit = findHitNode(worldX, worldY)
    if (hit) {
      dragNodeRef.current = hit
      setSelectedNode(hit)
      playUiChime('sparkle')
    } else {
      panRef.current.isPanning = true
      panRef.current.startX = rawX - panRef.current.x
      panRef.current.startY = rawY - panRef.current.y
    }
  }

  const handleMouseMove = (e) => {
    const { worldX, worldY, rawX, rawY } = getCanvasPoint(e)
    if (dragNodeRef.current) {
      dragNodeRef.current.x = worldX
      dragNodeRef.current.y = worldY
      dragNodeRef.current.vx = 0
      dragNodeRef.current.vy = 0
      return
    }
    if (panRef.current.isPanning) {
      panRef.current.x = rawX - panRef.current.startX
      panRef.current.y = rawY - panRef.current.startY
      return
    }
    const hit = findHitNode(worldX, worldY)
    setHoveredNodeId(hit ? hit.id : null)
  }

  const handleMouseUp = () => {
    dragNodeRef.current = null
    panRef.current.isPanning = false
  }

  const handleResetCamera = () => {
    panRef.current = { x: 0, y: 0, isPanning: false, startX: 0, startY: 0 }
    setZoom(1)
  }

  const selectedCr = selectedNode?.cardData
  const selectedCrDl = selectedCr ? getDeadlineStatus(selectedCr) : null
  const selectedCrProgress = selectedCr ? getCardDevProgress(selectedCr) : 0
  const selectedCrResource = selectedCr ? getCardResourceUsed(selectedCr) : 0

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        px: { xs: 2, md: 3 },
        py: 2,
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2.5
      }}
    >
      {/* Left Interactive Obsidian Force-Directed Graph Canvas */}
      <Card
        sx={{
          flex: 1,
          minHeight: 520,
          borderRadius: '18px',
          bgcolor: 'rgba(13, 18, 34, 0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${themeConfig.columnBorder}`,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.38)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Graph Toolbar */}
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            bgcolor: 'rgba(15, 23, 42, 0.75)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HubRoundedIcon sx={{ color: themeConfig.accentColor }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                Obsidian Knowledge Graph • {sprintConfig.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(248,250,252,0.68)' }}>
                Kéo thả các nút để khám phá mạng lưới Chủ đề CR, Ticket ID, Handle by & [[WikiLink]]
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Chip
              label="Topics (Columns)"
              size="small"
              onClick={() => setShowTopics(!showTopics)}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                color: 'white',
                bgcolor: showTopics ? '#818cf8' : 'rgba(255,255,255,0.08)'
              }}
            />
            <Chip
              label="Handle by (PIC)"
              size="small"
              onClick={() => setShowMembers(!showMembers)}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                color: 'white',
                bgcolor: showMembers ? '#f472b6' : 'rgba(255,255,255,0.08)'
              }}
            />
            <Chip
              label="FRD Docs"
              size="small"
              onClick={() => setShowFrds(!showFrds)}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                color: 'white',
                bgcolor: showFrds ? '#10b981' : 'rgba(255,255,255,0.08)'
              }}
            />
            <Tooltip title="Thu nhỏ">
              <IconButton size="small" onClick={() => setZoom(z => Math.max(0.55, Number((z - 0.15).toFixed(2))))} sx={{ color: 'white' }}>
                <ZoomOutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Phóng to">
              <IconButton size="small" onClick={() => setZoom(z => Math.min(1.85, Number((z + 0.15).toFixed(2))))} sx={{ color: 'white' }}>
                <ZoomInRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Căn giữa đồ thị">
              <IconButton size="small" onClick={handleResetCamera} sx={{ color: 'white' }}>
                <CenterFocusStrongRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Interactive Canvas Area */}
        <Box sx={{ position: 'relative', flex: 1, minHeight: 440, cursor: hoveredNodeId ? 'grab' : 'move' }}>
          <canvas
            ref={canvasRef}
            width={880}
            height={520}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* Legend Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              px: 1.5,
              py: 0.75,
              borderRadius: '10px',
              bgcolor: 'rgba(9, 13, 24, 0.82)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>● Sprint / Processing</Typography>
            <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700 }}>● Topic (Column)</Typography>
            <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700 }}>● Ready for deploy</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>● Deployed / FRD</Typography>
            <Typography variant="caption" sx={{ color: '#f472b6', fontWeight: 700 }}>● Handle by (PIC)</Typography>
          </Box>
        </Box>
      </Card>

      {/* Right Node Inspector & Quick CR Studio Launcher */}
      <Card
        sx={{
          width: { xs: '100%', lg: 370 },
          flexShrink: 0,
          borderRadius: '18px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)'),
          backdropFilter: 'blur(18px)',
          border: `1px solid ${themeConfig.columnBorder}`,
          boxShadow: '0 14px 34px rgba(0, 0, 0, 0.28)'
        }}
      >
        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Tìm nút trên đồ thị (VD: BNPL-945, Ho Thao Dieu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Divider />

          {selectedCr ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Chip
                  label={selectedCr.crCode || 'CR'}
                  color="info"
                  size="small"
                  sx={{ fontFamily: 'monospace', fontWeight: 800 }}
                />
                <Chip
                  label={normalizeCrStatus(selectedCr.baStatus)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                {selectedCr.title}
              </Typography>

              <Stack spacing={0.75} sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  • Topic (Column): <strong>{selectedCr.columnTitle}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  • Handle by: <strong>{selectedCr.assignee || 'Unassigned'}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  • Due date for dev: <strong style={{ color: selectedCrDl?.color }}>{selectedCrDl?.label}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  • Dev Progress: <strong>{selectedCrProgress} ({Math.round(selectedCrProgress * 100)}%)</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  • Resource used: <strong>{selectedCrResource} point(s)</strong>
                </Typography>
              </Stack>

              {selectedCr.note && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  “{selectedCr.note}”
                </Typography>
              )}

              <Stack spacing={1} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayCircleFilledWhiteRoundedIcon />}
                  onClick={() => {
                    playUiChime('complete')
                    navigate(`/boards/${board._id}/cr/${selectedCr._id}`)
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '10px',
                    py: 1.1,
                    background: `linear-gradient(135deg, ${themeConfig.accentColor} 0%, ${themeConfig.secondaryAccent} 100%)`,
                    color: '#0f172a'
                  }}
                >
                  Mở Trang Riêng CR Studio & Mô Phỏng
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<OpenInNewRoundedIcon />}
                  onClick={() => {
                    dispatch(updateCurrentActiveCard(selectedCr))
                    dispatch(showModalActiveCard())
                  }}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
                >
                  Chỉnh sửa nhanh thẻ CR & FRD
                </Button>
              </Stack>
            </>
          ) : selectedNode ? (
            <Box sx={{ py: 2 }}>
              <Chip label={selectedNode.type.toUpperCase()} size="small" sx={{ mb: 1, fontWeight: 800 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedNode.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedNode.subLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Nhấn vào một nút CR (Ticket ID) bất kỳ trên đồ thị để xem chi tiết hoặc mở trình mô phỏng CR Studio.
              </Typography>
            </Box>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ObsidianGraphView
