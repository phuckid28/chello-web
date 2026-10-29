import { describe, expect, it } from 'vitest'
import {
  applyQuery,
  applyVisibility,
  buildGraph,
  computeInsights,
  filterByTime,
  getQuerySuggestions,
  getTimeline,
  localSubgraph,
  matchNode,
  memberWorkload,
  parseQuery,
  shortestPath,
  topicProgress
} from '../graphModel'
import { sanitizePins, sanitizeSettings } from '../graphSettings'

const NOW = new Date('2026-10-29T12:00:00Z').getTime()

const makeSampleGraph = () => {
  const columns = [
    {
      _id: 'col-1',
      title: 'BNPL Core',
      cards: [
        {
          _id: 'c1',
          crCode: 'BNPL-945',
          title: 'Usage Limit Monthly Sync',
          baStatus: 'In testing',
          priority: 'high',
          devProgress: 0.8,
          resourceUsed: 1.5,
          assignee: 'Ho Thao Dieu, Nguyen Phuoc Long',
          deadline: '2026-10-25',
          description: 'Depends on [[BNPL-946]] and [[Billing Spec]].',
          frdDocuments: [{ id: 'doc-1', name: 'FRD_BNPL_945.md' }],
          createdAt: new Date('2026-10-22T09:00:00Z').getTime()
        },
        {
          _id: 'c2',
          crCode: 'BNPL-946',
          title: 'Core Ledger Adjustment',
          baStatus: 'Processing',
          priority: 'medium',
          devProgress: 0.4,
          resourceUsed: 2,
          assignee: 'Ho Thao Dieu',
          deadline: '2026-11-04',
          linkedCardIds: ['c3'],
          createdAt: new Date('2026-10-24T09:00:00Z').getTime()
        }
      ]
    },
    {
      _id: 'col-2',
      title: 'Settlement',
      cards: [
        {
          _id: 'c3',
          crCode: 'SET-101',
          title: 'Merchant Reconciliation',
          baStatus: 'Deployed',
          priority: 'lowest',
          devProgress: 1,
          resourceUsed: 0.5,
          assignee: '',
          createdAt: new Date('2026-10-26T09:00:00Z').getTime()
        },
        {
          _id: 'c4',
          crCode: 'SET-102',
          title: 'Isolated Legacy Ticket',
          baStatus: 'Blocking',
          priority: 'highest',
          devProgress: 0.1,
          resourceUsed: 1,
          deadline: '2026-10-20',
          createdAt: new Date('2026-10-28T09:00:00Z').getTime()
        }
      ]
    }
  ]

  const wikiPages = [
    {
      _id: 'w1',
      title: 'Billing Spec',
      icon: '📘',
      tags: ['bnpl', 'architecture'],
      content: 'Covers [[BNPL-946]] rules.',
      createdAt: new Date('2026-10-23T09:00:00Z').getTime()
    }
  ]

  return buildGraph({
    boardId: 'b1',
    columns,
    wikiPages,
    sprintConfig: { name: 'Sprint 34', startDate: '22/10/2026', endDate: '05/11/2026' },
    now: NOW
  })
}

