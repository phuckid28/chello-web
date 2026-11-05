// GitHub Spec Kit (v1.3.1) SDD & Convergence Auditor for Chella CRs
// Implements Template-Driven Quality Checks ([NEEDS CLARIFICATION], FR-###, SC-###, Given/When/Then)
// and Append-Only Convergence Auditing (missing | partial | contradicts | needs-clarification).

import { getCardDevProgress, normalizeCrStatus } from '~/utils/excelExporter'

export const SPEC_KIT_VERDICTS = Object.freeze({
  CONVERGED: 'converged',
  PARTIAL: 'partial',
  NEEDS_CLARIFICATION: 'needs-clarification',
  CONTRADICTS: 'contradicts'
})

export const VERDICT_META = Object.freeze({
  [SPEC_KIT_VERDICTS.CONVERGED]: {
    label: 'CONVERGED',
    beacon: 'SPEC ✓',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.16)'
  },
  [SPEC_KIT_VERDICTS.PARTIAL]: {
    label: 'PARTIAL',
    beacon: 'SPEC ~',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.16)'
  },
  [SPEC_KIT_VERDICTS.NEEDS_CLARIFICATION]: {
    label: 'NEEDS CLARIFICATION',
    beacon: 'CLARIFY',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.18)'
  },
  [SPEC_KIT_VERDICTS.CONTRADICTS]: {
    label: 'CONTRADICTS',
    beacon: 'GAP !',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.18)'
  }
})

const CLARIFICATION_REGEX = /\[NEEDS[\s_-]+CLARIFICATION(?::\s*([^\]]+))?\]/gi
const TBD_REGEX = /\[TBD(?::\s*([^\]]+))?\]/gi
const TODO_REGEX = /\[TODO(?::\s*([^\]]+))?\]/gi
const FR_REGEX = /\b(FR-\d{2,4})\b[:\s*-]*([^\n\r]*)/gi
const SC_REGEX = /\b(SC-\d{2,4})\b[:\s*-]*([^\n\r]*)/gi
const USER_STORY_REGEX = /###\s*User Story\s*\d+\s*[-–—:]\s*([^\n\r(]+)/gi
const GHERKIN_REGEX = /(?:\*\*Given\*\*|\bGiven\b)\s+([^\n\r]+?)\s+(?:\*\*When\*\*|\bWhen\b)\s+([^\n\r]+?)\s+(?:\*\*Then\*\*|\bThen\b)\s+([^\n\r]+)/gi

const DONE_STATUSES = new Set(['Ready for deploy', 'Deployed', 'Done testing'])

const scanTextForMarkers = (text, source) => {
  if (!text) return []
  const str = String(text)
  const found = []

  for (const match of str.matchAll(CLARIFICATION_REGEX)) {
    const detail = (match[1] || 'Unresolved specification ambiguity').trim()
    found.push({
      id: `${source}-clarify-${found.length + 1}`,
      kind: 'needs-clarification',
      label: '[NEEDS CLARIFICATION]',
      detail,
      source
    })
  }

  for (const match of str.matchAll(TBD_REGEX)) {
    const detail = (match[1] || 'To be determined').trim()
    found.push({
      id: `${source}-tbd-${found.length + 1}`,
      kind: 'tbd',
      label: '[TBD]',
      detail,
      source
    })
  }

  for (const match of str.matchAll(TODO_REGEX)) {
    const detail = (match[1] || 'Open specification item').trim()
    found.push({
      id: `${source}-todo-${found.length + 1}`,
      kind: 'todo',
      label: '[TODO]',
      detail,
      source
    })
  }

  return found
}

export const extractUncertaintyMarkers = (card) => {
  if (!card) return []
  const fromDesc = scanTextForMarkers(card.description, 'description')
  const fromNote = scanTextForMarkers(card.note, 'note')
  const frdDocs = Array.isArray(card.frdDocuments) ? card.frdDocuments : []
  const fromFrd = frdDocs.flatMap(doc => scanTextForMarkers(doc?.content, 'frd'))
  return [...fromDesc, ...fromNote, ...fromFrd]
}

