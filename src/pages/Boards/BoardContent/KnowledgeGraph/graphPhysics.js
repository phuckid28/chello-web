// d3-force style simulation written from scratch: alpha cooling, Barnes-Hut repulsion,
// per-kind link springs, radial rings per node type and grid based collision.
import { DEFAULT_FORCES, NODE_BASE_RADIUS } from './graphConstants'

const ALPHA_MIN = 0.003
const ALPHA_DECAY = 1 - Math.pow(ALPHA_MIN, 1 / 300)
const VELOCITY_DECAY = 0.45
const MAX_VELOCITY = 40
const THETA_SQ = 0.81
const REPEL_MAX_DISTANCE_SQ = 760 * 760
const REPEL_MIN_DISTANCE_SQ = 49
const MAX_TREE_DEPTH = 28
const COLLISION_PADDING = 3
const COLLISION_STRENGTH = 0.7
const NEW_NODE_JITTER = 0.55
const RING_SCALE_BASE_COUNT = 70

const LINK_PROFILE = {
  topic: { distance: 1.25, strength: 1 },
  contains: { distance: 1, strength: 0.9 },
  assigned: { distance: 1.45, strength: 0.3 },
  frd: { distance: 0.6, strength: 0.9 },
  wikilink: { distance: 1.7, strength: 0.5 },
  tagged: { distance: 1.2, strength: 0.35 }
}
const DEFAULT_PROFILE = { distance: 1, strength: 0.5 }

// Ring radius per node type in link-distance units (sprint sits in the middle)
const RING_FACTOR = { sprint: 0, topic: 1.5, cr: 2.9, wiki: 3.5, member: 3.9, frd: 3.4, tag: 4.2 }
const RADIAL_STRENGTH = { sprint: 1, topic: 0.14, cr: 0.05, wiki: 0.035, member: 0.03, frd: 0.04, tag: 0.03 }

// Deterministic hash in [0, 1) so layouts are reproducible between runs
export const hash01 = (text) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

const createJiggle = () => {
  let seed = 7
  return () => {
    seed = (seed * 16807) % 2147483647
    return ((seed / 2147483647) - 0.5) * 1e-4
  }
}

// ---- Barnes-Hut quadtree -------------------------------------------------------------------
const newCell = (x, y, size) => ({ x, y, size, node: null, extra: null, kids: null, mass: 0, cx: 0, cy: 0 })

const pushDown = (cell, node, depth) => {
  const half = cell.size / 2
  const right = node.x >= cell.x + half ? 1 : 0
  const bottom = node.y >= cell.y + half ? 2 : 0
  const idx = right | bottom
  if (!cell.kids[idx]) cell.kids[idx] = newCell(cell.x + (right ? half : 0), cell.y + (bottom ? half : 0), half)
  insertNode(cell.kids[idx], node, depth + 1)
}

const insertNode = (cell, node, depth) => {
  if (!cell.kids && !cell.node) {
    cell.node = node
    return
  }
  if (!cell.kids) {
    if (depth >= MAX_TREE_DEPTH) {
      cell.extra = cell.extra || []
      cell.extra.push(node)
      return
    }
    const resident = cell.node
    cell.node = null
    cell.kids = [null, null, null, null]
    pushDown(cell, resident, depth)
  }
  pushDown(cell, node, depth)
}

const accumulate = (cell) => {
  if (!cell.kids) {
    const bodies = cell.extra ? [cell.node, ...cell.extra] : [cell.node]
    bodies.forEach(b => {
      cell.mass += b.charge
      cell.cx += b.x * b.charge
      cell.cy += b.y * b.charge
    })
  } else {
    cell.kids.forEach(k => {
      if (!k) return
      accumulate(k)
      cell.mass += k.mass
      cell.cx += k.cx * k.mass
      cell.cy += k.cy * k.mass
    })
  }
  if (cell.mass > 0) {
    cell.cx /= cell.mass
    cell.cy /= cell.mass
  }
}

