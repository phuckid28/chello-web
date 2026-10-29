// Pointer (mouse + touch), wheel and keyboard interactions for a graph canvas.
// The hook only forwards intent: the engine owns camera / drag state, handlers own React state.
import { useEffect, useRef } from 'react'

const DRAG_THRESHOLD_PX = 4
const DOUBLE_CLICK_MS = 320
const WHEEL_SENSITIVITY = 0.0016
const PINCH_WHEEL_SENSITIVITY = 0.01
const WHEEL_LINE_PX = 16
const WHEEL_PAGE_PX = 400
const KEY_ZOOM_IN = 1.25
const KEY_ZOOM_OUT = 0.8
const ARROW_MIN_ALIGNMENT = 0.35
const VISIBLE_MARGIN_PX = 60
const ARROWS = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
}

const isTypingTarget = (target) => {
  if (!target || !target.tagName) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
}

// Neighbour whose direction best matches the arrow key (screen space), or null
export const pickNeighborInDirection = (from, candidates, direction) => {
  let best = null
  let bestScore = ARROW_MIN_ALIGNMENT
  candidates.forEach(c => {
    const dx = c.x - from.x
    const dy = c.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) return
    const score = (dx * direction[0] + dy * direction[1]) / len
    if (score > bestScore) {
      best = c
      bestScore = score
    }
  })
  return best
}

