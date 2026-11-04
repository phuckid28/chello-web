import { describe, it, expect } from 'vitest'
import {
  computeSpatialPan,
  midiToFreq,
  pickPentatonicMidi,
  getCursorColorForUser,
  extractSprintAgents,
  buildSprintSwarmBlueprint,
  createSwarmSimulation,
  stepSwarmSimulation
} from '../swarmEngine'

const SAMPLE_BOARD = {
  _id: 'b-sprint-34',
  title: 'Sprint 34 — Core Platform',
  sprintConfig: {
    name: 'Sprint 34',
    sprintNumber: '34',
    startDate: '2026-10-22',
    endDate: '2026-11-05'
  },
  FE_allUsers: [
    { _id: 'u1', displayName: 'Phuc Thanh', username: 'phuc' },
    { _id: 'u2', displayName: 'Sora Kasugano', username: 'sora' }
  ],
  columns: [
    {
      _id: 'col-1',
      title: 'Processing',
      cards: [
        {
          _id: 'card-1',
          crCode: 'BNPL-101',
          title: 'Xây dựng cổng thanh toán QR',
          assignee: 'Phuc Thanh, Minh BA',
          baStatus: 'Processing',
          priority: 'High',
          devProgress: 40
        },
        {
          _id: 'card-2',
          crCode: 'BNPL-102',
          title: 'Tích hợp đối soát tự động',
          assignee: 'Sora Kasugano',
          baStatus: 'In testing',
          priority: 'Highest',
          devProgress: 80
        }
      ]
    },
    {
      _id: 'col-2',
      title: 'Done testing',
      cards: [
        {
          _id: 'card-3',
          crCode: 'BNPL-103',
          title: 'Kiểm thử bảo mật WAF L7',
          assignee: 'Lan QA',
          baStatus: 'Done testing',
          priority: 'Medium',
          devProgress: 100
        }
      ]
    }
  ]
}

describe('swarmEngine — spatial audio & pentatonic pitch math', () => {
  it('computes stereo pan clamped between -0.8 and 0.8', () => {
    expect(computeSpatialPan(0, 1000)).toBeCloseTo(-0.8, 2)
    expect(computeSpatialPan(500, 1000)).toBeCloseTo(0, 2)
    expect(computeSpatialPan(1000, 1000)).toBeCloseTo(0.8, 2)
    expect(computeSpatialPan(-200, 1000)).toBe(-0.8)
    expect(computeSpatialPan(2000, 1000)).toBe(0.8)
  })

  it('converts MIDI note numbers to standard frequencies and maps left-to-right to ascending E Major Pentatonic notes', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 2)
    const leftMidi = pickPentatonicMidi({ x: 100, viewportWidth: 1200, columnIndex: 0, columnCount: 4 })
    const rightMidi = pickPentatonicMidi({ x: 1100, viewportWidth: 1200, columnIndex: 3, columnCount: 4 })
    expect(rightMidi).toBeGreaterThan(leftMidi)
    // E2 is MIDI 40; E Major Pentatonic offsets mod 12 are [0, 2, 4, 7, 9]
    const validOffsets = [0, 2, 4, 7, 9]
    expect(validOffsets).toContain((leftMidi - 40) % 12)
    expect(validOffsets).toContain((rightMidi - 40) % 12)
  })
})

describe('swarmEngine — agent roster & blueprint DAG generation', () => {
  it('assigns deterministic colors and extracts team + AI agents from board and assignees', () => {
    const colorA = getCursorColorForUser('phuc')
    const colorB = getCursorColorForUser('phuc')
    expect(colorA).toBe(colorB)
    expect(colorA).toMatch(/^#[0-9A-Fa-f]{6}$/)

    const agents = extractSprintAgents(SAMPLE_BOARD, [])
    expect(agents.length).toBeGreaterThanOrEqual(6)
    const names = agents.map((a) => a.name)
    expect(names).toContain('Phuc Thanh')
    expect(names).toContain('Minh BA')
    expect(names).toContain('Lan QA')
    expect(names.some((n) => n.includes('Gemini AI'))).toBe(true)
  })

  it('builds a Sprint blueprint with ruler guides, column rects, master cards, and ⌥-drag duplicates', () => {
    const bp = buildSprintSwarmBlueprint(SAMPLE_BOARD)
    expect(bp.guides.length).toBeGreaterThanOrEqual(2)
    expect(bp.columns).toHaveLength(2)
    expect(bp.cards).toHaveLength(3)

    // First card in col-1 is master; second card in col-1 is an ⌥-drag duplicate
    const card1 = bp.cards.find((c) => c.id === 'card-1')
    const card2 = bp.cards.find((c) => c.id === 'card-2')
    expect(card1.isDuplicate).toBe(false)
    expect(card2.isDuplicate).toBe(true)
    expect(card2.masterCardId).toBe('card-1')
    expect(card2.gapPx).toBeGreaterThan(0)

    // Tasks enforce dependency ordering: duplicate card waits for master card, which waits for column
    const colTask = bp.tasks.find((t) => t.kind === 'column' && t.targetId === 'col-1')
    const masterTask = bp.tasks.find((t) => t.kind === 'card_master' && t.targetId === 'card-1')
    const dupTask = bp.tasks.find((t) => t.kind === 'card_dup' && t.targetId === 'card-2')
    expect(colTask).toBeTruthy()
    expect(masterTask.deps).toContain(colTask.id)
    expect(dupTask.deps).toContain(masterTask.id)
  })

  it('steps the swarm simulation through tasks until completion and respects pause state', () => {
    const sim = createSwarmSimulation(SAMPLE_BOARD, { speed: 2 })
    expect(sim.doneCount).toBe(0)
    expect(sim.totalCount).toBeGreaterThan(0)

    // When paused, stepping does not advance progress
    const paused = { ...sim, paused: true }
    const afterPaused = stepSwarmSimulation(paused, 0.5)
    expect(afterPaused.sim.time).toBe(0)

    // Step forward until all tasks complete
    let current = sim
    let safety = 0
    const soundEvents = []
    while (!current.completed && safety < 200) {
      const res = stepSwarmSimulation(current, 0.25)
      current = res.sim
      soundEvents.push(...res.events)
      safety += 1
    }

    expect(current.completed).toBe(true)
    expect(current.doneCount).toBe(current.totalCount)
    expect(soundEvents.length).toBeGreaterThan(0)
  })
})
