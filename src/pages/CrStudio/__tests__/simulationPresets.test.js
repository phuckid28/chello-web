import { describe, it, expect } from 'vitest'
import {
  SIMULATION_PRESET_KEYS,
  SIMULATION_PRESETS,
  detectSimulationPreset,
  buildSimulationModel
} from '../simulationPresets'

describe('ByteByteGo system-design-101 simulationPresets', () => {
  it('exposes all 5 ByteByteGo architectural presets', () => {
    expect(SIMULATION_PRESET_KEYS).toEqual([
      'usage-limit-lock',
      'idempotent-payment',
      'ekyc-circuit-breaker',
      'auto-debit-dlq',
      'rate-limited-api'
    ])
    expect(SIMULATION_PRESETS).toHaveLength(5)
  })

  it('auto-detects the appropriate preset from CR title, code, or topic column', () => {
    expect(detectSimulationPreset({ crCode: 'BNPL-945', title: 'Usage Limit Monthly Sync' }, 'Usage Limit')).toBe('usage-limit-lock')
    expect(detectSimulationPreset({ crCode: 'BNPL-946', title: 'Real-time Credit Scoring & eKYC' }, 'Credit Scoring')).toBe('ekyc-circuit-breaker')
    expect(detectSimulationPreset({ crCode: 'BNPL-947', title: 'Auto-Debit T+0 Settlement & Retry' }, 'Settlement')).toBe('auto-debit-dlq')
    expect(detectSimulationPreset({ crCode: 'PAY-101', title: 'Double-Entry Ledger & Idempotent Payment' }, 'Core Ledger')).toBe('idempotent-payment')
    expect(detectSimulationPreset({ crCode: 'API-202', title: 'Token Bucket Rate Limiter & Redis Cache-Aside' }, 'Gateway')).toBe('rate-limited-api')
  })

  it('builds a 5-stage simulation pipeline with happy, edge, and error scenarios for every preset', () => {
    const sampleCard = { crCode: 'BNPL-945', title: 'Usage Limit Sync' }
    SIMULATION_PRESET_KEYS.forEach((presetKey) => {
      const steps = buildSimulationModel(sampleCard, 'Usage Limit', presetKey)
      expect(steps).toHaveLength(5)
      steps.forEach((step, idx) => {
        expect(step.id).toBe(`step-${idx + 1}`)
        expect(step.stage).toBeTruthy()
        expect(step.actor).toBeTruthy()
        expect(step.happy.status).toBe('PASS')
        expect(step.edge.input).toBeTruthy()
        expect(step.error.rule).toBeTruthy()
      })
    })
  })
})
