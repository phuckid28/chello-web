// Lightweight window events so global surfaces (Command Palette, shortcuts) can drive the board page.
// Requests are also persisted so they survive a route change (the board page may not be mounted yet).
export const OPEN_REPORT_EVENT = 'chella-open-sprint-report'
export const SWITCH_VIEW_EVENT = 'chella-switch-board-view'
export const VIEW_STORAGE_KEY = 'chella_board_view_mode'
const PENDING_REPORT_KEY = 'chella_pending_sprint_report'

export const BOARD_VIEWS = ['kanban', 'overview', 'timeline', 'graph']

const safeStorage = (fn) => {
  try {
    return fn()
  } catch (e) {
    // Storage disabled (private mode) — events still work for the mounted page
    return null
  }
}

export const requestSprintReport = () => {
  safeStorage(() => sessionStorage.setItem(PENDING_REPORT_KEY, '1'))
  window.dispatchEvent(new CustomEvent(OPEN_REPORT_EVENT))
}

export const consumePendingReport = () => safeStorage(() => {
  const pending = sessionStorage.getItem(PENDING_REPORT_KEY) === '1'
  sessionStorage.removeItem(PENDING_REPORT_KEY)
  return pending
}) || false

export const persistBoardView = (view) => {
  if (BOARD_VIEWS.includes(view)) safeStorage(() => localStorage.setItem(VIEW_STORAGE_KEY, view))
}

export const readBoardView = () => {
  const saved = safeStorage(() => localStorage.getItem(VIEW_STORAGE_KEY))
  return BOARD_VIEWS.includes(saved) ? saved : 'kanban'
}

export const requestBoardView = (view) => {
  if (!BOARD_VIEWS.includes(view)) return
  persistBoardView(view)
  window.dispatchEvent(new CustomEvent(SWITCH_VIEW_EVENT, { detail: view }))
}
