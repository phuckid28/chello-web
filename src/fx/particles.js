// Lightweight canvas particle engine for cursor trail, click sparkles and celebrations.
// Pure logic (no React): the provider owns the canvas, this module owns the physics.

const MAX_PARTICLES = 180
const TRAIL_MIN_DISTANCE = 22
const TRAIL_GLYPH_EVERY = 4

// Motion personality per theme
export const THEME_MOTION = {
  cosmos: { kind: 'twinkle', gravity: -0.004, drift: 0.2 },
  'wind-chime': { kind: 'drift', gravity: -0.002, drift: 0.9 },
  'sora-sky': { kind: 'float', gravity: -0.012, drift: 0.35 },
  'sora-twilight': { kind: 'twinkle', gravity: -0.006, drift: 0.25 },
  'sora-usagi': { kind: 'float', gravity: -0.014, drift: 0.4 },
  furina: { kind: 'fall', gravity: 0.045, drift: 0.3 },
  nahida: { kind: 'drift', gravity: 0.02, drift: 0.8 }
}

const DEFAULT_MOTION = THEME_MOTION['sora-sky']

export const getMotion = (themeKey) => THEME_MOTION[themeKey] || DEFAULT_MOTION

const rand = (min, max) => min + Math.random() * (max - min)

export const createParticle = ({ x, y, vx, vy, life, size, glyph, color, motion, spin = 0 }) => ({
  x, y, vx, vy, life, maxLife: life, size, glyph, color, motion, rot: rand(0, Math.PI * 2), spin, phase: rand(0, Math.PI * 2)
})

// Advances one particle by `dt` frames (1 = 16.6ms). Returns a new particle or null when expired.
export const stepParticle = (p, dt) => {
  const life = p.life - dt
  if (life <= 0) return null
  const wobble = p.motion.kind === 'drift' ? Math.sin((p.maxLife - life) * 0.12 + p.phase) * p.motion.drift * 0.35 : 0
  return {
    ...p,
    life,
    x: p.x + (p.vx + wobble) * dt,
    y: p.y + p.vy * dt,
    vx: p.vx * 0.985,
    vy: (p.vy + p.motion.gravity * dt) * 0.99,
    rot: p.rot + p.spin * dt
  }
}

export const particleAlpha = (p) => {
  const t = p.life / p.maxLife
  const fade = t < 0.35 ? t / 0.35 : 1
  return p.motion.kind === 'twinkle' ? fade * (0.65 + 0.35 * Math.sin((p.maxLife - p.life) * 0.35 + p.phase)) : fade
}

export const shouldEmitTrail = (last, x, y) => {
  if (!last) return true
  const dx = x - last.x
  const dy = y - last.y
  return dx * dx + dy * dy >= TRAIL_MIN_DISTANCE * TRAIL_MIN_DISTANCE
}

export const buildTrailParticle = ({ x, y, themeKey, colors, symbols, counter }) => {
  const motion = getMotion(themeKey)
  const useGlyph = counter % TRAIL_GLYPH_EVERY === 0 && symbols.length > 0
  return createParticle({
    x: x + rand(-3, 3),
    y: y + rand(-3, 3),
    vx: rand(-0.35, 0.35) * (1 + motion.drift),
    vy: rand(-0.2, 0.5),
    life: rand(26, 42),
    size: useGlyph ? rand(11, 15) : rand(2.2, 4.2),
    glyph: useGlyph ? symbols[counter % symbols.length] : null,
    color: counter % 2 === 0 ? colors.accent : colors.secondary,
    motion,
    spin: rand(-0.05, 0.05)
  })
}

export const buildBurst = ({ x, y, themeKey, colors, symbols, count = 10, power = 1 }) => {
  const motion = getMotion(themeKey)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rand(-0.25, 0.25)
    const speed = rand(1.6, 4.2) * power
    const useGlyph = i % 3 === 0 && symbols.length > 0
    return createParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.6,
      life: rand(34, 60),
      size: useGlyph ? rand(13, 19) : rand(2.6, 5),
      glyph: useGlyph ? symbols[i % symbols.length] : null,
      color: i % 2 === 0 ? colors.accent : colors.secondary,
      motion,
      spin: rand(-0.14, 0.14)
    })
  })
}

// Confetti rain used when a CR reaches 100% — wide, slow and festive
export const buildCelebration = ({ x, y, themeKey, colors, symbols, count = 56 }) => {
  const motion = { ...getMotion(themeKey), gravity: 0.06 }
  return Array.from({ length: count }, (_, i) => {
    const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05)
    const speed = rand(4, 11)
    const useGlyph = i % 4 === 0 && symbols.length > 0
    return createParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(70, 120),
      size: useGlyph ? rand(15, 24) : rand(3.5, 7),
      glyph: useGlyph ? symbols[i % symbols.length] : null,
      color: [colors.accent, colors.secondary, '#ffffff', '#fde68a'][i % 4],
      motion,
      spin: rand(-0.2, 0.2)
    })
  })
}

export const capParticles = (list) => (list.length > MAX_PARTICLES ? list.slice(list.length - MAX_PARTICLES) : list)

export const drawParticle = (ctx, p) => {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, particleAlpha(p)))
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  if (p.glyph) {
    ctx.font = `${p.size}px "Noto Color Emoji", "Segoe UI Emoji", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(p.glyph, 0, 0)
  } else {
    ctx.fillStyle = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(0, 0, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
