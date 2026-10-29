// Imperative graph engine: owns the simulation, the camera and the dirty-flag frame loop.
// React never re-renders per frame - components talk to the engine through this small API.
import {
  CAMERA_LIMITS, DEFAULT_DISPLAY, FIT_DURATION_MS, FIT_PADDING
} from './graphConstants'
import {
  DEFAULT_CAMERA, centerCamera, clampZoom, easeInOutCubic, fitCamera, lerpCamera, screenToWorld, zoomAt
} from './graphCamera'
import { createSimulation } from './graphPhysics'
import { drawGraph } from './graphRenderer'
import { computeNodeRadius, resolveNodeColor } from './graphStyle'

const MAX_DPR = 3
const PREWARM_BUDGET = 30000
const PREWARM_MIN_TICKS = 20
const PREWARM_MAX_TICKS = 90
const REDUCED_MOTION_TICKS = 400
const FAST_TICK_ALPHA = 0.5
const FAST_TICK_MAX_NODES = 700
const ANIMATION_FRAME_MS = 24
const HUB_COUNT = 6
const HIT_TOLERANCE_PX = 5
const HUB_EXCLUDED = ['sprint', 'topic']

const emptyView = {
  hoverId: null, selectedId: null, matchIds: null, pathIds: null, pathKeys: null, endpointIds: null
}

