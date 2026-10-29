import { describe, it, expect } from 'vitest'
import { buildSprintReport } from '~/utils/sprintReport'
import { suggestSubtasksLocally } from '~/utils/crAssistant'
import { normalizePriority, getPriorityOption } from '~/utils/crMeta'
import { getSavedTeamRoster, DEFAULT_TEAM_ROSTER } from '~/utils/excelExporter'

const NOW = new Date('2026-10-29T10:00:00').getTime()

const board = {
  sprintConfig: { name: 'Sprint 34', startDate: '22/10/2026', endDate: '05/11/2026', updatedBy: 'Dao Thanh Phuc' },
  columns: [
    {
      title: 'Usage Limit',
      cards: [
        { _id: '1', crCode: 'BNPL-945', title: 'Monthly sync', baStatus: 'Ready for deploy', assignee: 'Ho Thao Dieu', deadline: '05/11/2026' },
        { _id: '2', crCode: 'BNPL-946', title: 'Scoring', baStatus: 'Blocking', assignee: '', deadline: '20/10/2026' }
      ]
    }
  ]
}

describe('buildSprintReport', () => {
  it('builds a status report with summary, risks and status groups', () => {
    const md = buildSprintReport({ board, mode: 'status', lang: 'en', now: NOW })
    expect(md).toContain('## Status report • Sprint 34 (22/10/2026 – 05/11/2026)')
    expect(md).toContain('Total CRs: **2**')
    expect(md).toContain('Blocking: **1**')
    expect(md).toContain('**BNPL-946** Scoring')
    expect(md).toContain('⚠️')
  })

  it('groups stand-up reports by owner with an unassigned bucket', () => {
    const md = buildSprintReport({ board, mode: 'standup', lang: 'vi', now: NOW })
    expect(md).toContain('#### Ho Thao Dieu')
    expect(md).toContain('#### Chưa phân công')
  })

  it('falls back to English for unknown languages', () => {
    expect(buildSprintReport({ board, lang: 'xx', now: NOW })).toContain('Status report')
  })
})

describe('suggestSubtasksLocally', () => {
  it('adds contextual suggestions before the base BA lifecycle', () => {
    const list = suggestSubtasksLocally({ title: 'Usage Limit API for BNPL payment' }, { lang: 'en' })
    const keys = list.map(s => s.key)
    expect(keys.slice(0, 3)).toEqual(['api-contract', 'limit-boundary', 'payment-recon'])
    expect(keys).toContain('frd')
  })

  it('skips suggestions already present in the checklist', () => {
    const list = suggestSubtasksLocally({
      title: 'Simple CR',
      checklist: [{ title: 'Prepare UAT test cases & test data' }]
    }, { lang: 'en' })
    expect(list.map(s => s.key)).not.toContain('uat')
  })
})

describe('priority helpers', () => {
  it('normalizes Jira / Vietnamese aliases', () => {
    expect(normalizePriority('P0')).toBe('highest')
    expect(normalizePriority('Cao')).toBe('high')
    expect(normalizePriority('Thấp')).toBe('low')
    expect(normalizePriority('')).toBe('medium')
  })

  it('falls back to medium for unknown values', () => {
    expect(getPriorityOption('weird').value).toBe('medium')
  })
})

describe('getSavedTeamRoster', () => {
  it('uses the board roster as source of truth so removed members stay removed', () => {
    const roster = getSavedTeamRoster({ sprintConfig: { teamRoster: ['A', { name: 'B', resourcePoint: 1 }, 'A'] } })
    expect(roster).toEqual(['A', 'B'])
  })

  it('falls back to the default team when nothing is saved', () => {
    expect(getSavedTeamRoster({})).toEqual(DEFAULT_TEAM_ROSTER)
  })
})
