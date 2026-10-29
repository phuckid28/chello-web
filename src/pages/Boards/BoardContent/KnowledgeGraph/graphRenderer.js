// Canvas 2D renderer: draws one complete frame (background, hulls, edges, nodes, labels)
import {
  BORN_DURATION_MS, DETAIL_ZOOM, OVERDUE_COLOR, PATH_COLOR
} from './graphConstants'
import { easeOutBack, visibleWorldRect } from './graphCamera'
import { drawBackground, getGlowSprite } from './graphBackground'
import { drawEdges } from './graphEdges'
import { drawHulls } from './graphHulls'
import { drawLabels } from './graphLabels'
import { withAlpha } from './graphStyle'
import { getProgressColor } from '~/utils/progress'

const TWO_PI = Math.PI * 2
const RING_SEGMENTS = 10
const RING_GAP = 0.2
const RING_OFFSET = 3.4
const RING_WIDTH = 2
const GLOW_MIN_ZOOM = 0.3
const GLOW_SCALE = 3.4
const CULL_MARGIN = 60
const DIM_MATCH_ALPHA = 0.13
const DIM_HOVER_ALPHA = 0.2
const DIM_SELECT_ALPHA = 0.5
const DIM_PATH_ALPHA = 0.22

const nodeAlpha = (node, view) => {
  let alpha = 1
  if (view.matchIds && !view.matchIds.has(node.id)) alpha = DIM_MATCH_ALPHA
  else if (view.focusIds && !view.focusIds.has(node.id)) alpha = view.hoverId ? DIM_HOVER_ALPHA : DIM_SELECT_ALPHA
  if (view.pathIds && !view.pathIds.has(node.id)) alpha = Math.min(alpha, DIM_PATH_ALPHA)
  return alpha
}

// scale-in animation for freshly added nodes; returns null while the node is still waiting to appear
const bornScale = (node, time, reducedMotion) => {
  if (reducedMotion) return { scale: 1, fade: 1, done: true }
  const age = (time - node.bornAt) / BORN_DURATION_MS
  if (age < 0) return null
  if (age >= 1) return { scale: 1, fade: 1, done: true }
  return { scale: Math.max(0.01, easeOutBack(age)), fade: Math.min(1, age * 2.2), done: false }
}

const drawProgressRing = (ctx, node, r) => {
  const progress = node.model.progress || 0
  const filled = Math.round(progress * RING_SEGMENTS)
  const filledColor = getProgressColor(progress)
  const radius = r + RING_OFFSET
  const step = TWO_PI / RING_SEGMENTS
  ctx.lineWidth = RING_WIDTH
  ctx.lineCap = 'butt'
  for (let i = 0; i < RING_SEGMENTS; i++) {
    const start = -Math.PI / 2 + i * step + step * RING_GAP / 2
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, start, start + step * (1 - RING_GAP))
    ctx.strokeStyle = i < filled ? filledColor : 'rgba(148, 163, 184, 0.22)'
    ctx.stroke()
  }
}

const drawPin = (ctx, node, r, px) => {
  const x = node.x + r * 0.85
  const y = node.y - r * 0.85
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - 5 * px, y + 6 * px)
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1.4 * px
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, 3.4 * px, 0, TWO_PI)
  ctx.fillStyle = '#fbbf24'
  ctx.fill()
  ctx.strokeStyle = '#0b1020'
  ctx.lineWidth = 1.2 * px
  ctx.stroke()
}

const drawOverdueDot = (ctx, node, r, px) => {
  ctx.beginPath()
  ctx.arc(node.x - r * 0.78, node.y - r * 0.78, Math.max(2.6 * px, r * 0.3), 0, TWO_PI)
  ctx.fillStyle = OVERDUE_COLOR
  ctx.fill()
  ctx.strokeStyle = '#0b1020'
  ctx.lineWidth = 1.2 * px
  ctx.stroke()
}

const drawSelectionHalo = (ctx, node, r, view, style) => {
  const isSelected = node.id === view.selectedId
  const isHover = node.id === view.hoverId
  const isEndpoint = view.endpointIds && view.endpointIds.has(node.id)
  if (!isSelected && !isHover && !isEndpoint) return
  const color = isEndpoint ? PATH_COLOR : (isSelected ? style.accent : node.color)
  ctx.beginPath()
  ctx.arc(node.x, node.y, r + 9, 0, TWO_PI)
  ctx.fillStyle = withAlpha(node.color, isSelected ? 0.2 : 0.14)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(node.x, node.y, r + 6.5, 0, TWO_PI)
  ctx.strokeStyle = withAlpha(color, 0.95)
  ctx.lineWidth = isSelected || isEndpoint ? 2.2 : 1.6
  ctx.stroke()
}

const drawNode = (ctx, node, frame, born) => {
  const { camera, view, style } = frame
  const px = 1 / camera.k
  const r = node.r * born.scale
  const isCr = node.type === 'cr'
  ctx.globalAlpha = nodeAlpha(node, view) * born.fade

  if (style.display.glow && camera.k >= GLOW_MIN_ZOOM && (isCr || node.type === 'sprint')) {
    const size = r * GLOW_SCALE
    ctx.drawImage(getGlowSprite(node.color), node.x - size, node.y - size, size * 2, size * 2)
  }
  drawSelectionHalo(ctx, node, r, view, style)

  ctx.beginPath()
  ctx.arc(node.x, node.y, r, 0, TWO_PI)
  ctx.fillStyle = node.color
  ctx.fill()
  ctx.strokeStyle = '#0b1020'
  ctx.lineWidth = 1.6
  ctx.stroke()

  if (isCr && camera.k >= DETAIL_ZOOM) drawProgressRing(ctx, node, r)
  if (isCr && node.model.deadlineCode === 'overdue') drawOverdueDot(ctx, node, r, px)
  if (node.pinned) drawPin(ctx, node, r, px)
}

const drawNodes = (ctx, frame) => {
  const { nodes, camera, width, height, time, style } = frame
  const rect = visibleWorldRect(camera, width, height, CULL_MARGIN)
  let animating = false
  ctx.save()
  nodes.forEach(node => {
    const reach = node.r + 14
    if (node.x + reach < rect.minX || node.x - reach > rect.maxX || node.y + reach < rect.minY || node.y - reach > rect.maxY) return
    const born = bornScale(node, time, style.reducedMotion)
    if (!born) {
      animating = true
      return
    }
    if (!born.done) animating = true
    drawNode(ctx, node, frame, born)
  })
  ctx.restore()
  return animating
}

// Draws a full frame. Returns true when time-based animation (particles / scale-in) is still running.
export const drawGraph = (ctx, frame) => {
  const { width, height, dpr, camera, style } = frame
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, width, height, camera, style.accent)

  ctx.setTransform(dpr * camera.k, 0, 0, dpr * camera.k, dpr * camera.x, dpr * camera.y)
  if (style.display.hulls) drawHulls(ctx, frame.nodes)
  const edgesAnimating = drawEdges(ctx, frame)
  const nodesAnimating = drawNodes(ctx, frame)
  ctx.globalAlpha = 1
  drawLabels(ctx, frame)
  return edgesAnimating || nodesAnimating
}
