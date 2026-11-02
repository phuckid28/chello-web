// Lightweight event bus separating global command shortcuts (AppBar) from board-scoped handlers (Board / BoardBar).
// When the user triggers an action while outside a board, we stash a one-shot sessionStorage flag and navigate in —
// the board reads and clears the flag on mount.

export const SWITCH_VIEW_EVENT = 'chella:switch-board-view'
export const OPEN_REPORT_EVENT = 'chella:open-sprint-report'

export const BOARD_VIEWS = ['overview', 'kanban', 'timeline', 'graph']

const VIEW_STORAGE_KEY = 'chella_board_view_mode_v2'
const PENDING_REPORT_KEY = 'chella_pending_open_report'

const safeStorage = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const requestOpenSprintReport = () => {
  safeStorage(() => sessionStorage.setItem(PENDING_REPORT_KEY, '1'))
  window.dispatchEvent(new CustomEvent(OPEN_REPORT_EVENT))
}

export const requestSprintReport = requestOpenSprintReport

export const consumePendingReport = () => safeStorage(() => {
  const flag = sessionStorage.getItem(PENDING_REPORT_KEY) === '1'
  if (flag) sessionStorage.removeItem(PENDING_REPORT_KEY)
  return flag
}, false)

export const persistBoardView = (view) => {
  if (BOARD_VIEWS.includes(view)) safeStorage(() => localStorage.setItem(VIEW_STORAGE_KEY, view))
}

export const readBoardView = () => {
  const saved = safeStorage(() => localStorage.getItem(VIEW_STORAGE_KEY))
  return BOARD_VIEWS.includes(saved) ? saved : 'overview'
}

export const requestSwitchBoardView = (view) => {
  if (!BOARD_VIEWS.includes(view)) return
  persistBoardView(view)
  window.dispatchEvent(new CustomEvent(SWITCH_VIEW_EVENT, { detail: view }))
}

export const requestBoardView = requestSwitchBoardView
