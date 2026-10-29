// Pure graph model: builds nodes / edges from board data and answers structural questions.
// Nothing in this file mutates its inputs or touches the DOM.
import { extractWikiLinks } from '~/utils/wikiLinks'
import {
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  normalizeCrStatus,
  parseAssigneeList
} from '~/utils/excelExporter'
import { normalizePriority } from '~/utils/crMeta'
import { LINK_KINDS } from './graphConstants'

export { parseQuery, matchNode, applyQuery, getQuerySuggestions } from './graphQuery'

const MIN_PLAUSIBLE_TIMESTAMP = Date.UTC(2000, 0, 1)
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i
const OBJECT_ID_TIME_HEX_LENGTH = 8
const HUB_COUNT = 3
const HUB_EXCLUDED_TYPES = ['sprint', 'topic']
const DERIVED_TYPES = ['member', 'frd', 'tag']

const normKey = (value) => String(value || '').trim().toLowerCase()
const slugify = (value) => normKey(value).replace(/\s+/g, '-')

export const edgePairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)

// Accepts epoch ms / ISO strings, falls back to the timestamp embedded in a Mongo ObjectId
export const getCreatedTimestamp = (entity) => {
  if (!entity) return null
  const raw = entity.createdAt
  if (raw !== undefined && raw !== null && raw !== '') {
    const ms = typeof raw === 'number' ? raw : new Date(raw).getTime()
    if (Number.isFinite(ms) && ms > MIN_PLAUSIBLE_TIMESTAMP) return ms
  }
  const id = String(entity._id || '')
  if (OBJECT_ID_PATTERN.test(id)) {
    const ms = parseInt(id.slice(0, OBJECT_ID_TIME_HEX_LENGTH), 16) * 1000
    if (ms > MIN_PLAUSIBLE_TIMESTAMP) return ms
  }
  return null
}

// Indexes a node / edge list: adjacency, backlinks, degree and orphans. Invalid edges are dropped.
export const createGraph = (nodes = [], edges = []) => {
  const byId = new Map(nodes.map(n => [n.id, n]))
  const validEdges = edges.filter(e => byId.has(e.source) && byId.has(e.target) && e.source !== e.target)
  const adjacency = new Map(nodes.map(n => [n.id, new Set()]))
  const outLinks = new Map(nodes.map(n => [n.id, []]))
  const inLinks = new Map(nodes.map(n => [n.id, []]))

  validEdges.forEach(e => {
    adjacency.get(e.source).add(e.target)
    adjacency.get(e.target).add(e.source)
    if (LINK_KINDS.includes(e.kind)) {
      outLinks.get(e.source).push(e.target)
      inLinks.get(e.target).push(e.source)
    }
  })

  const degree = new Map(nodes.map(n => [n.id, adjacency.get(n.id).size]))
  const orphans = new Set(nodes
    .filter(n => (n.type === 'cr' || n.type === 'wiki') &&
      outLinks.get(n.id).length === 0 && inLinks.get(n.id).length === 0)
    .map(n => n.id))

  return { nodes, edges: validEdges, byId, adjacency, outLinks, inLinks, degree, orphans }
}

const createCrNode = ({ card, column, index, now }) => {
  const code = String(card.crCode || `CR-${index}`).trim()
  const deadline = getDeadlineStatus(card, now)
  return {
    id: `cr-${card._id}`,
    type: 'cr',
    label: code.toUpperCase(),
    subLabel: card.title || '',
    cardId: card._id,
    columnId: column._id,
    topicId: `topic-${column._id}`,
    columnTitle: column.title || '',
    status: normalizeCrStatus(card.baStatus),
    priority: normalizePriority(card.priority),
    progress: getCardDevProgress(card),
    resource: getCardResourceUsed(card),
    assignees: parseAssigneeList(card.assignee),
    deadlineCode: deadline.code,
    dueLabel: deadline.label,
    createdAt: getCreatedTimestamp(card),
    card
  }
}

const createWikiNode = (page) => ({
  id: `wiki-${page._id}`,
  type: 'wiki',
  label: String(page.title || 'Untitled'),
  subLabel: 'Knowledge Hub',
  pageId: page._id,
  icon: page.icon || '',
  tags: (Array.isArray(page.tags) ? page.tags : []).map(t => String(t).trim()).filter(Boolean),
  createdAt: getCreatedTimestamp(page),
  page
})

