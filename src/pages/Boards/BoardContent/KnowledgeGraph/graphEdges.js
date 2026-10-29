// Edge pass: batched strokes, gently curved wiki-links, optional arrows and flowing particles
import { PATH_COLOR, WIKILINK_COLOR } from './graphConstants'
import { edgePairKey } from './graphModel'
import { hash01 } from './graphPhysics'
import { withAlpha } from './graphStyle'
import { visibleWorldRect } from './graphCamera'

const CURVE_AMOUNT = 0.13
const PARTICLES_PER_EDGE = 3
const MAX_PARTICLE_EDGES = 60
const PARTICLE_PERIOD_MS = 2200
const ARROW_MIN_ZOOM = 0.5
const CULL_MARGIN = 60

const edgeGeometry = (link) => {
  const { source: a, target: b } = link
  if (link.kind !== 'wikilink') return { ax: a.x, ay: a.y, bx: b.x, by: b.y, curved: false, cx: 0, cy: 0 }
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const offset = len * CURVE_AMOUNT * (a.id < b.id ? 1 : -1)
  return {
    ax: a.x, ay: a.y, bx: b.x, by: b.y, curved: true,
    cx: (a.x + b.x) / 2 - (dy / len) * offset,
    cy: (a.y + b.y) / 2 + (dx / len) * offset
  }
}

const pointAt = (g, t) => {
  if (!g.curved) return { x: g.ax + (g.bx - g.ax) * t, y: g.ay + (g.by - g.ay) * t }
  const u = 1 - t
  return {
    x: u * u * g.ax + 2 * u * t * g.cx + t * t * g.bx,
    y: u * u * g.ay + 2 * u * t * g.cy + t * t * g.by
  }
}

const tracePath = (ctx, g) => {
  ctx.moveTo(g.ax, g.ay)
  if (g.curved) ctx.quadraticCurveTo(g.cx, g.cy, g.bx, g.by)
  else ctx.lineTo(g.bx, g.by)
}

const strokeBucket = (ctx, geometries, color, width, dash) => {
  if (!geometries.length) return
  ctx.beginPath()
  geometries.forEach(g => tracePath(ctx, g))
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.stroke()
}

const isOffscreen = (g, rect) =>
  Math.max(g.ax, g.bx) < rect.minX || Math.min(g.ax, g.bx) > rect.maxX ||
  Math.max(g.ay, g.by) < rect.minY || Math.min(g.ay, g.by) > rect.maxY

const classifyLink = (link, view) => {
  const { source: a, target: b } = link
  if (view.pathKeys && view.pathKeys.has(edgePairKey(a.id, b.id))) return 'path'
  if (view.activeId && (a.id === view.activeId || b.id === view.activeId)) return 'highlight'
  if (view.pathKeys) return 'dim'
  if (view.focusIds) return 'dim'
  if (view.matchIds && !(view.matchIds.has(a.id) && view.matchIds.has(b.id))) return 'dim'
  return link.kind === 'wikilink' ? 'wiki' : 'structural'
}

const drawArrow = (ctx, g, targetRadius, color, px) => {
  const tipT = pointAt(g, 1)
  const fromT = pointAt(g, 0.96)
  const angle = Math.atan2(tipT.y - fromT.y, tipT.x - fromT.x)
  const tipX = g.bx - Math.cos(angle) * (targetRadius + 2 * px)
  const tipY = g.by - Math.sin(angle) * (targetRadius + 2 * px)
  const size = 7 * px
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - Math.cos(angle - 0.45) * size, tipY - Math.sin(angle - 0.45) * size)
  ctx.lineTo(tipX - Math.cos(angle + 0.45) * size, tipY - Math.sin(angle + 0.45) * size)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

// Particles flow along highlighted wiki-links from the linking node to the linked node
const drawParticles = (ctx, items, time, px) => {
  const subset = items.filter(i => i.link.kind === 'wikilink').slice(0, MAX_PARTICLE_EDGES)
  subset.forEach(({ link, g }) => {
    const phase = hash01(link.source.id + link.target.id)
    for (let i = 0; i < PARTICLES_PER_EDGE; i++) {
      const t = ((time / PARTICLE_PERIOD_MS) + phase + i / PARTICLES_PER_EDGE) % 1
      const p = pointAt(g, t)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2.4 * px, 0, Math.PI * 2)
      ctx.fillStyle = withAlpha('#fff3c4', 0.95)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(p.x, p.y, 5.5 * px, 0, Math.PI * 2)
      ctx.fillStyle = withAlpha(WIKILINK_COLOR, 0.22)
      ctx.fill()
    }
  })
  return subset.length > 0
}

// Returns true while something is animating (particles) so the engine keeps the frame loop alive
export const drawEdges = (ctx, frame) => {
  const { links, camera, width, height, view, style, time } = frame
  const px = 1 / camera.k
  const rect = visibleWorldRect(camera, width, height, CULL_MARGIN)
  const buckets = { structural: [], wiki: [], dim: [], highlight: [], path: [] }
  const items = { highlight: [], path: [] }

  links.forEach(link => {
    const g = edgeGeometry(link)
    if (isOffscreen(g, rect)) return
    const kind = classifyLink(link, view)
    buckets[kind].push(g)
    if (items[kind]) items[kind].push({ link, g })
  })

  ctx.save()
  ctx.lineCap = 'round'
  const dimAlpha = view.hoverId || view.pathKeys ? 0.05 : 0.11
  strokeBucket(ctx, buckets.dim, `rgba(148, 163, 184, ${dimAlpha})`, px, [])
  strokeBucket(ctx, buckets.structural, 'rgba(148, 163, 184, 0.26)', px * 1.1, [])
  strokeBucket(ctx, buckets.wiki, withAlpha(WIKILINK_COLOR, 0.42), px * 1.3, camera.k > 0.5 ? [5 * px, 4 * px] : [])
  items.highlight.forEach(({ link, g }) => {
    const wiki = link.kind === 'wikilink'
    strokeBucket(ctx, [g], wiki ? withAlpha(WIKILINK_COLOR, 0.95) : withAlpha(style.accent, 0.9), px * 2.1, [])
  })
  strokeBucket(ctx, buckets.path, withAlpha(PATH_COLOR, 0.95), px * 3.2, [])

  if (style.display.arrows && camera.k >= ARROW_MIN_ZOOM) {
    links.forEach(link => {
      if (link.kind !== 'wikilink') return
      drawArrow(ctx, edgeGeometry(link), link.target.r, withAlpha(WIKILINK_COLOR, 0.8), px)
    })
  }

  const animating = !style.reducedMotion && drawParticles(ctx, items.highlight, time, px)
  ctx.setLineDash([])
  ctx.restore()
  return animating
}
