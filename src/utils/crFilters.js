// Jira-style quick filters shared by every board view (Kanban, Sprint Matrix, Timeline, Graph)
import { getDeadlineStatus, normalizeCrStatus, parseAssigneeList } from '~/utils/excelExporter'
import { normalizePriority } from '~/utils/crMeta'

export const DEADLINE_FILTERS = ['all', 'overdue', 'due-soon', 'at-risk', 'none']

export const EMPTY_CR_FILTERS = Object.freeze({
  text: '',
  assignees: [],
  statuses: [],
  priorities: [],
  deadline: 'all'
})

export const normalizeFilters = (filters) => ({
  text: typeof filters?.text === 'string' ? filters.text : '',
  assignees: Array.isArray(filters?.assignees) ? filters.assignees : [],
  statuses: Array.isArray(filters?.statuses) ? filters.statuses : [],
  priorities: Array.isArray(filters?.priorities) ? filters.priorities : [],
  deadline: DEADLINE_FILTERS.includes(filters?.deadline) ? filters.deadline : 'all'
})

export const countActiveFilters = (filters) => {
  const f = normalizeFilters(filters)
  return (f.text.trim() ? 1 : 0) +
    (f.assignees.length ? 1 : 0) +
    (f.statuses.length ? 1 : 0) +
    (f.priorities.length ? 1 : 0) +
    (f.deadline !== 'all' ? 1 : 0)
}

const matchesText = (card, rawText) => {
  const q = rawText.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    card.title,
    card.crCode,
    card.assignee,
    card.sprint,
    card.note,
    ...(card.labels || []).flatMap(l => [l.id, l.title])
  ]
  return haystack.some(v => String(v || '').toLowerCase().includes(q))
}

const matchesDeadline = (card, deadlineFilter, now) => {
  if (deadlineFilter === 'all') return true
  const { code } = getDeadlineStatus(card, now)
  if (deadlineFilter === 'at-risk') return code === 'overdue' || code === 'due-soon'
  return code === deadlineFilter
}

export const cardMatchesFilters = (card, filters, now = Date.now()) => {
  if (!card || card.FE_PlaceholderCard) return true
  const f = normalizeFilters(filters)

  if (!matchesText(card, f.text)) return false

  if (f.assignees.length) {
    const handlers = parseAssigneeList(card.assignee)
    const wantsUnassigned = f.assignees.includes('__unassigned__')
    const hit = handlers.some(h => f.assignees.includes(h)) || (wantsUnassigned && handlers.length === 0)
    if (!hit) return false
  }

  if (f.statuses.length && !f.statuses.includes(normalizeCrStatus(card.baStatus))) return false
  if (f.priorities.length && !f.priorities.includes(normalizePriority(card.priority))) return false

  return matchesDeadline(card, f.deadline, now)
}

// Returns new column objects (never mutates the input) keeping placeholder cards for empty columns
export const applyFiltersToColumns = (columns, filters, now = Date.now()) => {
  if (!Array.isArray(columns)) return []
  if (countActiveFilters(filters) === 0) return columns
  return columns.map(col => ({
    ...col,
    cards: (col.cards || []).filter(card => cardMatchesFilters(card, filters, now))
  }))
}
