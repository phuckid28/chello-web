// Event helpers so any component can trigger global effects without importing the canvas engine.
export const FX_BURST_EVENT = 'chella-fx-burst'
export const FX_CELEBRATE_EVENT = 'chella-fx-celebrate'
export const OPEN_SHORTCUTS_EVENT = 'chella-open-shortcuts'

const centerOf = (element) => {
  if (!element || typeof element.getBoundingClientRect !== 'function') return {}
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

export const fxBurst = (target, count) => {
  window.dispatchEvent(new CustomEvent(FX_BURST_EVENT, { detail: { ...centerOf(target), count } }))
}

export const fxCelebrate = (target) => {
  window.dispatchEvent(new CustomEvent(FX_CELEBRATE_EVENT, { detail: centerOf(target) }))
}