// Sprint → Topic → CR → (Handle by | FRD) skeleton
const addStructure = ({ boardId, columns, sprintConfig, now }, addNode, addEdge) => {
  const sprintId = `sprint-${boardId || 'root'}`
  const range = [sprintConfig.startDate, sprintConfig.endDate].filter(Boolean).join(' – ')
  addNode({ id: sprintId, type: 'sprint', label: sprintConfig.name || 'Sprint', subLabel: range, createdAt: null })

  let crIndex = 0
  columns.forEach(column => {
    const topicId = `topic-${column._id}`
    addNode({
      id: topicId,
      type: 'topic',
      label: column.title || 'Topic',
      subLabel: 'Topic',
      columnId: column._id,
      createdAt: getCreatedTimestamp(column)
    })
    addEdge(sprintId, topicId, 'topic')

    ;(column.cards || []).filter(c => c && !c.FE_PlaceholderCard).forEach(card => {
      crIndex += 1
      const node = createCrNode({ card, column, index: crIndex, now })
      addNode(node)
      addEdge(topicId, node.id, 'contains')
      addCrAttachments(node, addNode, addEdge)
    })
  })
}

const addCrAttachments = (crNode, addNode, addEdge) => {
  crNode.assignees.forEach(person => {
    const memberId = `member-${slugify(person)}`
    addNode({ id: memberId, type: 'member', label: person, subLabel: 'Handle by', createdAt: null })
    addEdge(crNode.id, memberId, 'assigned')
  })
  ;(crNode.card.frdDocuments || []).forEach((doc, idx) => {
    if (!doc) return
    const frdId = `frd-${doc.id || `${crNode.cardId}-${idx}`}`
    addNode({ id: frdId, type: 'frd', label: String(doc.name || 'FRD'), subLabel: 'FRD', createdAt: null })
    addEdge(crNode.id, frdId, 'frd')
  })
}

const addWikiNodes = (wikiPages, addNode, addEdge) => {
  wikiPages.filter(p => p && p._id).forEach(page => {
    const node = createWikiNode(page)
    addNode(node)
    node.tags.forEach(tag => {
      const tagId = `tag-${slugify(tag)}`
      addNode({ id: tagId, type: 'tag', label: `#${tag}`, subLabel: 'Tag', tagKey: normKey(tag), createdAt: null })
      addEdge(node.id, tagId, 'tagged')
    })
  })
}

// [[BNPL-945]] resolves to a CR (Ticket ID) first, then to a Knowledge Hub page title
const createResolver = (nodes) => {
  const byCode = new Map()
  const byTitle = new Map()
  nodes.forEach(n => {
    if (n.type === 'cr') byCode.set(normKey(n.label), n.id)
    if (n.type === 'wiki') byTitle.set(normKey(n.label), n.id)
  })
  return (target) => byCode.get(normKey(target)) || byTitle.get(normKey(target)) || null
}

const addKnowledgeLinks = (nodes, addEdge) => {
  const resolve = createResolver(nodes)
  const crIds = new Set(nodes.filter(n => n.type === 'cr').map(n => n.id))
  const linkText = (sourceId, text) => extractWikiLinks(text).forEach(target => {
    const targetId = resolve(target)
    if (targetId) addEdge(sourceId, targetId, 'wikilink')
  })

  nodes.forEach(n => {
    if (n.type === 'cr') {
      const ids = n.card.linkedCardIds || []
      ids.forEach(id => crIds.has(`cr-${id}`) && addEdge(n.id, `cr-${id}`, 'wikilink'))
      linkText(n.id, n.card.description)
      linkText(n.id, n.card.note)
    }
    if (n.type === 'wiki') {
      const ids = n.page.linkedCardIds || []
      ids.forEach(id => crIds.has(`cr-${id}`) && addEdge(n.id, `cr-${id}`, 'wikilink'))
      linkText(n.id, n.page.content)
    }
  })
}

// Sprint → Topic → CR → Handle by / FRD, CR ↔ CR via linkedCardIds & [[code]], Knowledge Hub ↔ CR / page
export const buildGraph = ({ boardId, columns = [], wikiPages = [], sprintConfig = {}, now = Date.now() } = {}) => {
  const nodeMap = new Map()
  const edgeMap = new Map()
  const addNode = (node) => { if (!nodeMap.has(node.id)) nodeMap.set(node.id, node) }
  const addEdge = (source, target, kind) => {
    if (source === target) return
    const id = `${source}|${target}|${kind}`
    if (!edgeMap.has(id)) edgeMap.set(id, { id, source, target, kind })
  }

  addStructure({ boardId, columns: columns || [], sprintConfig: sprintConfig || {}, now }, addNode, addEdge)
  addWikiNodes(wikiPages || [], addNode, addEdge)
  addKnowledgeLinks(Array.from(nodeMap.values()), addEdge)
  return createGraph(Array.from(nodeMap.values()), Array.from(edgeMap.values()))
}

