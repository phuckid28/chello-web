import { flushSync } from 'react-dom'
import { getFxSettings, isMotionReduced } from '~/fx/fxSettings'

const REVEAL_DURATION_MS = 700
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Radius that reaches the farthest viewport corner from (x, y)
export const getRevealRadius = (x, y, width, height) => Math.hypot(Math.max(x, width - x), Math.max(y, height - y))

const getOrigin = (event) => {
  const hasPoint = event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)
  return hasPoint ? { x: event.clientX, y: event.clientY } : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

// Applies a visual change (e.g. switching theme) with a circular reveal from the click point.
// Falls back to an instant change when View Transitions are unsupported or motion is reduced.
export const runWithReveal = (event, applyChange) => {
  const canAnimate = typeof document.startViewTransition === 'function' &&
    getFxSettings().transitions &&
    !isMotionReduced()
  if (!canAnimate) {
    applyChange()
    return
  }

  const { x, y } = getOrigin(event)
  const radius = getRevealRadius(x, y, window.innerWidth, window.innerHeight)
  const transition = document.startViewTransition(() => flushSync(applyChange))
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_DURATION_MS, easing: REVEAL_EASING, pseudoElement: '::view-transition-new(root)' }
      )
    })
    .catch(() => {
      // Transition was skipped (e.g. tab hidden) — the change itself is already applied
    })
}
