// Cheap canvas backdrop (gradient + parallax stars) and a cached glow sprite per colour
import { withAlpha } from './graphStyle'

const STAR_COUNT = 110
const PARALLAX = 0.045
const GLOW_SPRITE_SIZE = 64

const buildStars = () => {
  let seed = 20260
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: STAR_COUNT }, () => ({
    x: next(), y: next(), depth: 0.25 + next() * 0.75, size: 0.6 + next() * 1.1, alpha: 0.12 + next() * 0.38
  }))
}

const STARS = buildStars()

export const drawBackground = (ctx, width, height, camera, accent) => {
  const cx = width * 0.5
  const cy = height * 0.42
  const radius = Math.max(width, height) * 0.8
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  base.addColorStop(0, '#0f1730')
  base.addColorStop(1, '#05070f')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, width, height)

  const tint = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.7)
  tint.addColorStop(0, withAlpha(accent, 0.09))
  tint.addColorStop(1, withAlpha(accent, 0))
  ctx.fillStyle = tint
  ctx.fillRect(0, 0, width, height)

  STARS.forEach(star => {
    const x = (((star.x * width + camera.x * PARALLAX * star.depth) % width) + width) % width
    const y = (((star.y * height + camera.y * PARALLAX * star.depth) % height) + height) % height
    ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha})`
    ctx.fillRect(x, y, star.size, star.size)
  })
}

const glowCache = new Map()

// Soft radial glow drawn with drawImage - far cheaper than ctx.shadowBlur
export const getGlowSprite = (color) => {
  if (glowCache.has(color)) return glowCache.get(color)
  const sprite = document.createElement('canvas')
  sprite.width = GLOW_SPRITE_SIZE
  sprite.height = GLOW_SPRITE_SIZE
  const sctx = sprite.getContext('2d')
  const half = GLOW_SPRITE_SIZE / 2
  const gradient = sctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, withAlpha(color, 0.55))
  gradient.addColorStop(0.45, withAlpha(color, 0.16))
  gradient.addColorStop(1, withAlpha(color, 0))
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, GLOW_SPRITE_SIZE, GLOW_SPRITE_SIZE)
  glowCache.set(color, sprite)
  return sprite
}
