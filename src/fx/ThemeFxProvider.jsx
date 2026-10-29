import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import FxGlobalStyles from '~/fx/FxGlobalStyles'
import { useFxTheme } from '~/fx/fxThemeStore'
import { getFxSettings, isFinePointer, isMotionReduced, subscribeFxSettings } from '~/fx/fxSettings'
import { buildCursorValues } from '~/fx/cursorArt'
import { FX_BURST_EVENT, FX_CELEBRATE_EVENT } from '~/fx/fxEvents'
import {
  buildBurst,
  buildCelebration,
  buildTrailParticle,
  capParticles,
  drawParticle,
  shouldEmitTrail,
  stepParticle
} from '~/fx/particles'

const CANVAS_Z_INDEX = 2400
const SPARKLE_COUNT = 9

// Mounted once: applies the themed cursor, and renders trail / sparkle / celebration particles.
function ThemeFxProvider() {
  const { key, theme } = useFxTheme()
  const settings = useSyncExternalStore(subscribeFxSettings, getFxSettings)
  const canvasRef = useRef(null)
  const cursorOn = settings.cursor && isFinePointer()

  const cursorValues = useMemo(
    () => buildCursorValues(key, { accent: theme.accentColor, secondary: theme.secondaryAccent }),
    [key, theme.accentColor, theme.secondaryAccent]
  )

  // Theme attributes + cursor variables on <html>
  useEffect(() => {
    const root = document.documentElement
    root.dataset.fxTheme = key
    root.dataset.fxCursor = cursorOn ? 'on' : 'off'
    root.style.setProperty('--fx-cursor-default', cursorValues.defaultCursor)
    root.style.setProperty('--fx-cursor-pointer', cursorValues.pointerCursor)
    root.style.setProperty('--fx-accent', theme.accentColor)
    root.style.setProperty('--fx-secondary', theme.secondaryAccent)
    return () => { root.dataset.fxCursor = 'off' }
  }, [key, cursorOn, cursorValues, theme.accentColor, theme.secondaryAccent])

  // Elements that declare `cursor: pointer` (via sx / emotion classes) get the themed pointer too
  useEffect(() => {
    if (!cursorOn) return undefined
    const markPointerTargets = (event) => {
      const target = event.target
      if (!(target instanceof Element) || target.hasAttribute('data-fx-pointer')) return
      if (getComputedStyle(target).cursor.startsWith('pointer')) target.setAttribute('data-fx-pointer', '')
    }
    document.addEventListener('pointerover', markPointerTargets, { passive: true })
    return () => document.removeEventListener('pointerover', markPointerTargets)
  }, [cursorOn])

  // Particle engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isMotionReduced()) return undefined
    const ctx = canvas.getContext('2d')
    const colors = { accent: theme.accentColor, secondary: theme.secondaryAccent }
    const symbols = theme.particleSymbols || []
    let particles = []
    let frameId = null
    let lastTrail = null
    let trailCounter = 0
    let lastTime = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const tick = (now) => {
      const dt = Math.min(3, (now - lastTime) / 16.6667)
      lastTime = now
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particles = particles.map(p => stepParticle(p, dt)).filter(Boolean)
      particles.forEach(p => drawParticle(ctx, p))
      frameId = particles.length > 0 ? window.requestAnimationFrame(tick) : null
    }

    const spawn = (batch) => {
      particles = capParticles([...particles, ...batch])
      if (frameId === null) {
        lastTime = performance.now()
        frameId = window.requestAnimationFrame(tick)
      }
    }

    const onMove = (event) => {
      if (!settings.trail || event.pointerType !== 'mouse') return
      if (!shouldEmitTrail(lastTrail, event.clientX, event.clientY)) return
      lastTrail = { x: event.clientX, y: event.clientY }
      trailCounter += 1
      spawn([buildTrailParticle({ x: event.clientX, y: event.clientY, themeKey: key, colors, symbols, counter: trailCounter })])
    }

    const onDown = (event) => {
      if (!settings.sparkles || event.button !== 0) return
      spawn(buildBurst({ x: event.clientX, y: event.clientY, themeKey: key, colors, symbols, count: SPARKLE_COUNT }))
    }

    const onBurst = (event) => {
      const { x = window.innerWidth / 2, y = window.innerHeight / 2, count = 14 } = event.detail || {}
      if (settings.sparkles) spawn(buildBurst({ x, y, themeKey: key, colors, symbols, count, power: 1.3 }))
    }

    const onCelebrate = (event) => {
      if (!settings.celebrate) return
      const { x = window.innerWidth / 2, y = window.innerHeight * 0.65 } = event.detail || {}
      spawn(buildCelebration({ x, y, themeKey: key, colors, symbols }))
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener(FX_BURST_EVENT, onBurst)
    window.addEventListener(FX_CELEBRATE_EVENT, onCelebrate)
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener(FX_BURST_EVENT, onBurst)
      window.removeEventListener(FX_CELEBRATE_EVENT, onCelebrate)
    }
  }, [key, theme, settings.trail, settings.sparkles, settings.celebrate])

  return (
    <>
      <FxGlobalStyles />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: CANVAS_Z_INDEX }}
      />
    </>
  )
}

export default ThemeFxProvider
