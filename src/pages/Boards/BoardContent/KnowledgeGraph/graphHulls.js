// Soft cluster hulls drawn behind each Topic (convex hull of its CRs, padded and rounded)
import { hash01 } from './graphPhysics'

const HULL_PADDING = 26
const MIN_HULL_POINTS = 2

const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

// Andrew's monotone chain
export const convexHull = (points) => {
  const sorted = points.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1])
  if (sorted.length < 3) return sorted
  const build = (list) => {
    const hull = []
    list.forEach(p => {
      while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) hull.pop()
      hull.push(p)
    })
    hull.pop()
    return hull
  }
  return build(sorted).concat(build(sorted.slice().reverse()))
}

const groupByTopic = (nodes) => {
  const groups = new Map()
  nodes.forEach(n => {
    const topicId = n.type === 'cr' ? n.model.topicId : (n.type === 'topic' ? n.id : null)
    if (!topicId) return
    if (!groups.has(topicId)) groups.set(topicId, [])
    const list = groups.get(topicId)
    const r = n.r
    list.push([n.x - r, n.y - r], [n.x + r, n.y - r], [n.x + r, n.y + r], [n.x - r, n.y + r])
  })
  return groups
}

export const drawHulls = (ctx, nodes) => {
  ctx.save()
  ctx.lineJoin = 'round'
  groupByTopic(nodes).forEach((points, topicId) => {
    if (points.length < MIN_HULL_POINTS * 4) return
    const hull = convexHull(points)
    if (hull.length < 2) return
    const hue = Math.round(hash01(topicId) * 360)
    ctx.fillStyle = `hsla(${hue}, 75%, 62%, 0.055)`
    ctx.strokeStyle = `hsla(${hue}, 75%, 62%, 0.055)`
    ctx.lineWidth = HULL_PADDING * 2
    ctx.beginPath()
    hull.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  })
  ctx.restore()
}
