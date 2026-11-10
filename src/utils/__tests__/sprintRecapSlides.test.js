import { describe, it, expect } from 'vitest'
import { buildSprintRecapDeck, renderSprintRecapHtml } from '../sprintRecapSlides'

describe('Sprint Wrapped / Recap Slide Deck Builder (claude-slides & motion-director)', () => {
  const sampleBoard = {
    _id: 'b1',
    title: 'Sprint 34 • BNPL Core',
    sprintConfig: {
      name: 'Sprint 34',
      sprintNumber: '34',
      startDate: '2026-10-15',
      endDate: '2026-10-30'
    },
    columns: [
      {
        _id: 'col-1',
        title: 'Usage Limit',
        cards: [
          {
            _id: 'c1',
            crCode: 'BNPL-945',
            title: 'Usage Limit Monthly Sync',
            baStatus: 'Deployed',
            assignee: 'Ho Thao Dieu, Hoang Vinh Son',
            devProgress: 1,
            resourceUsed: 5,
            description: '## Business Rules\n- BR-01\n```mermaid\nsequenceDiagram\n```\n- [x] UAT passed',
            frdDocuments: [{ id: 'f1', name: 'FRD_945.md' }],
            linkedCardIds: ['c2']
          },
          {
            _id: 'c2',
            crCode: 'BNPL-946',
            title: 'Real-time Credit Scoring eKYC',
            baStatus: 'In testing',
            assignee: 'Ho Thao Dieu',
            devProgress: 0.75,
            resourceUsed: 8,
            description: '## Overview\nCredit scoring flow'
          }
        ]
      }
    ]
  }

  it('builds a 4-scene presentation deck with accurate telemetry metrics', () => {
    const deck = buildSprintRecapDeck(sampleBoard)
    expect(deck.slides).toHaveLength(4)
    expect(deck.slides.map((s) => s.id)).toEqual(['hero', 'velocity', 'speckit', 'spotlight'])
    expect(deck.metrics.totalCrs).toBe(2)
    expect(deck.metrics.totalPoints).toBe(13)
    expect(deck.metrics.avgProgressPercent).toBe(90)
    expect(deck.metrics.topContributors[0].name).toBe('Ho Thao Dieu')
  })

  it('renders a standalone interactive HTML presentation document', () => {
    const deck = buildSprintRecapDeck(sampleBoard)
    const html = renderSprintRecapHtml(deck, { accentColor: '#38bdf8', name: 'Sora Sky' })
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Sprint 34')
    expect(html).toContain('BNPL-945')
  })
})