const pointerPoint = (canvas, e) => {
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const isOutsideViewport = (engine, node) => {
  const { k, x, y } = engine.getCamera()
  const { width, height } = engine.getSize()
  const sx = node.x * k + x
  const sy = node.y * k + y
  return sx < VISIBLE_MARGIN_PX || sy < VISIBLE_MARGIN_PX || sx > width - VISIBLE_MARGIN_PX || sy > height - VISIBLE_MARGIN_PX
}

export const useGraphInteractions = ({ engine, canvasRef, containerRef, handlers, wheelZoom = true, keyboard = true }) => {
  const handlersRef = useRef(handlers)
  useEffect(() => { handlersRef.current = handlers })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!engine || !canvas) return undefined
    const container = containerRef?.current || canvas
    const pointers = new Map()
    let gesture = null
    let lastClick = { time: 0, id: null }
    let hoverId = null
    const call = (name, ...args) => handlersRef.current?.[name]?.(...args)

    const setCursor = (value) => { canvas.style.cursor = value }

    const selectNeighbor = (key) => {
      const currentId = call('getSelectedId')
      const current = currentId ? engine.getNode(currentId) : null
      if (!current) {
        const first = engine.getNodes()[0]
        if (first) call('onSelect', first.id, { fromKeyboard: true })
        return
      }
      const neighbors = (call('getNeighborIds', currentId) || []).map(id => engine.getNode(id)).filter(Boolean)
      const target = pickNeighborInDirection(current, neighbors, ARROWS[key])
      if (!target) return
      call('onSelect', target.id, { fromKeyboard: true })
      if (isOutsideViewport(engine, target)) engine.centerOn(target.id)
    }

    const startPinch = () => {
      const [a, b] = Array.from(pointers.values())
      if (gesture?.type === 'node' && gesture.moved) engine.endDrag(gesture.id)
      gesture = { type: 'pinch', dist: distanceBetween(a, b), center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
    }

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const point = pointerPoint(canvas, e)
      pointers.set(e.pointerId, point)
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch (err) {
        // Capture can fail for synthetic / already released pointers - dragging still works without it
      }
      if (keyboard && container !== canvas) container.focus({ preventScroll: true })
      if (pointers.size === 2) {
        startPinch()
        return
      }
      const hit = engine.hitTest(point.x, point.y)
      if (hit && hit.id !== hoverId) {
        hoverId = hit.id
        engine.setView({ hoverId })
        call('onHover', hoverId)
      }
      gesture = hit
        ? { type: 'node', id: hit.id, start: point, moved: false }
        : { type: 'pan', start: point, last: point, moved: false }
    }

    const hover = (point) => {
      const hit = engine.hitTest(point.x, point.y)
      const id = hit ? hit.id : null
      setCursor(id ? 'pointer' : 'grab')
      if (id !== hoverId) {
        hoverId = id
        engine.setView({ hoverId: id })
        call('onHover', id)
      }
    }

    const movePinch = (point, e) => {
      pointers.set(e.pointerId, point)
      const [a, b] = Array.from(pointers.values())
      const dist = distanceBetween(a, b)
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      if (gesture.dist > 0) engine.zoomBy(dist / gesture.dist, center.x, center.y)
      engine.panBy(center.x - gesture.center.x, center.y - gesture.center.y)
      gesture = { type: 'pinch', dist, center }
    }

    const onPointerMove = (e) => {
      const point = pointerPoint(canvas, e)
      if (!gesture) {
        if (e.pointerType === 'mouse') hover(point)
        return
      }
      if (gesture.type === 'pinch') {
        if (pointers.has(e.pointerId)) movePinch(point, e)
        return
      }
      pointers.set(e.pointerId, point)
      if (!gesture.moved && distanceBetween(point, gesture.start) > DRAG_THRESHOLD_PX) {
        gesture.moved = true
        setCursor('grabbing')
      }
      if (!gesture.moved) return
      if (gesture.type === 'node') {
        engine.dragNode(gesture.id, point.x, point.y)
      } else {
        engine.panBy(point.x - gesture.last.x, point.y - gesture.last.y)
        gesture.last = point
      }
    }

    const handleClick = (id, e) => {
      const now = performance.now()
      const isDouble = now - lastClick.time < DOUBLE_CLICK_MS && lastClick.id === id
      lastClick = { time: isDouble ? 0 : now, id }
      if (!id) {
        if (isDouble) engine.fit()
        else call('onSelect', null, {})
        return
      }
      if (!isDouble) {
        call('onSelect', id, { fromKeyboard: false })
        return
      }
      if (e.shiftKey) call('onOpen', id)
      else call('onPinChange', id, engine.togglePin(id))
    }

    const onPointerUp = (e) => {
      pointers.delete(e.pointerId)
      const finished = gesture
      if (!finished) return
      if (finished.type === 'pinch') {
        if (pointers.size < 2) gesture = null
        return
      }
      gesture = null
      if (finished.type === 'node' && finished.moved) engine.endDrag(finished.id)
      if (!finished.moved) handleClick(finished.type === 'node' ? finished.id : null, e)
      setCursor(e.pointerType === 'mouse' ? 'grab' : 'default')
    }

    const onPointerLeave = () => {
      if (gesture) return
      setCursor('grab')
      if (hoverId) {
        hoverId = null
        engine.setView({ hoverId: null })
        call('onHover', null)
      }
    }

    const onWheel = (e) => {
      e.preventDefault()
      const unit = e.deltaMode === 1 ? WHEEL_LINE_PX : (e.deltaMode === 2 ? WHEEL_PAGE_PX : 1)
      const sensitivity = e.ctrlKey ? PINCH_WHEEL_SENSITIVITY : WHEEL_SENSITIVITY
      const point = pointerPoint(canvas, e)
      engine.zoomBy(Math.exp(-e.deltaY * unit * sensitivity), point.x, point.y)
    }

    const keyActions = {
      f: () => engine.fit(),
      l: () => call('onToggleLocal'),
      Escape: () => call('onClear'),
      '+': () => engine.zoomBy(KEY_ZOOM_IN, undefined, undefined, true),
      '=': () => engine.zoomBy(KEY_ZOOM_IN, undefined, undefined, true),
      '-': () => engine.zoomBy(KEY_ZOOM_OUT, undefined, undefined, true),
      '_': () => engine.zoomBy(KEY_ZOOM_OUT, undefined, undefined, true),
      Enter: () => { const id = call('getSelectedId'); if (id) call('onOpen', id) }
    }

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter' && e.target !== container && e.target !== canvas) return
      if (e.key === '/') {
        e.preventDefault()
        call('onFocusSearch')
      } else if (ARROWS[e.key]) {
        e.preventDefault()
        selectNeighbor(e.key)
      } else if (keyActions[e.key] || keyActions[e.key.toLowerCase()]) {
        e.preventDefault()
        ;(keyActions[e.key] || keyActions[e.key.toLowerCase()])()
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)
    if (wheelZoom) canvas.addEventListener('wheel', onWheel, { passive: false })
    if (keyboard) container.addEventListener('keydown', onKeyDown)
    setCursor('grab')

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('wheel', onWheel)
      container.removeEventListener('keydown', onKeyDown)
    }
  }, [engine, canvasRef, containerRef, wheelZoom, keyboard])
}
