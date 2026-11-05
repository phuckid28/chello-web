import { describe, expect, it } from 'vitest'
import {
  CHELLA_CATEGORICAL_PALETTE,
  buildSprintDatasetSources,
  validateDatavizPalette
} from '../datavizPalette'

describe('datavizPalette — Baoyu Dataviz OKLab/CVD Validator & Traceable KPI Lineage', () => {
  it('validates Chella light and dark categorical palettes against OKLab CVD (>= 8.0) and normal-vision (>= 15.0) gates', () => {
    const lightResult = validateDatavizPalette(CHELLA_CATEGORICAL_PALETTE.light, { mode: 'light' })
    expect(lightResult.ok).toBe(true)
    expect(lightResult.worstCvdDeltaE).toBeGreaterThanOrEqual(8.0)
    expect(lightResult.worstNormalDeltaE).toBeGreaterThanOrEqual(15.0)

    const darkResult = validateDatavizPalette(CHELLA_CATEGORICAL_PALETTE.dark, { mode: 'dark' })
    expect(darkResult.ok).toBe(true)
    expect(darkResult.worstCvdDeltaE).toBeGreaterThanOrEqual(8.0)
    expect(darkResult.worstNormalDeltaE).toBeGreaterThanOrEqual(15.0)
  })

  it('rejects a palette with indistinguishable adjacent hues under deuteranopia/normal vision', () => {
    const badPalette = ['#2563eb', '#2765ec', '#1baf7a']
    const res = validateDatavizPalette(badPalette, { mode: 'dark' })
    expect(res.ok).toBe(false)
    expect(res.worstNormalDeltaE).toBeLessThan(15.0)
  })

  it('builds traceable dataset sources and KPI row lineage for Sprint Analytics (claude-dashboard pattern)', () => {
    const columns = [
      {
        _id: 'col-1',
        title: 'BNPL Core',
        cards: [
          {
            _id: 'c1',
            crCode: 'BNPL-945',
            title: 'Usage Limit Sync',
            baStatus: 'In testing',
            assignee: 'Ho Thao Dieu',
            devProgress: 0.8,
            resourceUsed: 1.5,
            deadline: '2020-01-01',
            frdDocuments: [{ id: 'f1', name: 'FRD.md' }],
            checklist: [{ id: 'k1', title: 'Task 1', isCompleted: true }],
            description: 'FR-001: Sync usage limit.'
          },
          {
            _id: 'c2',
            crCode: 'BNPL-946',
            title: 'Settlement Batch',
            baStatus: 'Deployed',
            assignee: 'Ho Thao Dieu, Nguyen Phuoc Long',
            devProgress: 1,
            resourceUsed: 2,
            frdDocuments: [{ id: 'f2', name: 'FRD2.md' }],
            checklist: [{ id: 'k2', title: 'Task 2', isCompleted: true }],
            description: 'FR-001: Settle batch.'
          }
        ]
      }
    ]
    const board = {
      _id: 'b1',
      sprintConfig: {
        name: 'Sprint 34',
        sprintNumber: '34',
        teamRoster: ['Ho Thao Dieu', 'Nguyen Phuoc Long']
      },
      columns
    }

    const lineage = buildSprintDatasetSources(board, columns)
    expect(lineage.datasets['datasets/sprint_crs'].rows).toHaveLength(2)
    expect(lineage.kpiById['total_crs'].value).toBe(2)
    expect(lineage.kpiById['total_crs'].rows).toHaveLength(2)
    expect(lineage.kpiById['total_resource_points'].value).toBe(3.5)
    expect(lineage.kpiById['status:Deployed'].rows.map(r => r.crCode)).toEqual(['BNPL-946'])
    expect(lineage.kpiById['member:Ho Thao Dieu'].rows.map(r => r.crCode)).toEqual(['BNPL-945', 'BNPL-946'])
  })
})
