// Screen-space label pass with level-of-detail and cheap overlap culling
import { LABEL_ZOOM_FADE, LABEL_ZOOM_FULL, MAX_LABEL_LENGTH } from './graphConstants'

const LABEL_FONT = '600 11.5px "Plus Jakarta Sans", system-ui, sans-serif'
const SUBLABEL_FONT = '500 10.5px "Plus Jakarta Sans", system-ui, sans-serif'
const CHAR_WIDTH = 6.4
const LABEL_HEIGHT = 15
const MAX_SUBLABEL_LENGTH = 44
const OFFSCREEN_MARGIN = 80

const truncate = (text, max) => {
  const value = String(text || '')
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

const displayText = (node) => {
  const model = node.model
  const base = model.type === 'wiki' && model.icon ? `${model.icon} ${model.label}` : model.label
  return truncate(base, MAX_LABEL_LENGTH)
}

const collides = (placed, rect) => placed.some(p =>
  rect.x < p.x + p.w && rect.x + rect.w > p.x && rect.y < p.y + p.h && rect.y + rect.h > p.y)

const isPriorityLabel = (node, view) => {
  const { type } = node
  if (type === 'sprint' || type === 'topic') return true
  const id = node.id
  if (id === view.hoverId || id === view.selectedId) return true
  if (view.pathIds && view.pathIds.has(id)) return true
  if (view.hubIds && view.hubIds.has(id)) return true
  if (view.focusIds && view.focusIds.has(id)) return true
  return Boolean(view.matchIds && view.matchIds.size <= 40 && view.matchIds.has(id))
}

const labelAlpha = (node, view, zoomAlpha, priority) => {
  if (view.matchIds && !view.matchIds.has(node.id)) return 0.25
  if (view.focusIds && !view.focusIds.has(node.id)) return 0.3
  return priority ? 1 : zoomAlpha
}

const drawText = (ctx, text, x, y, font, color) => {
  ctx.font = font
  ctx.lineWidth = 3.5
  ctx.strokeStyle = 'rgba(5, 8, 17, 0.88)'
  ctx.strokeText(text, x, y)
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

export const drawLabels = (ctx, frame) => {
  const { nodes, camera, width, height, dpr, view, style } = frame
  if (!style.display.labels) return
  const zoomAlpha = Math.min(1, Math.max(0, (camera.k - LABEL_ZOOM_FADE) / (LABEL_ZOOM_FULL - LABEL_ZOOM_FADE)))
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'

  const placed = []
  const candidates = []
  nodes.forEach(node => {
    const sx = node.x * camera.k + camera.x
    const sy = node.y * camera.k + camera.y
    if (sx < -OFFSCREEN_MARGIN || sy < -OFFSCREEN_MARGIN || sx > width + OFFSCREEN_MARGIN || sy > height + OFFSCREEN_MARGIN) return
    const priority = isPriorityLabel(node, view)
    if (!priority && zoomAlpha <= 0) return
    candidates.push({ node, sx, sy, priority })
  })
  candidates.sort((a, b) => Number(b.priority) - Number(a.priority))

  candidates.forEach(({ node, sx, sy, priority }) => {
    const text = displayText(node)
    const w = text.length * CHAR_WIDTH
    const y = sy + node.r * camera.k + 14
    const rect = { x: sx - w / 2, y: y - LABEL_HEIGHT, w, h: LABEL_HEIGHT + 2 }
    if (!priority && collides(placed, rect)) return
    placed.push(rect)
    ctx.globalAlpha = labelAlpha(node, view, zoomAlpha, priority)
    drawText(ctx, text, sx, y, LABEL_FONT, '#f1f5f9')
    const isActive = node.id === view.hoverId || node.id === view.selectedId
    if (isActive && node.model.subLabel && node.type !== 'tag') {
      drawText(ctx, truncate(node.model.subLabel, MAX_SUBLABEL_LENGTH), sx, y + 13, SUBLABEL_FONT, 'rgba(203, 213, 225, 0.9)')
    }
  })
  ctx.restore()
}
