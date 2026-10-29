import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import { centerCamera, visibleWorldRect } from './graphCamera'
import { glassSx } from './graphUiStyles'

const MINIMAP_W = 156
const MINIMAP_H = 104
const PADDING = 12

const computeBounds = (nodes) => {
  if (!nodes.length) return { minX: -200, minY: -150, maxX: 200, maxY: 150 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  nodes.forEach(n => {
    const r = (n.r || 8) + 20
    if (n.x - r < minX) minX = n.x - r
    if (n.y - r < minY) minY = n.y - r
    if (n.x + r > maxX) maxX = n.x + r
    if (n.y + r > maxY) maxY = n.y + r
  })
  return { minX, minY, maxX, maxY }
}

const mapTransform = (bounds) => {
  const worldW = Math.max(1, bounds.maxX - bounds.minX)
  const worldH = Math.max(1, bounds.maxY - bounds.minY)
  const scale = Math.min((MINIMAP_W - PADDING * 2) / worldW, (MINIMAP_H - PADDING * 2) / worldH)
  const offsetX = (MINIMAP_W - worldW * scale) / 2 - bounds.minX * scale
  const offsetY = (MINIMAP_H - worldH * scale) / 2 - bounds.minY * scale
  return { scale, offsetX, offsetY }
}

// Live bird's-eye minimap with click-and-drag camera navigation
function GraphMinimap({ engine, accent = '#38bdf8' }) {
  const canvasRef = useRef(null)
  const transformRef = useRef({ scale: 0.1, offsetX: 0, offsetY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!engine || !canvas) return undefined
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = MINIMAP_W * dpr
    canvas.height = MINIMAP_H * dpr

    const render = (frame) => {
      const { nodes, links, camera, width, height, view } = frame
      const bounds = computeBounds(nodes)
      const tf = mapTransform(bounds)
      transformRef.current = tf

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H)

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)'
      ctx.lineWidth = 0.75
      ctx.beginPath()
      links.forEach(l => {
        ctx.moveTo(l.source.x * tf.scale + tf.offsetX, l.source.y * tf.scale + tf.offsetY)
        ctx.lineTo(l.target.x * tf.scale + tf.offsetX, l.target.y * tf.scale + tf.offsetY)
      })
      ctx.stroke()

      nodes.forEach(n => {
        const x = n.x * tf.scale + tf.offsetX
        const y = n.y * tf.scale + tf.offsetY
        const r = Math.max(1.8, Math.min(4.5, (n.r || 8) * tf.scale * 1.4))
        ctx.beginPath()
        ctx.arc(x, y, n.id === view.selectedId ? r + 1.5 : r, 0, Math.PI * 2)
        ctx.fillStyle = n.id === view.selectedId ? '#ffffff' : n.color
        ctx.fill()
      })

      if (width > 0 && height > 0) {
        const vr = visibleWorldRect(camera, width, height, 0)
        const rx = vr.minX * tf.scale + tf.offsetX
        const ry = vr.minY * tf.scale + tf.offsetY
        const rw = (vr.maxX - vr.minX) * tf.scale
        const rh = (vr.maxY - vr.minY) * tf.scale
        ctx.strokeStyle = accent
        ctx.lineWidth = 1.4
        ctx.strokeRect(rx, ry, rw, rh)
      }
    }

    return engine.subscribe(render)
  }, [engine, accent])

  const jumpTo = (e) => {
    const canvas = canvasRef.current
    if (!engine || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const { scale, offsetX, offsetY } = transformRef.current
    if (scale <= 0) return
    const wx = (mx - offsetX) / scale
    const wy = (my - offsetY) / scale
    const { width, height } = engine.getSize()
    engine.setCamera(centerCamera(engine.getCamera(), wx, wy, width, height))
  }

  return (
    <Box
      sx={{
        ...glassSx,
        position: 'absolute',
        right: 12,
        bottom: 12,
        zIndex: 3,
        p: 0.5,
        borderRadius: '10px',
        cursor: 'crosshair',
        display: { xs: 'none', sm: 'block' }
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: MINIMAP_W, height: MINIMAP_H, display: 'block', borderRadius: 7 }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); jumpTo(e) }}
        onPointerMove={(e) => { if (e.buttons === 1) jumpTo(e) }}
      />
    </Box>
  )
}

export default GraphMinimap
