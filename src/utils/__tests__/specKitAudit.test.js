import { describe, expect, it } from 'vitest'
import {
  SPEC_KIT_VERDICTS,
  auditCrConvergence,
  buildSddSpecSnippet,
  extractSpecRequirements,
  extractUncertaintyMarkers
} from '../specKitAudit'

describe('specKitAudit — GitHub Spec Kit SDD & Convergence Auditor', () => {
  it('extracts [NEEDS CLARIFICATION], [TBD], and [TODO] markers across description, note, and FRD documents', () => {
    const card = {
      _id: 'c1',
      crCode: 'BNPL-945',
      title: 'Usage Limit Monthly Sync',
      description: 'FR-001: System MUST cap monthly usage.\n[NEEDS CLARIFICATION: Should retry backoff be exponential or linear?]',
      note: 'Waiting on partner API [TBD]',
      frdDocuments: [
        { id: 'f1', name: 'FRD.md', content: 'Check settlement window [TODO: confirm cut-off timezone]' }
      ]
    }

    const markers = extractUncertaintyMarkers(card)
    expect(markers).toHaveLength(3)
    expect(markers[0]).toMatchObject({
      kind: 'needs-clarification',
      detail: 'Should retry backoff be exponential or linear?',
      source: 'description'
    })
    expect(markers[1]).toMatchObject({
      kind: 'tbd',
      source: 'note'
    })
    expect(markers[2]).toMatchObject({
      kind: 'todo',
      detail: 'confirm cut-off timezone',
      source: 'frd'
    })
  })

  it('extracts FR-###, SC-###, User Stories, and Given/When/Then acceptance scenarios', () => {
    const card = {
      _id: 'c2',
      crCode: 'BNPL-946',
      title: 'Ledger Reconciliation',
      description: [
        '### User Story 1 - Daily Settlement Cut-off (Priority: P1)',
        '1. **Given** an active merchant account, **When** cut-off runs at 23:59, **Then** ledger totals reconcile.',
        '- **FR-001**: System MUST reconcile daily settlement batches.',
        '- **FR-002**: System MUST emit an audit log for any mismatch.',
        '- **SC-001**: 100% of batches reconcile within 90 seconds.'
      ].join('\n')
    }

    const spec = extractSpecRequirements(card)
    expect(spec.userStories).toHaveLength(1)
    expect(spec.acceptanceScenarios).toHaveLength(1)
    expect(spec.functionalRequirements).toHaveLength(2)
    expect(spec.successCriteria).toHaveLength(1)
    expect(spec.totalCount).toBe(5)
  })

  it('flags CRITICAL contradicts verdict when a CR is Deployed/Ready with unresolved [NEEDS CLARIFICATION] or unchecked subtasks', () => {
    const card = {
      _id: 'c3',
      crCode: 'BNPL-947',
      title: 'Partner Webhook Auth',
      baStatus: 'Ready for deploy',
      devProgress: 1,
      description: 'FR-001: Authenticate partner webhook [NEEDS CLARIFICATION: HMAC-SHA256 or mTLS?]',
      checklist: [
        { id: 'chk-1', title: 'Write unit test', isCompleted: true },
        { id: 'chk-2', title: 'Verify signature header', isCompleted: false }
      ],
      frdDocuments: [{ id: 'doc-1', name: 'FRD_947.md' }]
    }

    const audit = auditCrConvergence(card)
    expect(audit.verdict).toBe(SPEC_KIT_VERDICTS.CONTRADICTS)
    expect(audit.findings.some(f => f.gapType === 'contradicts' && f.severity === 'CRITICAL')).toBe(true)
    expect(audit.remediationTasks.length).toBeGreaterThan(0)
  })

  it('reports CONVERGED verdict and 100 score when spec, FRD, and completed subtasks align with zero uncertainties', () => {
    const card = {
      _id: 'c4',
      crCode: 'BNPL-948',
      title: 'Clean Converged CR',
      baStatus: 'Deployed',
      devProgress: 1,
      description: '- **FR-001**: System MUST persist audit events.\n- **SC-001**: Audit latency under 50ms.',
      checklist: [
        { id: 'chk-1', title: 'Implement FR-001 audit persistence', isCompleted: true },
        { id: 'chk-2', title: 'Verify SC-001 latency benchmark', isCompleted: true }
      ],
      frdDocuments: [{ id: 'doc-1', name: 'FRD_BNPL_948.md' }]
    }

    const audit = auditCrConvergence(card)
    expect(audit.verdict).toBe(SPEC_KIT_VERDICTS.CONVERGED)
    expect(audit.score).toBe(100)
    expect(audit.findings).toHaveLength(0)
    expect(audit.beaconLabel).toBe('SPEC ✓')
  })

  it('generates a Spec-Kit compliant Markdown snippet without mutating the input card', () => {
    const card = Object.freeze({ _id: 'c5', crCode: 'BNPL-999', title: 'Offline Sync Queue' })
    const snippet = buildSddSpecSnippet(card)
    expect(snippet).toContain('BNPL-999')
    expect(snippet).toContain('FR-001')
    expect(snippet).toContain('SC-001')
    expect(snippet).toContain('[NEEDS CLARIFICATION:')
  })
})