export const extractSpecRequirements = (card) => {
  if (!card) {
    return {
      functionalRequirements: [],
      successCriteria: [],
      acceptanceScenarios: [],
      userStories: [],
      totalCount: 0
    }
  }

  const frdText = (Array.isArray(card.frdDocuments) ? card.frdDocuments : [])
    .map(doc => doc?.content || '')
    .filter(Boolean)
    .join('\n')
  const combined = `${card.description || ''}\n${frdText}`

  const functionalRequirements = Array.from(combined.matchAll(FR_REGEX)).map(m => ({
    code: m[1].toUpperCase(),
    text: (m[2] || '').replace(/^\*+\s*/, '').trim()
  }))

  const successCriteria = Array.from(combined.matchAll(SC_REGEX)).map(m => ({
    code: m[1].toUpperCase(),
    text: (m[2] || '').replace(/^\*+\s*/, '').trim()
  }))

  const userStories = Array.from(combined.matchAll(USER_STORY_REGEX)).map((m, idx) => ({
    code: `US${idx + 1}`,
    title: (m[1] || '').trim()
  }))

  const acceptanceScenarios = Array.from(combined.matchAll(GHERKIN_REGEX)).map((m, idx) => ({
    code: `AC${idx + 1}`,
    given: m[1].trim(),
    when: m[2].trim(),
    then: m[3].trim()
  }))

  const totalCount =
    functionalRequirements.length +
    successCriteria.length +
    userStories.length +
    acceptanceScenarios.length

  return {
    functionalRequirements,
    successCriteria,
    acceptanceScenarios,
    userStories,
    totalCount
  }
}