export const createGraphEngine = ({ canvas, reducedMotion = false, onPinsChange = null }) => {
  const ctx = canvas.getContext('2d')
  const sim = createSimulation()
  const listeners = new Set()
  let camera = { ...DEFAULT_CAMERA }
  let size = { width: 0, height: 0, dpr: 1 }
  let graph = null
  let style = { accent: '#38bdf8', secondary: '#a78bfa', colors: {}, display: DEFAULT_DISPLAY, reducedMotion }
  let view = { ...emptyView }
  let derived = { activeId: null, focusIds: null, hubIds: new Set() }
  let raf = null
  let dirty = true
  let animating = false
  let cameraTween = null
  let autoFitPending = true
  let wasRunning = false
  let lastDrawAt = 0
  let destroyed = false

  // ---- derived state -------------------------------------------------------------------------
  const recomputeDerived = () => {
    const activeId = view.hoverId || view.selectedId
    const neighbors = activeId && graph ? graph.adjacency.get(activeId) : null
    const hubs = graph
      ? graph.nodes
        .filter(n => !HUB_EXCLUDED.includes(n.type))
        .sort((a, b) => (graph.degree.get(b.id) || 0) - (graph.degree.get(a.id) || 0))
        .slice(0, HUB_COUNT)
        .filter(n => (graph.degree.get(n.id) || 0) > 2)
      : []
    derived = {
      activeId: neighbors ? activeId : null,
      focusIds: neighbors ? new Set([activeId, ...neighbors]) : null,
      hubIds: new Set(hubs.map(n => n.id))
    }
  }

  const syncNodeVisuals = () => {
    sim.nodes.forEach(n => {
      n.color = resolveNodeColor(n.model, style)
      n.r = computeNodeRadius(n.model, n.degree, style.display.sizeBy)
    })
    sim.refreshCharges()
  }

  // ---- frame loop ----------------------------------------------------------------------------
  const schedule = () => {
    if (raf !== null || destroyed) return
    raf = window.requestAnimationFrame(frame)
  }

  const markDirty = () => {
    dirty = true
    schedule()
  }

  const stepCamera = (now) => {
    if (!cameraTween) return
    const t = Math.min(1, (now - cameraTween.start) / cameraTween.duration)
    camera = lerpCamera(cameraTween.from, cameraTween.to, easeInOutCubic(t))
    if (t >= 1) cameraTween = null
    dirty = true
  }

  const stepSimulation = () => {
    const running = sim.isRunning()
    if (running) {
      const fast = sim.alpha > FAST_TICK_ALPHA && sim.nodes.length < FAST_TICK_MAX_NODES
      sim.tick()
      if (fast) sim.tick()
      dirty = true
    }
    if (wasRunning && !running && autoFitPending) fit({ animate: true })
    wasRunning = running
    return running
  }

  function frame(now) {
    raf = null
    if (destroyed) return
    stepCamera(now)
    const running = stepSimulation()
    const animationDue = animating && now - lastDrawAt >= ANIMATION_FRAME_MS
    if (dirty || animationDue) draw(now)
    if (running || cameraTween || animating || dirty) schedule()
  }

  function draw(now) {
    dirty = false
    if (size.width <= 0 || size.height <= 0) return
    const frameData = {
      width: size.width,
      height: size.height,
      dpr: size.dpr,
      camera,
      nodes: sim.nodes,
      links: sim.links,
      time: now,
      style,
      view: { ...view, ...derived }
    }
    animating = drawGraph(ctx, frameData)
    lastDrawAt = now
    listeners.forEach(fn => fn(frameData))
  }

  // ---- camera --------------------------------------------------------------------------------
  const moveCamera = (target, animate) => {
    if (!animate || style.reducedMotion || size.width <= 0) {
      camera = target
      cameraTween = null
    } else {
      cameraTween = { from: camera, to: target, start: performance.now(), duration: FIT_DURATION_MS }
    }
    markDirty()
  }

  function fit({ animate = true, ids = null, padding = FIT_PADDING, auto = false } = {}) {
    const bounds = sim.getBounds(ids)
    if (!bounds) return
    if (!auto) autoFitPending = false
    moveCamera(fitCamera(bounds, size.width, size.height, padding), animate)
  }

  const markUserMoved = () => {
    autoFitPending = false
    cameraTween = null
  }

  // ---- sizing --------------------------------------------------------------------------------
  const measure = () => {
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(0, Math.round(rect.width))
    const height = Math.max(0, Math.round(rect.height))
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
    if (width === size.width && height === size.height && dpr === size.dpr) return
    const first = size.width === 0
    camera = { ...camera, x: camera.x + (width - size.width) / 2, y: camera.y + (height - size.height) / 2 }
    size = { width, height, dpr }
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    if (first && sim.nodes.length) fit({ animate: false, auto: true })
    markDirty()
  }

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
  if (resizeObserver) resizeObserver.observe(canvas)
  window.addEventListener('resize', measure)
  measure()

  // ---- public API ----------------------------------------------------------------------------
  const setData = (nextGraph) => {
    graph = nextGraph
    const result = sim.setData({ nodes: graph.nodes, edges: graph.edges }, performance.now())
    syncNodeVisuals()
    recomputeDerived()
    if (result.firstLoad && sim.nodes.length) {
      const budget = Math.max(PREWARM_MIN_TICKS, Math.min(PREWARM_MAX_TICKS, Math.floor(PREWARM_BUDGET / sim.nodes.length)))
      sim.settle(style.reducedMotion ? REDUCED_MOTION_TICKS : budget)
      autoFitPending = true
      fit({ animate: false, auto: true })
    } else if (style.reducedMotion) {
      sim.settle(REDUCED_MOTION_TICKS)
    }
    markDirty()
  }

  const setStyle = (patch) => {
    const next = { ...style, ...patch, display: { ...style.display, ...(patch.display || {}) } }
    style = next
    syncNodeVisuals()
    markDirty()
  }

  const setView = (patch) => {
    view = { ...view, ...patch }
    recomputeDerived()
    markDirty()
  }

  const setForces = (patch) => {
    sim.setForces(patch)
    markDirty()
  }

  const hitTest = (sx, sy) => {
    const world = screenToWorld(camera, sx, sy)
    const nodes = sim.nodes
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const reach = n.r + HIT_TOLERANCE_PX / camera.k
      const dx = world.x - n.x
      const dy = world.y - n.y
      if (dx * dx + dy * dy <= reach * reach) return n
    }
    return null
  }

  const zoomBy = (factor, sx = size.width / 2, sy = size.height / 2, animate = false) => {
    markUserMoved()
    const base = cameraTween ? cameraTween.to : camera
    moveCamera(zoomAt(base, sx, sy, factor), animate)
  }

  const panBy = (dx, dy) => {
    markUserMoved()
    camera = { ...camera, x: camera.x + dx, y: camera.y + dy }
    markDirty()
  }

  const centerOn = (id, k) => {
    const node = sim.getNode(id)
    if (!node) return
    markUserMoved()
    moveCamera(centerCamera(camera, node.x, node.y, size.width, size.height, k ? clampZoom(k) : camera.k), true)
  }

  const setCamera = (next) => {
    markUserMoved()
    camera = { x: next.x, y: next.y, k: Math.min(CAMERA_LIMITS.max, Math.max(CAMERA_LIMITS.min, next.k)) }
    markDirty()
  }

  const persistPins = () => { if (onPinsChange) onPinsChange(sim.getPinnedPositions()) }

  const togglePin = (id) => {
    const node = sim.getNode(id)
    if (!node) return false
    sim.setPinned(id, !node.pinned)
    persistPins()
    markDirty()
    return node.pinned
  }

  const dragNode = (id, sx, sy) => {
    const world = screenToWorld(camera, sx, sy)
    sim.dragTo(id, world.x, world.y)
    markDirty()
  }

  const endDrag = (id) => {
    sim.endDrag(id)
    if (sim.getNode(id)?.pinned) persistPins()
    markDirty()
  }

  const exportPng = () => new Promise(resolve => {
    draw(performance.now())
    canvas.toBlob(blob => resolve(blob), 'image/png')
  })

  const destroy = () => {
    destroyed = true
    if (raf !== null) window.cancelAnimationFrame(raf)
    raf = null
    if (resizeObserver) resizeObserver.disconnect()
    window.removeEventListener('resize', measure)
    listeners.clear()
  }

  return {
    setData,
    setStyle,
    setView,
    setForces,
    setPins: (positions) => { sim.setPinnedPositions(positions); markDirty() },
    hitTest,
    fit,
    zoomBy,
    panBy,
    centerOn,
    setCamera,
    togglePin,
    dragNode,
    endDrag,
    exportPng,
    destroy,
    markDirty,
    markUserMoved,
    reheat: (value) => { sim.reheat(value); markDirty() },
    getNode: (id) => sim.getNode(id),
    getNodes: () => sim.nodes,
    getCamera: () => camera,
    getSize: () => size,
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    }
  }
}