// Hides node types the user switched off. Hidden Topics re-attach their CRs to the Sprint root.
export const applyVisibility = (graph, { filters = {}, orphans = true } = {}) => {
  const sprint = graph.nodes.find(n => n.type === 'sprint')
  const isShown = (n) => n.type === 'sprint' || filters[n.type] !== false
  const kept = new Set(graph.nodes.filter(isShown).map(n => n.id))

  const rerouted = new Map()
  graph.edges.forEach(e => {
    const topicHidden = sprint && e.kind === 'contains' && !kept.has(e.source)
    const edge = topicHidden ? { ...e, source: sprint.id, id: `${sprint.id}|${e.target}|contains` } : e
    if (kept.has(edge.source) && kept.has(edge.target)) rerouted.set(edge.id, edge)
  })

  const withEdges = createGraph(graph.nodes.filter(isShown), Array.from(rerouted.values()))
  const pruned = withEdges.nodes.filter(n => !DERIVED_TYPES.includes(n.type) || withEdges.degree.get(n.id) > 0)
  const base = pruned.length === withEdges.nodes.length ? withEdges : createGraph(pruned, withEdges.edges)
  if (orphans) return base
  return createGraph(base.nodes.filter(n => !base.orphans.has(n.id)), base.edges)
}

// Breadth-first ball around the centre (undirected). An unknown centre yields an empty graph.
export const localSubgraph = (graph, centerId, depth = 1) => {
  if (!graph.byId.has(centerId)) return createGraph([], [])
  const maxDepth = Math.max(0, Math.floor(depth))
  const seen = new Map([[centerId, 0]])
  let frontier = [centerId]
  for (let level = 1; level <= maxDepth && frontier.length; level++) {
    const next = []
    frontier.forEach(id => graph.adjacency.get(id).forEach(nid => {
      if (!seen.has(nid)) {
        seen.set(nid, level)
        next.push(nid)
      }
    }))
    frontier = next
  }
  const nodes = graph.nodes.filter(n => seen.has(n.id))
  return createGraph(nodes, graph.edges.filter(e => seen.has(e.source) && seen.has(e.target)))
}

// Shortest hop path between two nodes (undirected) or null when they are disconnected
export const shortestPath = (graph, fromId, toId) => {
  if (!graph.byId.has(fromId) || !graph.byId.has(toId)) return null
  if (fromId === toId) return [fromId]
  const parent = new Map([[fromId, null]])
  const queue = [fromId]
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]
    for (const nid of graph.adjacency.get(current)) {
      if (parent.has(nid)) continue
      parent.set(nid, current)
      if (nid === toId) return unwindPath(parent, toId)
      queue.push(nid)
    }
  }
  return null
}

const unwindPath = (parent, endId) => {
  const path = []
  for (let id = endId; id !== null; id = parent.get(id)) path.push(id)
  return path.reverse()
}

export const pathEdgeKeys = (path) => {
  const keys = new Set()
  for (let i = 0; i < (path || []).length - 1; i++) keys.add(edgePairKey(path[i], path[i + 1]))
  return keys
}

export const computeInsights = (graph) => {
  const crNodes = graph.nodes.filter(n => n.type === 'cr')
  const orphanCrs = crNodes.filter(n => graph.orphans.has(n.id))
  const hubs = graph.nodes
    .filter(n => !HUB_EXCLUDED_TYPES.includes(n.type))
    .map(n => ({ id: n.id, label: n.label, type: n.type, degree: graph.degree.get(n.id) || 0 }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, HUB_COUNT)
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    crCount: crNodes.length,
    orphanCrIds: orphanCrs.map(n => n.id),
    hubs,
    isolatedOverdueIds: orphanCrs.filter(n => n.deadlineCode === 'overdue').map(n => n.id)
  }
}

export const memberWorkload = (graph, memberId) => {
  const crs = graph.nodes.filter(n => n.type === 'cr' && graph.adjacency.get(n.id)?.has(memberId))
  const points = crs.reduce((sum, n) => sum + (Number(n.resource) || 0), 0)
  return { crs, points: Number(points.toFixed(2)) }
}

export const topicProgress = (graph, topicId) => {
  const crs = graph.nodes.filter(n => n.type === 'cr' && n.topicId === topicId)
  if (!crs.length) return { average: 0, count: 0 }
  const total = crs.reduce((sum, n) => sum + n.progress, 0)
  return { average: total / crs.length, count: crs.length }
}

// Sorted distinct creation timestamps (CR + Knowledge Hub pages) that drive the Time-lapse slider
export const getTimeline = (graph) => {
  const stamps = graph.nodes
    .filter(n => (n.type === 'cr' || n.type === 'wiki') && Number.isFinite(n.createdAt))
    .map(n => n.createdAt)
  return Array.from(new Set(stamps)).sort((a, b) => a - b)
}

// Keeps nodes that existed at `timestamp`; Handle by / FRD / Tag nodes appear with their first neighbour
export const filterByTime = (graph, timestamp) => {
  const existed = (n) => !Number.isFinite(n.createdAt) || n.createdAt <= timestamp
  const alive = createGraph(graph.nodes.filter(existed), graph.edges)
  const pruned = alive.nodes.filter(n => !DERIVED_TYPES.includes(n.type) || alive.degree.get(n.id) > 0)
  return pruned.length === alive.nodes.length ? alive : createGraph(pruned, alive.edges)
}
