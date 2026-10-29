// Obsidian-style graph query language:
//   type:cr status:"In testing" assignee:phuc tag:x priority:high overdue:true orphan:true -term
// Pure helpers: parsing, matching and auto-complete suggestions.
import { BA_STATUS_OPTIONS } from '~/utils/excelExporter'
import { PRIORITY_OPTIONS } from '~/utils/crMeta'
import { NODE_TYPES, QUERY_KEYS } from './graphConstants'

const TOKEN_PATTERN = /(-?)(?:([a-z]+):(?:"([^"]*)"|(\S*))|"([^"]*)"|(\S+))/gi
const TYPE_ALIASES = { person: 'member', people: 'member', page: 'wiki', doc: 'wiki', ticket: 'cr' }
const TRUTHY = new Set(['true', 'yes', '1', 'y'])
const MAX_SUGGESTIONS = 8
const MAX_NODE_SUGGESTIONS = 3

const lower = (value) => String(value || '').trim().toLowerCase()
const stripHash = (value) => lower(value).replace(/^#/, '')

export const parseQuery = (input) => {
  const terms = []
  const filters = []
  for (const match of String(input || '').matchAll(TOKEN_PATTERN)) {
    const [, minus, key, quotedValue, bareValue, quotedTerm, bareTerm] = match
    const negate = minus === '-'
    const isFilter = key && QUERY_KEYS.includes(key.toLowerCase())
    if (isFilter) {
      filters.push({ key: key.toLowerCase(), value: lower(quotedValue ?? bareValue), negate })
      continue
    }
    const text = lower(key ? `${key}:${quotedValue ?? bareValue ?? ''}` : (quotedTerm ?? bareTerm))
    if (text && text !== '-') terms.push({ text, negate })
  }
  return { terms, filters }
}

export const isEmptyQuery = (parsed) => !parsed || (!parsed.terms.length && !parsed.filters.length)

const matchFilter = (node, { key, value }, graph) => {
  switch (key) {
  case 'type': return node.type === (TYPE_ALIASES[value] || value)
  case 'status': return node.type === 'cr' && lower(node.status).includes(value)
  case 'priority': return node.type === 'cr' && node.priority === value
  case 'assignee':
    return node.type === 'member'
      ? lower(node.label).includes(value)
      : (node.assignees || []).some(a => lower(a).includes(value))
  case 'tag':
    return node.type === 'tag'
      ? stripHash(node.label).includes(stripHash(value))
      : (node.tags || []).some(t => stripHash(t).includes(stripHash(value)))
  case 'overdue': return (node.type === 'cr' && node.deadlineCode === 'overdue') === TRUTHY.has(value)
  case 'orphan': return Boolean(graph?.orphans?.has(node.id)) === TRUTHY.has(value)
  case 'topic':
    return node.type === 'topic'
      ? lower(node.label).includes(value)
      : lower(node.columnTitle).includes(value)
  default: return false
  }
}

const matchTerm = (node, term) => {
  const haystack = `${node.label} ${node.subLabel || ''} ${node.columnTitle || ''}`.toLowerCase()
  return haystack.includes(term)
}

export const matchNode = (node, parsed, graph) => {
  const filtersOk = parsed.filters.every(f => matchFilter(node, f, graph) !== f.negate)
  return filtersOk && parsed.terms.every(t => matchTerm(node, t.text) !== t.negate)
}

// Returns the Set of matching node ids, or null when the query is empty (nothing to dim)
export const applyQuery = (graph, parsed) => {
  if (isEmptyQuery(parsed)) return null
  return new Set(graph.nodes.filter(n => matchNode(n, parsed, graph)).map(n => n.id))
}

const quoteIfNeeded = (value) => (/\s/.test(value) ? `"${value}"` : value)

// Start index of the token being typed (spaces inside an open quote do not split it)
const lastTokenStart = (input) => {
  let inQuote = false
  let start = 0
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '"') inQuote = !inQuote
    else if (input[i] === ' ' && !inQuote) start = i + 1
  }
  return start
}

const collectValues = (graph, key) => {
  const labelsOf = (type) => graph.nodes.filter(n => n.type === type).map(n => n.label)
  switch (key) {
  case 'type': return NODE_TYPES
  case 'status': return BA_STATUS_OPTIONS.map(o => o.value)
  case 'priority': return PRIORITY_OPTIONS.map(o => o.value)
  case 'assignee': return labelsOf('member')
  case 'tag': return labelsOf('tag').map(l => l.replace(/^#/, ''))
  case 'topic': return labelsOf('topic')
  case 'overdue':
  case 'orphan': return ['true', 'false']
  default: return []
  }
}

export const getQuerySuggestions = (graph, input, limit = MAX_SUGGESTIONS) => {
  const text = String(input || '')
  const start = lastTokenStart(text)
  const head = text.slice(0, start)
  const token = text.slice(start)
  const negation = token.startsWith('-') ? '-' : ''
  const body = token.slice(negation.length)
  const colon = body.indexOf(':')

  if (colon > 0 && QUERY_KEYS.includes(body.slice(0, colon).toLowerCase())) {
    const key = body.slice(0, colon).toLowerCase()
    const partial = lower(body.slice(colon + 1).replace(/"/g, ''))
    return collectValues(graph, key)
      .filter(v => lower(v).includes(partial) && lower(v) !== partial)
      .slice(0, limit)
      .map(v => ({ kind: 'value', label: v, insert: `${head}${negation}${key}:${quoteIfNeeded(v)} ` }))
  }

  const partial = lower(body)
  const keySuggestions = QUERY_KEYS
    .filter(k => k.startsWith(partial))
    .map(k => ({ kind: 'key', label: `${k}:`, insert: `${head}${negation}${k}:` }))
  const nodeSuggestions = partial.length < 2 ? [] : graph.nodes
    .filter(n => lower(n.label).includes(partial))
    .slice(0, MAX_NODE_SUGGESTIONS)
    .map(n => ({ kind: 'node', label: n.label, insert: `${head}${negation}${quoteIfNeeded(n.label)} ` }))
  return [...keySuggestions, ...nodeSuggestions].slice(0, limit)
}