export const auditCrConvergence = (card) => {
  if (!card) {
    return {
      verdict: SPEC_KIT_VERDICTS.PARTIAL,
      verdictMeta: VERDICT_META[SPEC_KIT_VERDICTS.PARTIAL],
      score: 0,
      beaconLabel: 'SPEC ~',
      uncertainties: [],
      spec: extractSpecRequirements(null),
      checklistTotal: 0,
      checklistDone: 0,
      frdCount: 0,
      findings: [],
      remediationTasks: []
    }
  }

  const uncertainties = extractUncertaintyMarkers(card)
  const spec = extractSpecRequirements(card)
  const checklist = Array.isArray(card.checklist) ? card.checklist : []
  const checklistTotal = checklist.length
  const checklistDone = checklist.filter(item => Boolean(item?.isCompleted)).length
  const frdCount = Array.isArray(card.frdDocuments) ? card.frdDocuments.length : 0
  const normStatus = normalizeCrStatus(card.baStatus)
  const devProgress = getCardDevProgress(card)
  const isClaimedDone = DONE_STATUSES.has(normStatus) || devProgress >= 1

  const findings = []
  const candidateTasks = []

  // 1. Check uncertainty markers ([NEEDS CLARIFICATION], [TBD], [TODO])
  if (uncertainties.length > 0) {
    if (isClaimedDone) {
      findings.push({
        id: 'F-CLARIFY-CONTRADICTS',
        gapType: 'contradicts',
        severity: 'CRITICAL',
        source: uncertainties[0].label,
        message: `${uncertainties.length} unresolved marker(s) remain while CR status is "${normStatus}"`
      })
    } else {
      findings.push({
        id: 'F-CLARIFY-OPEN',
        gapType: 'needs-clarification',
        severity: 'HIGH',
        source: uncertainties[0].label,
        message: `${uncertainties.length} ambiguity marker(s) require clarification before convergence`
      })
    }
    uncertainties.forEach(u => {
      candidateTasks.push(`[Convergence • CLARIFY] Resolve ${u.label}: ${u.detail}`)
    })
  }

  // 2. Check completion contradiction (Done status with unchecked checklist items)
  if (isClaimedDone && checklistTotal > 0 && checklistDone < checklistTotal) {
    const remaining = checklistTotal - checklistDone
    findings.push({
      id: 'F-TASKS-CONTRADICTS',
      gapType: 'contradicts',
      severity: 'CRITICAL',
      source: 'tasks.md / checklist',
      message: `CR is marked "${normStatus}" (${Math.round(devProgress * 100)}%) but ${remaining}/${checklistTotal} subtask(s) are still unchecked`
    })
  }

  // 3. Check Specification & FRD artifact coverage
  const hasSpecBaseline = frdCount > 0 || spec.totalCount > 0
  if (!hasSpecBaseline) {
    findings.push({
      id: 'F-SPEC-MISSING',
      gapType: 'missing',
      severity: normStatus === 'Processing' ? 'MEDIUM' : 'HIGH',
      source: 'spec.md / FRD',
      message: 'No FRD document or structured FR-### / Given-When-Then requirements defined'
    })
    candidateTasks.push('[Convergence • SPEC] Define FR-001 requirements and Given/When/Then acceptance scenarios')
  }

  // 4. Check Executable Tasks (checklist coverage)
  if (checklistTotal === 0) {
    findings.push({
      id: 'F-TASKS-MISSING',
      gapType: 'missing',
      severity: 'MEDIUM',
      source: 'tasks.md',
      message: 'No executable checklist subtasks derived from the specification'
    })
    if (spec.functionalRequirements.length > 0) {
      spec.functionalRequirements.slice(0, 3).forEach(fr => {
        candidateTasks.push(`[Convergence • ${fr.code}] Implement & verify: ${fr.text || fr.code}`)
      })
    } else {
      candidateTasks.push(`[Convergence • TASKS] Break down ${card.crCode || 'CR'} into independently testable subtasks`)
    }
  } else if (checklistDone < checklistTotal && !isClaimedDone) {
    findings.push({
      id: 'F-TASKS-PARTIAL',
      gapType: 'partial',
      severity: 'LOW',
      source: 'tasks.md',
      message: `${checklistDone}/${checklistTotal} subtask(s) completed (${Math.round((checklistDone / checklistTotal) * 100)}%)`
    })
  }

  // Deduplicate remediation tasks against existing checklist titles (Append-Only rule)
  const existingTitles = new Set(checklist.map(item => String(item?.title || '').trim().toLowerCase()))
  const remediationTasks = candidateTasks.filter(t => !existingTitles.has(t.trim().toLowerCase()))

  let verdict = SPEC_KIT_VERDICTS.CONVERGED
  if (findings.some(f => f.gapType === 'contradicts')) {
    verdict = SPEC_KIT_VERDICTS.CONTRADICTS
  } else if (uncertainties.length > 0) {
    verdict = SPEC_KIT_VERDICTS.NEEDS_CLARIFICATION
  } else if (findings.length > 0) {
    verdict = SPEC_KIT_VERDICTS.PARTIAL
  }

  // Compute deterministic 0..100 convergence score
  const specPoints = hasSpecBaseline ? 35 : 0
  const clarityPoints = uncertainties.length === 0 ? 25 : Math.max(0, 25 - uncertainties.length * 12)
  const taskPoints = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 40) : Math.round(devProgress * 20)
  const rawScore = specPoints + clarityPoints + taskPoints
  const score = verdict === SPEC_KIT_VERDICTS.CONVERGED ? 100 : Math.min(95, Math.max(0, rawScore))

  const verdictMeta = VERDICT_META[verdict] || VERDICT_META[SPEC_KIT_VERDICTS.PARTIAL]
  const beaconLabel =
    verdict === SPEC_KIT_VERDICTS.CONVERGED
      ? 'SPEC ✓'
      : verdict === SPEC_KIT_VERDICTS.NEEDS_CLARIFICATION
        ? `CLARIFY ${uncertainties.length}`
        : verdict === SPEC_KIT_VERDICTS.CONTRADICTS
          ? `GAP ${findings.length}`
          : `SPEC ${score}%`

  return {
    verdict,
    verdictMeta,
    score,
    beaconLabel,
    uncertainties,
    spec,
    checklistTotal,
    checklistDone,
    frdCount,
    findings,
    remediationTasks
  }
}

export const buildSddSpecSnippet = (card) => {
  const code = card?.crCode || 'CR-001'
  const title = card?.title || 'Feature Specification'
  return [
    `## 🌱 Spec-Driven Specification (${code}: ${title})`,
    '',
    '### User Story 1 - Core Value Delivery (Priority: P1)',
    `**Independent Test**: Can be verified independently by executing the primary ${code} flow.`,
    '',
    '**Acceptance Scenarios**:',
    '1. **Given** an authenticated user in the target Sprint state, **When** they trigger the primary action, **Then** the system persists the state and updates the audit trail.',
    '',
    '### Functional Requirements',
    `- **FR-001**: System MUST implement the core business rule for ${code} (${title}).`,
    '- **FR-002**: System MUST validate boundary inputs and reject malformed payloads.',
    '- **FR-003**: System MUST handle edge cases via [NEEDS CLARIFICATION: specify fallback/retry policy?].',
    '',
    '### Success Criteria',
    '- **SC-001**: 100% of P1 acceptance scenarios pass UAT verification with 0 regressions.'
  ].join('\n')
}
