// Colour + radius resolution for graph nodes (theme accent, Status colour, user overrides)
import { getStatusOption } from '~/utils/excelExporter'
import { NODE_BASE_RADIUS, SPRINT_FALLBACK_COLOR, TYPE_COLORS } from './graphConstants'

const FALLBACK_COLOR = '#94a3b8'
const MAX_DEGREE_GROWTH = 0.9
const DEGREE_GROWTH_RATE = 0.12
const PROGRESS_MIN_SCALE = 0.75
const PROGRESS_SCALE_RANGE = 0.75
const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export const resolveNodeColor = (model, style = {}) => {
  const colors = style.colors || {}
  if (model.type === 'sprint') return colors.sprint || style.accent || SPRINT_FALLBACK_COLOR
  if (model.type === 'cr') return colors[`status:${model.status}`] || getStatusOption(model.status).color
  return colors[model.type] || TYPE_COLORS[model.type] || FALLBACK_COLOR
}

export const computeNodeRadius = (model, degree, sizeBy) => {
  const base = NODE_BASE_RADIUS[model.type] || 8
  if (sizeBy === 'progress' && model.type === 'cr') {
    return base * (PROGRESS_MIN_SCALE + PROGRESS_SCALE_RANGE * (model.progress || 0))
  }
  return base * (1 + Math.min(Math.sqrt(degree) * DEGREE_GROWTH_RATE, MAX_DEGREE_GROWTH))
}

const rgbCache = new Map()

export const hexToRgb = (color) => {
  if (rgbCache.has(color)) return rgbCache.get(color)
  let rgb = null
  if (HEX_PATTERN.test(color || '')) {
    const hex = color.slice(1)
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
    rgb = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16))
  }
  rgbCache.set(color, rgb)
  return rgb
}

// '#38bdf8' + 0.4 -> 'rgba(56, 189, 248, 0.4)'; non-hex colours are returned unchanged
export const withAlpha = (color, alpha) => {
  const rgb = hexToRgb(color)
  return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})` : color
}