const buildTree = (nodes) => {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  nodes.forEach(n => {
    if (n.x < x0) x0 = n.x
    if (n.y < y0) y0 = n.y
    if (n.x > x1) x1 = n.x
    if (n.y > y1) y1 = n.y
  })
  const root = newCell(x0, y0, Math.max(x1 - x0, y1 - y0) + 1)
  nodes.forEach(n => insertNode(root, n, 0))
  accumulate(root)
  return root
}

const pushAway = (node, bx, by, mass, alpha, jiggle) => {
  let dx = bx - node.x
  let dy = by - node.y
  if (dx === 0) dx = jiggle()
  if (dy === 0) dy = jiggle()
  let d2 = dx * dx + dy * dy
  if (d2 > REPEL_MAX_DISTANCE_SQ) return
  if (d2 < REPEL_MIN_DISTANCE_SQ) d2 = Math.sqrt(REPEL_MIN_DISTANCE_SQ * d2)
  const w = (mass * alpha) / d2
  node.vx -= dx * w
  node.vy -= dy * w
}

const repelFromCell = (cell, node, alpha, jiggle) => {
  if (!cell.kids) {
    if (cell.node !== node) pushAway(node, cell.node.x, cell.node.y, cell.node.charge, alpha, jiggle)
    if (cell.extra) cell.extra.forEach(b => b !== node && pushAway(node, b.x, b.y, b.charge, alpha, jiggle))
    return
  }
  const dx = cell.cx - node.x
  const dy = cell.cy - node.y
  const d2 = dx * dx + dy * dy
  if ((cell.size * cell.size) / d2 < THETA_SQ) {
    pushAway(node, cell.cx, cell.cy, cell.mass, alpha, jiggle)
    return
  }
  cell.kids.forEach(k => k && repelFromCell(k, node, alpha, jiggle))
}