describe('KnowledgeGraph graphModel & query engine', () => {
  it('builds Sprint, Topic, CR, Member, FRD, Wiki and Tag nodes without mutating inputs', () => {
    const graph = makeSampleGraph()
    expect(graph.byId.get('sprint-b1')?.type).toBe('sprint')
    expect(graph.byId.get('topic-col-1')?.label).toBe('BNPL Core')
    expect(graph.byId.get('cr-c1')?.label).toBe('BNPL-945')
    expect(graph.byId.get('member-ho-thao-dieu')?.type).toBe('member')
    expect(graph.byId.get('frd-doc-1')?.type).toBe('frd')
    expect(graph.byId.get('wiki-w1')?.label).toBe('Billing Spec')
    expect(graph.byId.get('tag-bnpl')?.label).toBe('#bnpl')
  })

  it('indexes outgoing links, backlinks and orphan CRs from [[WikiLink]] and linkedCardIds', () => {
    const graph = makeSampleGraph()
    expect(graph.outLinks.get('cr-c1')).toEqual(expect.arrayContaining(['cr-c2', 'wiki-w1']))
    expect(graph.inLinks.get('cr-c2')).toEqual(expect.arrayContaining(['cr-c1', 'wiki-w1']))
    expect(graph.outLinks.get('cr-c2')).toContain('cr-c3')
    expect(graph.orphans.has('cr-c4')).toBe(true)
    expect(graph.orphans.has('cr-c1')).toBe(false)
  })

  it('reroutes CRs to the Sprint node when Topics are hidden and hides orphan CRs on demand', () => {
    const graph = makeSampleGraph()
    const noTopics = applyVisibility(graph, { filters: { topic: false }, orphans: true })
    expect(noTopics.byId.has('topic-col-1')).toBe(false)
    expect(noTopics.adjacency.get('sprint-b1')?.has('cr-c1')).toBe(true)

    const noOrphans = applyVisibility(graph, { filters: {}, orphans: false })
    expect(noOrphans.byId.has('cr-c4')).toBe(false)
    expect(noOrphans.byId.has('cr-c1')).toBe(true)
  })

  it('extracts a BFS local subgraph up to the requested depth', () => {
    const graph = makeSampleGraph()
    const d1 = localSubgraph(graph, 'wiki-w1', 1)
    expect(d1.byId.has('wiki-w1')).toBe(true)
    expect(d1.byId.has('cr-c1')).toBe(true)
    expect(d1.byId.has('cr-c2')).toBe(true)
    expect(d1.byId.has('cr-c4')).toBe(false)
  })

  it('finds the shortest path between two connected nodes and returns null when disconnected', () => {
    const graph = makeSampleGraph()
    const path = shortestPath(graph, 'wiki-w1', 'cr-c3')
    expect(path).toEqual(['wiki-w1', 'cr-c2', 'cr-c3'])
    const disconnected = localSubgraph(graph, 'wiki-w1', 0)
    expect(shortestPath(disconnected, 'wiki-w1', 'cr-c4')).toBeNull()
  })

  it('computes network insights including orphan CRs, isolated overdue CRs and top hubs', () => {
    const graph = makeSampleGraph()
    const insights = computeInsights(graph)
    expect(insights.crCount).toBe(4)
    expect(insights.orphanCrIds).toEqual(['cr-c4'])
    expect(insights.isolatedOverdueIds).toEqual(['cr-c4'])
    expect(insights.hubs.length).toBeGreaterThan(0)
  })

  it('calculates member workload and topic average progress', () => {
    const graph = makeSampleGraph()
    const workload = memberWorkload(graph, 'member-ho-thao-dieu')
    expect(workload.crs.map(c => c.id)).toEqual(['cr-c1', 'cr-c2'])
    expect(workload.points).toBe(3.5)

    const topic = topicProgress(graph, 'topic-col-1')
    expect(topic.count).toBe(2)
    expect(topic.average).toBeCloseTo(0.6, 5)
  })

  it('builds chronological timeline stamps and filters graph by time', () => {
    const graph = makeSampleGraph()
    const stamps = getTimeline(graph)
    expect(stamps).toHaveLength(5)
    const early = filterByTime(graph, stamps[1])
    expect(early.byId.has('cr-c1')).toBe(true)
    expect(early.byId.has('wiki-w1')).toBe(true)
    expect(early.byId.has('cr-c4')).toBe(false)
  })

  it('parses Obsidian-style queries with quoted filters, negations and free terms', () => {
    const parsed = parseQuery('type:cr status:"In testing" -assignee:long overdue:true limit')
    expect(parsed.filters).toEqual([
      { key: 'type', value: 'cr', negate: false },
      { key: 'status', value: 'in testing', negate: false },
      { key: 'assignee', value: 'long', negate: true },
      { key: 'overdue', value: 'true', negate: false }
    ])
    expect(parsed.terms).toEqual([{ text: 'limit', negate: false }])
  })

  it('matches nodes against complex queries and returns autocomplete suggestions', () => {
    const graph = makeSampleGraph()
    const matches = applyQuery(graph, parseQuery('type:cr overdue:true'))
    expect(Array.from(matches)).toEqual(['cr-c1', 'cr-c4'])

    const orphanOnly = applyQuery(graph, parseQuery('orphan:true'))
    expect(Array.from(orphanOnly)).toEqual(['cr-c4'])

    const notTesting = matchNode(graph.byId.get('cr-c1'), parseQuery('-status:"In testing"'), graph)
    expect(notTesting).toBe(false)

    const suggestions = getQuerySuggestions(graph, 'status:In')
    expect(suggestions.some(s => s.label === 'In testing')).toBe(true)
  })

  it('sanitizes persisted pins and settings safely against malformed input', () => {
    expect(sanitizePins(null)).toEqual({})
    expect(sanitizePins({ a: { x: 10, y: 20 }, bad: { x: 'nope', y: 1 } })).toEqual({ a: { x: 10, y: 20 } })
    const clean = sanitizeSettings({ forces: { repel: 99999 }, colors: { sprint: '#123456', hack: 'javascript:1' } })
    expect(clean.forces.repel).toBe(500)
    expect(clean.colors).toEqual({ sprint: '#123456' })
  })
})
