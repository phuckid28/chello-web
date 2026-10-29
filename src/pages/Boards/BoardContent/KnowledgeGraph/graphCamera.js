// Pure camera maths: world <-> screen conversion, zoom about a point, fit-to-bounds, easing
import { CAMERA_LIMITS, FIT_PADDING } from './graphConstants'

export const DEFAULT_CAMERA = { x: 0, y: 0, k: 1 }

const FIT_MAX_ZOOM = 1.6

export const clampZoom = (k) => Math.min(CAMERA_LIMITS.max, Math.max(CAMERA_LIMITS.min, k))

// The camera maps world points to screen px:  screen = world * k + (x, y)
export const screenToWorld = (cam, sx, sy) => ({ x: (sx - cam.x) / cam.k, y: (sy - cam.y) / cam.k })

export const worldToScreen = (cam, wx, wy) => ({ x: wx * cam.k + cam.x, y: wy * cam.k + cam.y })

// Zooms by `factor` while keeping the world point under (sx, sy) fixed on screen
export const zoomAt = (cam, sx, sy, factor) => {
  const k = clampZoom(cam.k * factor)
  const ratio = k / cam.k
  return { k, x: sx - (sx - cam.x) * ratio, y: sy - (sy - cam.y) * ratio }
}

export const panBy = (cam, dx, dy) => ({ ...cam, x: cam.x + dx, y: cam.y + dy })

export const fitCamera = (bounds, width, height, padding = FIT_PADDING) => {
  if (!bounds || width <= 0 || height <= 0) return DEFAULT_CAMERA
  const w = Math.max(1, bounds.maxX - bounds.minX)
  const h = Math.max(1, bounds.maxY - bounds.minY)
  const k = clampZoom(Math.min(
    (width - padding * 2) / w,
    (height - padding * 2) / h,
    FIT_MAX_ZOOM
  ))
  const cx = (bounds.minX + bounds.maxX) / 2
  const cy = (bounds.minY + bounds.maxY) / 2
  return { k, x: width / 2 - cx * k, y: height / 2 - cy * k }
}

export const centerCamera = (cam, wx, wy, width, height, k = cam.k) => {
  const zoom = clampZoom(k)
  return { k: zoom, x: width / 2 - wx * zoom, y: height / 2 - wy * zoom }
}

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export const easeOutBack = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export const lerpCamera = (from, to, t) => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
  // Interpolate zoom geometrically so the animation feels uniform
  k: from.k * Math.pow(to.k / from.k, t)
})

export const visibleWorldRect = (cam, width, height, margin = 0) => ({
  minX: (-cam.x - margin) / cam.k,
  minY: (-cam.y - margin) / cam.k,
  maxX: (width - cam.x + margin) / cam.k,
  maxY: (height - cam.y + margin) / cam.k
})