// ---- Simulation -----------------------------------------------------------------------------
export const createSimulation = (initialForces = {}) => {
  let forces = { ...DEFAULT_FORCES, ...initialForces }
  let nodes = []
  let links = []
  let nodeById = new Map()
  let alpha = 0
  let alphaTarget = 0
  let pinnedPositions = new Map()
  const jiggle = createJiggle()

  let layoutCount = 0

  const ringRadius = (type) => {
    const scale = Math.max(1, Math.sqrt(layoutCount / RING_SCALE_BASE_COUNT))
    return forces.linkDistance * (RING_FACTOR[type] ?? 3) * scale
  }

  const placeNew = (node, neighbor) => {
    const angle = hash01(`${node.id}:a`) * Math.PI * 2
    if (neighbor) {
      const spread = forces.linkDistance * NEW_NODE_JITTER * (0.7 + hash01(`${node.id}:r`))
      return { x: neighbor.x + Math.cos(angle) * spread, y: neighbor.y + Math.sin(angle) * spread }
    }
    const radius = ringRadius(node.type) * (0.85 + hash01(`${node.id}:r`) * 0.3)
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
  }

  const createSimNode = (model, point) => {
    const pin = pinnedPositions.get(model.id)
    const x = pin ? pin.x : point.x
    const y = pin ? pin.y : point.y
    return {
      id: model.id, type: model.type, model, x, y, vx: 0, vy: 0,
      fx: pin ? pin.x : null, fy: pin ? pin.y : null, pinned: Boolean(pin),
      r: NODE_BASE_RADIUS[model.type] || 8, charge: 1, degree: 0, bornAt: 0, color: '#94a3b8'
    }
  }

  const refreshLinks = (edges) => {
    const degree = new Map()
    const resolved = edges
      .map(e => ({ s: nodeById.get(e.source), t: nodeById.get(e.target), kind: e.kind }))
      .filter(l => l.s && l.t)
    resolved.forEach(l => {
      degree.set(l.s.id, (degree.get(l.s.id) || 0) + 1)
      degree.set(l.t.id, (degree.get(l.t.id) || 0) + 1)
    })
    nodes.forEach(n => { n.degree = degree.get(n.id) || 0 })
    links = resolved.map(({ s, t, kind }) => {
      const profile = LINK_PROFILE[kind] || DEFAULT_PROFILE
      return {
        source: s, target: t, kind, profile,
        strength: Math.min(1, profile.strength / Math.max(1, Math.min(s.degree, t.degree))),
        bias: s.degree / Math.max(1, s.degree + t.degree)
      }
    })
  }

  // Keeps the position of every node that survives a data change; new nodes spawn next to a neighbour
  const setData = ({ nodes: modelNodes, edges }, now = 0) => {
    const previous = nodeById
    layoutCount = modelNodes.length
    const neighborOf = new Map()
    edges.forEach(e => {
      if (previous.has(e.target) && !neighborOf.has(e.source)) neighborOf.set(e.source, previous.get(e.target))
      if (previous.has(e.source) && !neighborOf.has(e.target)) neighborOf.set(e.target, previous.get(e.source))
    })
    const firstLoad = previous.size === 0
    let added = 0
    nodes = modelNodes.map((model, idx) => {
      const existing = previous.get(model.id)
      if (existing) {
        existing.model = model
        return existing
      }
      added += 1
      const node = createSimNode(model, placeNew({ id: model.id, type: model.type }, neighborOf.get(model.id)))
      node.bornAt = now + (firstLoad ? Math.min(idx * 5, 700) : 0)
      return node
    })
    const removed = previous.size - (nodes.length - added)
    nodeById = new Map(nodes.map(n => [n.id, n]))
    refreshLinks(edges)
    refreshCharges()
    if (firstLoad) alpha = 1
    else if (added || removed) alpha = Math.max(alpha, added ? 0.55 : 0.3)
    return { added, removed, firstLoad }
  }

  const refreshCharges = () => {
    nodes.forEach(n => { n.charge = forces.repel * (0.55 + n.r / 14) })
  }

  const applyLinks = () => {
    links.forEach(l => {
      const { source: s, target: t } = l
      let x = t.x + t.vx - s.x - s.vx || jiggle()
      let y = t.y + t.vy - s.y - s.vy || jiggle()
      const len = Math.sqrt(x * x + y * y)
      const rest = forces.linkDistance * l.profile.distance + (s.r + t.r) * 0.5
      const k = ((len - rest) / len) * alpha * l.strength
      x *= k
      y *= k
      t.vx -= x * l.bias
      t.vy -= y * l.bias
      s.vx += x * (1 - l.bias)
      s.vy += y * (1 - l.bias)
    })
  }

  const applyRepulsion = () => {
    if (nodes.length < 2) return
    const tree = buildTree(nodes)
    nodes.forEach(n => repelFromCell(tree, n, alpha, jiggle))
  }

  const applyRadial = () => {
    const gain = 0.3 + forces.centerStrength * 1.4
    nodes.forEach(n => {
      const strength = (RADIAL_STRENGTH[n.type] ?? 0.03) * gain * alpha
      const radius = Math.sqrt(n.x * n.x + n.y * n.y) || 1
      const delta = ((ringRadius(n.type) - radius) / radius) * strength
      n.vx += n.x * delta
      n.vy += n.y * delta
    })
  }

  const applyCollision = () => {
    const maxR = nodes.reduce((m, n) => Math.max(m, n.r), 1)
    const cellSize = maxR * 2 + COLLISION_PADDING * 2
    const grid = new Map()
    nodes.forEach((n, i) => {
      const key = Math.floor(n.x / cellSize) * 100003 + Math.floor(n.y / cellSize)
      const bucket = grid.get(key)
      if (bucket) bucket.push(i)
      else grid.set(key, [i])
    })
    nodes.forEach((a, i) => collideWithNeighbors(a, i, grid, cellSize))
  }

  const collideWithNeighbors = (a, i, grid, cellSize) => {
    const gx = Math.floor(a.x / cellSize)
    const gy = Math.floor(a.y / cellSize)
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get((gx + ox) * 100003 + (gy + oy))
        if (bucket) bucket.forEach(j => j > i && separate(a, nodes[j]))
      }
    }
  }

  const separate = (a, b) => {
    let dx = b.x - a.x || jiggle()
    let dy = b.y - a.y || jiggle()
    const dist = Math.sqrt(dx * dx + dy * dy)
    const overlap = a.r + b.r + COLLISION_PADDING - dist
    if (overlap <= 0) return
    dx /= dist
    dy /= dist
    const push = overlap * COLLISION_STRENGTH * 0.5
    const aShare = a.r * a.r / (a.r * a.r + b.r * b.r)
    b.vx += dx * push * aShare * 2
    b.vy += dy * push * aShare * 2
    a.vx -= dx * push * (1 - aShare) * 2
    a.vy -= dy * push * (1 - aShare) * 2
  }

  const integrate = () => {
    nodes.forEach(n => {
      if (n.fx !== null && n.fy !== null) {
        n.x = n.fx
        n.y = n.fy
        n.vx = 0
        n.vy = 0
        return
      }
      n.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, n.vx * (1 - VELOCITY_DECAY)))
      n.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, n.vy * (1 - VELOCITY_DECAY)))
      n.x += n.vx
      n.y += n.vy
    })
  }

  const isRunning = () => nodes.length > 0 && (alpha >= ALPHA_MIN || alphaTarget > 0)

  const tick = () => {
    if (!isRunning()) return false
    alpha += (alphaTarget - alpha) * ALPHA_DECAY
    applyLinks()
    applyRepulsion()
    applyRadial()
    applyCollision()
    integrate()
    return true
  }

  const settle = (maxTicks) => {
    let count = 0
    while (count < maxTicks && tick()) count += 1
    return count
  }

  const setForces = (patch) => {
    forces = { ...forces, ...patch }
    refreshCharges()
    alpha = Math.max(alpha, 0.5)
  }

  const setPinned = (id, pinned) => {
    const node = nodeById.get(id)
    if (!node) return
    node.pinned = pinned
    if (pinned) {
      node.fx = node.x
      node.fy = node.y
      pinnedPositions.set(id, { x: node.x, y: node.y })
    } else {
      node.fx = null
      node.fy = null
      pinnedPositions.delete(id)
    }
  }

  const setPinnedPositions = (positions) => {
    pinnedPositions = new Map(Object.entries(positions || {}).filter(([, p]) => Number.isFinite(p?.x) && Number.isFinite(p?.y)))
    nodes.forEach(n => {
      const pin = pinnedPositions.get(n.id)
      if (pin) Object.assign(n, { x: pin.x, y: pin.y, fx: pin.x, fy: pin.y, pinned: true })
    })
  }

  const getPinnedPositions = () => {
    const out = {}
    nodes.filter(n => n.pinned).forEach(n => { out[n.id] = { x: Math.round(n.x), y: Math.round(n.y) } })
    return out
  }

  const dragTo = (id, x, y) => {
    const node = nodeById.get(id)
    if (!node) return
    node.fx = x
    node.fy = y
    if (node.pinned) pinnedPositions.set(id, { x, y })
    alphaTarget = 0.25
    alpha = Math.max(alpha, 0.25)
  }

  const endDrag = (id) => {
    const node = nodeById.get(id)
    alphaTarget = 0
    if (node && !node.pinned) {
      node.fx = null
      node.fy = null
    }
  }

  const getBounds = (ids) => {
    const subset = ids ? nodes.filter(n => ids.has(n.id)) : nodes
    if (!subset.length) return null
    return subset.reduce((b, n) => ({
      minX: Math.min(b.minX, n.x - n.r),
      minY: Math.min(b.minY, n.y - n.r),
      maxX: Math.max(b.maxX, n.x + n.r),
      maxY: Math.max(b.maxY, n.y + n.r)
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
  }

  return {
    get nodes() { return nodes },
    get links() { return links },
    get alpha() { return alpha },
    get forces() { return forces },
    getNode: (id) => nodeById.get(id) || null,
    setData,
    setForces,
    tick,
    settle,
    isRunning,
    reheat: (value = 0.5) => { alpha = Math.max(alpha, value) },
    refreshCharges,
    setPinned,
    setPinnedPositions,
    getPinnedPositions,
    dragTo,
    endDrag,
    getBounds
  }
}
