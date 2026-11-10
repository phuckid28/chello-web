// ByteByteGo System Design 101 architectural simulation presets for CR Studio.
// Covers Distributed Locking, Idempotency & Double-Entry Ledger, Circuit Breaker, DLQ Retry, and Token Bucket Rate Limiting.

export const SIMULATION_PRESET_KEYS = [
  'usage-limit-lock',
  'idempotent-payment',
  'ekyc-circuit-breaker',
  'auto-debit-dlq',
  'rate-limited-api'
]

export const SIMULATION_PRESETS = [
  {
    id: 'usage-limit-lock',
    label: '01 • Distributed Lock & Quota',
    badge: 'Redis SETNX + Lua',
    patternName: 'Distributed Lock & Monthly Quota Sync',
    description: 'Ngăn chặn Race Condition bằng Redis SETNX + Lua atomic release và kiểm soát hạn mức đồng bộ 1 lần/tháng.'
  },
  {
    id: 'idempotent-payment',
    label: '02 • Idempotent Ledger',
    badge: 'Idempotency-Key + Outbox',
    patternName: 'Idempotent Payment & Double-Entry Ledger',
    description: 'Đảm bảo thực thi đúng 1 lần (Exactly-Once) qua Idempotency-Key, sổ cái kép (Debit = Credit) và Transactional Outbox.'
  },
  {
    id: 'ekyc-circuit-breaker',
    label: '03 • eKYC Circuit Breaker',
    badge: 'CLOSED / OPEN / Fallback',
    patternName: 'Real-time eKYC & Credit Scoring Circuit Breaker',
    description: 'Bảo vệ luồng chấm điểm tín dụng trước độ trễ của đối tác thứ 3 bằng trạng thái Circuit Breaker và hàng đợi Fallback.'
  },
  {
    id: 'auto-debit-dlq',
    label: '04 • Auto-Debit & DLQ Retry',
    badge: 'Exp Backoff + Jitter',
    patternName: 'Scheduled Auto-Debit T+0 & Dead-Letter Queue Retry',
    description: 'Khấu trừ tự động T+0 với cơ chế Retry Exponential Backoff + Full Jitter và cảnh báo ZNS/SMS khi vào DLQ.'
  },
  {
    id: 'rate-limited-api',
    label: '05 • Rate Limiter & Cache',
    badge: 'Token Bucket + Singleflight',
    patternName: 'Token Bucket Rate Limiter & Cache-Aside',
    description: 'Chặn bão request tại API Gateway bằng Token Bucket (429 Retry-After) và chống Cache Stampede bằng Singleflight.'
  }
]

export const detectSimulationPreset = (card, columnTitle = '') => {
  const code = String(card?.crCode || '').toUpperCase()
  const haystack = `${code} ${card?.title || ''} ${card?.description || ''} ${columnTitle}`.toLowerCase()

  if (/946|ekyc|credit\s*scor|cic|circuit\s*breaker|kyc/.test(haystack)) {
    return 'ekyc-circuit-breaker'
  }
  if (/947|auto[-\s]*debit|settlement|dlq|dead[-\s]*letter|reconcil|thu\s*hồi/.test(haystack)) {
    return 'auto-debit-dlq'
  }
  if (/idempoten|double[-\s]*entry|ledger|outbox|payment|disburse| giải\s*ngân/.test(haystack)) {
    return 'idempotent-payment'
  }
  if (/rate[-\s]*limit|token[-\s]*bucket|cache[-\s]*aside|stampede|singleflight|gateway/.test(haystack)) {
    return 'rate-limited-api'
  }
  return 'usage-limit-lock'
}

export const getSimulationPresetMeta = (presetId) => {
  return SIMULATION_PRESETS.find(item => item.id === presetId) || SIMULATION_PRESETS[0]
}

const buildUsageLimitLockSteps = (crCode, title, columnTitle) => [
  {
    id: 'step-1',
    stage: '1. Trigger & Actor',
    actor: 'User / Client App',
    component: 'Client & Edge Trigger',
    summary: `User triggers monthly synchronized update for [${crCode}] (${title.slice(0, 42)})`,
    happy: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "userId": "usr_88412", "requestedMonth": "2026-10", "action": "SYNC_MONTHLY_LIMIT" }`,
      rule: 'Verify authenticated session & valid user profile state',
      mutation: 'Session validated • Request correlationId generated',
      output: 'Forward to API Gateway (Latency: 12ms)'
    },
    edge: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "userId": "usr_88412", "requestedMonth": "2026-10", "attempt": 2 }`,
      rule: 'User initiates 2nd sync request within the same calendar month',
      mutation: 'Request accepted for quota check',
      output: 'Forward to API Gateway'
    },
    error: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "userId": "usr_88412", "concurrentRequests": 2 }`,
      rule: 'Duplicate parallel requests sent within 50ms',
      mutation: 'Both requests reach gateway simultaneously',
      output: 'Forward to Idempotency Guard'
    }
  },
  {
    id: 'step-2',
    stage: '2. Gateway & Lock',
    actor: 'API Gateway / Redis Lock',
    component: 'Idempotency & Schema Guard',
    summary: 'Acquire distributed lock (SETNX + TTL) & validate payload schema',
    happy: {
      status: 'PASS',
      input: 'Lock Key: redis://usage_limit_sync:usr_88412:2026-10 (SET NX PX 30000)',
      rule: 'BR-02: Acquire atomic SETNX lock with fencing token to prevent race conditions',
      mutation: 'Lock acquired (SETNX = 1, token = f_9901)',
      output: 'Proceed to Business Rule Engine'
    },
    edge: {
      status: 'PASS',
      input: 'Lock Key: redis://usage_limit_sync:usr_88412:2026-10',
      rule: 'Schema & lock check passed',
      mutation: 'Lock acquired for quota inspection',
      output: 'Proceed to Business Rule Engine'
    },
    error: {
      status: 'WARN',
      input: 'Lock Key: redis://usage_limit_sync:usr_88412:2026-10 (Already Locked!)',
      rule: 'BR-02: Reject parallel duplicate execution while lock is active',
      mutation: '2nd concurrent thread blocked by Redis lock',
      output: '429 Too Many Concurrent Requests (Safe Abort)'
    }
  },
  {
    id: 'step-3',
    stage: '3. Business Rule Engine',
    actor: `${columnTitle || 'Usage Limit'} Service`,
    component: 'Quota & Policy Evaluator',
    summary: 'Check monthly 1-time synchronization quota (last_sync_month vs current_month)',
    happy: {
      status: 'PASS',
      input: '{ "last_sync_month": "2026-09", "current_month": "2026-10", "monthly_quota": 1, "used_this_month": 0 }',
      rule: 'BR-01: User is allowed maximum 1 synchronized update per calendar month',
      mutation: 'Quota check PASSED (0/1 used in 2026-10)',
      output: 'Authorize Core DB Synchronization'
    },
    edge: {
      status: 'BLOCKED',
      input: '{ "last_sync_month": "2026-10", "current_month": "2026-10", "monthly_quota": 1, "used_this_month": 1 }',
      rule: 'BR-01: Reject if user already performed 1 synchronized update in current month',
      mutation: 'Execution halted • No DB write performed',
      output: '409 Conflict: MONTHLY_SYNC_LIMIT_REACHED'
    },
    error: {
      status: 'PASS',
      input: '{ "last_sync_month": "2026-09", "current_month": "2026-10" }',
      rule: 'Primary thread passes business rule check',
      mutation: 'Proceeding to downstream database commit',
      output: 'Invoke Core Ledger Sync'
    }
  },
  {
    id: 'step-4',
    stage: '4. Core DB & State Sync',
    actor: 'Core Database / Ledger',
    component: 'Transactional Persistence',
    summary: 'Persist updated usage limit & mark monthly sync timestamp atomically',
    happy: {
      status: 'PASS',
      input: 'UPDATE user_usage_limits SET limit_amount = 15000000, last_sync_month = "2026-10", sync_count = sync_count + 1',
      rule: 'BR-03: Atomic transaction across Profile & Usage Limit tables',
      mutation: 'Committed row v42 • last_sync_month = "2026-10"',
      output: 'DB Commit OK (18ms)'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Skipped due to BR-01 Quota Block at Stage 3',
      rule: 'Database remains untouched on quota violation',
      mutation: 'Zero state mutation (Safe)',
      output: 'Return cached current limit state'
    },
    error: {
      status: 'FAIL',
      input: 'Core DB Connection Timeout after 3000ms',
      rule: 'Rollback transaction & Lua atomic lock release so user can retry',
      mutation: 'Transaction ROLLED BACK • last_sync_month remains "2026-09"',
      output: '503 Service Unavailable (Retry-After: 5s)'
    }
  },
  {
    id: 'step-5',
    stage: '5. Audit & Client Output',
    actor: 'Audit Log & UI Response',
    component: 'Telemetry & Client State',
    summary: 'Record audit trail & return synchronized state to user interface',
    happy: {
      status: 'PASS',
      input: '{ "auditEvent": "USAGE_LIMIT_SYNCED", "status": 200, "nextEligibleSync": "2026-11-01" }',
      rule: 'Emit audit log & refresh client usage limit badge',
      mutation: 'UI displays updated limit + "Synced for Oct 2026" badge',
      output: '200 OK — Monthly Synchronized Update Complete!'
    },
    edge: {
      status: 'BLOCKED',
      input: '{ "auditEvent": "USAGE_LIMIT_SYNC_REJECTED", "reason": "MONTHLY_QUOTA_EXCEEDED" }',
      rule: 'Display friendly notice: Next sync available on 01/11/2026',
      mutation: 'Audit logged as blocked attempt',
      output: '409 Conflict — Handled Gracefully'
    },
    error: {
      status: 'FAIL',
      input: '{ "auditEvent": "USAGE_LIMIT_SYNC_TIMEOUT_ROLLBACK", "lockReleased": true }',
      rule: 'Quota NOT consumed on system error; user can retry safely',
      mutation: 'Alert sent to monitoring channel',
      output: '503 Error — Safe Rollback Verified'
    }
  }
]

const buildIdempotentPaymentSteps = (crCode) => [
  {
    id: 'step-1',
    stage: '1. Trigger & Idempotency Key',
    actor: 'Checkout / BNPL Client',
    component: 'UUIDv7 Idempotency Generator',
    summary: `Client submits payment/disbursement request for [${crCode}] with Idempotency-Key header`,
    happy: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "idempotencyKey": "idem_0192b4f8", "amount": 4500000, "currency": "VND" }`,
      rule: 'BR-01: Require deterministic Idempotency-Key & payload SHA-256 fingerprint',
      mutation: 'Header validated • Fingerprint sha256:8f91a2 computed',
      output: 'Forward to Idempotency Store'
    },
    edge: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "idempotencyKey": "idem_0192b4f8", "amount": 9900000, "mutatedPayload": true }`,
      rule: 'Detect reused Idempotency-Key with mismatched payload hash',
      mutation: 'Fingerprint mismatch flagged for Stage 2 inspection',
      output: 'Forward to Idempotency Store'
    },
    error: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "idempotencyKey": "idem_0192b4f8", "networkRetry": true }`,
      rule: 'Client retries while original transaction is still IN_PROGRESS',
      mutation: 'Duplicate in-flight request detected',
      output: 'Forward to Idempotency Store'
    }
  },
  {
    id: 'step-2',
    stage: '2. Idempotency Guard',
    actor: 'Idempotency Store (Redis + DB)',
    component: 'Deduplication & Hash Verifier',
    summary: 'Inspect idempotency record state (NEW, IN_PROGRESS, COMPLETED, or HASH_MISMATCH)',
    happy: {
      status: 'PASS',
      input: 'INSERT INTO idempotency_keys (key, hash, status) VALUES ("idem_0192b4f8", "8f91a2", "IN_PROGRESS")',
      rule: 'BR-02: First-seen key transitions atomically to IN_PROGRESS',
      mutation: 'Idempotency record locked for execution',
      output: 'Proceed to Double-Entry Ledger'
    },
    edge: {
      status: 'BLOCKED',
      input: 'Existing key "idem_0192b4f8" has hash "8f91a2" != incoming hash "c410e9"',
      rule: 'BR-02: Reject key reuse with different parameters (422 Unprocessable Entity)',
      mutation: 'Blocked before touching ledger',
      output: '422 IDEMPOTENCY_KEY_PAYLOAD_MISMATCH'
    },
    error: {
      status: 'WARN',
      input: 'Existing key "idem_0192b4f8" status = IN_PROGRESS (started 140ms ago)',
      rule: 'Return 409 Conflict with Retry-After while first request is executing',
      mutation: 'Duplicate request safely short-circuited',
      output: '409 Conflict: TRANSACTION_IN_PROGRESS'
    }
  },
  {
    id: 'step-3',
    stage: '3. Double-Entry Ledger',
    actor: 'Core Accounting Engine',
    component: 'Immutable Journal Postings',
    summary: 'Write balanced Debit & Credit journal legs (SUM(debit) == SUM(credit))',
    happy: {
      status: 'PASS',
      input: 'DEBIT Buyer_BNPL_Receivable +4,500,000 VND | CREDIT Merchant_Clearing +4,500,000 VND',
      rule: 'BR-03: Zero-sum invariant — total debits must equal total credits in same tx',
      mutation: '2 immutable ledger entries appended (journal_id: jrn_7721)',
      output: 'Proceed to Transactional Outbox'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Skipped due to Stage 2 Idempotency Hash Mismatch',
      rule: 'Ledger untouched on validation failure',
      mutation: 'Zero ledger postings created',
      output: 'Abort pipeline'
    },
    error: {
      status: 'FAIL',
      input: 'Downstream Settlement Bank Gateway HTTP 504 Gateway Timeout',
      rule: 'BR-04: Rollback uncommitted ledger tx or write compensating reversal entry',
      mutation: 'Local DB transaction rolled back cleanly',
      output: 'Mark idempotency key RETRYABLE_ERROR'
    }
  },
  {
    id: 'step-4',
    stage: '4. Transactional Outbox',
    actor: 'Outbox Publisher / Kafka',
    component: 'Guaranteed Event Delivery',
    summary: 'Commit domain event in same DB transaction & relay to message broker',
    happy: {
      status: 'PASS',
      input: 'INSERT INTO outbox_events (aggregate_id, type, payload) VALUES ("jrn_7721", "BNPL_DISBURSED", ...)',
      rule: 'BR-05: Outbox table committed atomically with ledger entries',
      mutation: 'Outbox event #9041 published to topic bnpl.settlement.v1',
      output: 'Cache final response in Idempotency Store'
    },
    edge: {
      status: 'SKIPPED',
      input: 'No outbox event emitted for rejected request',
      rule: 'Prevent phantom events on rejected requests',
      mutation: 'Outbox queue unchanged',
      output: 'Return 422 error response'
    },
    error: {
      status: 'FAIL',
      input: 'Outbox commit aborted because Stage 3 rolled back',
      rule: 'Delete IN_PROGRESS idempotency lock so client retry can re-run cleanly',
      mutation: 'Idempotency key cleared for safe retry',
      output: '504 Gateway Timeout (Safe to retry with same key)'
    }
  },
  {
    id: 'step-5',
    stage: '5. Cached Response & Audit',
    actor: 'API Gateway & Audit Trail',
    component: 'Idempotent Response Replay',
    summary: 'Store 200 OK snapshot (TTL 24h) so subsequent retries receive identical receipt',
    happy: {
      status: 'PASS',
      input: '{ "status": "COMPLETED", "journalId": "jrn_7721", "cachedResponseTtl": "86400s" }',
      rule: 'Any future retry with idem_0192b4f8 replays exact 200 OK receipt without re-charging',
      mutation: 'Receipt persisted • Client ledger balance updated',
      output: '200 OK — Double-Entry Disbursement Complete!'
    },
    edge: {
      status: 'BLOCKED',
      input: '{ "auditEvent": "IDEMPOTENCY_MISMATCH_BLOCKED", "status": 422 }',
      rule: 'Client prompted to generate a fresh Idempotency-Key for new amount',
      mutation: 'Zero duplicate charge risk',
      output: '422 Unprocessable Entity — Safely Blocked'
    },
    error: {
      status: 'FAIL',
      input: '{ "auditEvent": "PAYMENT_UPSTREAM_TIMEOUT", "idempotencyUnlocked": true }',
      rule: 'Client SDK automatically retries with same Idempotency-Key after 2s backoff',
      mutation: 'Zero double-debit • Ready for clean retry',
      output: '504 Timeout — Clean Rollback Verified'
    }
  }
]

const buildEkycCircuitBreakerSteps = (crCode) => [
  {
    id: 'step-1',
    stage: '1. eKYC & Scoring Trigger',
    actor: 'Mobile App / Onboarding',
    component: 'Biometric & NFC Capture',
    summary: `User submits CCCD chip NFC + Liveness frame for [${crCode}] credit scoring`,
    happy: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "applicantId": "app_3091", "livenessConfidence": 0.992, "nfcVerified": true }`,
      rule: 'BR-01: Liveness confidence >= 0.95 & valid ICAO 9303 signature on CCCD chip',
      mutation: 'Biometric token verified (38ms)',
      output: 'Forward to Risk Orchestrator'
    },
    edge: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "applicantId": "app_3091", "livenessConfidence": 0.81, "spoofSuspected": true }`,
      rule: 'Low liveness score flagged for policy gate',
      mutation: 'Flagged as HIGH_BIOMETRIC_RISK',
      output: 'Forward to Risk Orchestrator'
    },
    error: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "applicantId": "app_3091", "cicProviderLatency": "4800ms" }`,
      rule: 'External Credit Bureau (CIC) experiencing degraded latencyspike',
      mutation: 'Request enters Circuit Breaker proxy',
      output: 'Forward to Circuit Breaker'
    }
  },
  {
    id: 'step-2',
    stage: '2. Circuit Breaker Proxy',
    actor: 'Resilience4j / Envoy Breaker',
    component: 'State: CLOSED | OPEN | HALF_OPEN',
    summary: 'Monitor upstream failure rate (threshold 50% over 20 sliding calls, timeout 1500ms)',
    happy: {
      status: 'PASS',
      input: 'Breaker State: CLOSED (errorRate: 2.1%, p95: 310ms < 1500ms SLA)',
      rule: 'BR-02: Allow call through when Circuit Breaker is CLOSED',
      mutation: 'Upstream call dispatched with 1500ms hard deadline',
      output: 'Invoke Credit Scoring Engine'
    },
    edge: {
      status: 'BLOCKED',
      input: 'Biometric Policy Gate: livenessConfidence 0.81 < 0.95 threshold',
      rule: 'BR-01: Short-circuit before calling paid external credit bureau API',
      mutation: 'Saved external API cost • Rejected at policy gate',
      output: '403 EKYC_LIVENESS_THRESHOLD_NOT_MET'
    },
    error: {
      status: 'WARN',
      input: 'Breaker State: OPEN (errorRate: 68% >= 50% threshold • cool-down 30s)',
      rule: 'BR-02: Fail-fast in <2ms when Circuit Breaker is OPEN to prevent thread pool exhaustion',
      mutation: 'Upstream call bypassed • Routed to Fallback Scorer',
      output: 'Trigger Degraded Fallback Scoring Mode'
    }
  },
  {
    id: 'step-3',
    stage: '3. Credit Scoring Engine',
    actor: 'ML Risk Feature Store',
    component: 'XGBoost + Rule Matrix',
    summary: 'Combine internal repayment history + external CIC bureau vector',
    happy: {
      status: 'PASS',
      input: '{ "internalScore": 745, "cicBadDebtGroup": 1, "dtiRatio": 0.28 }',
      rule: 'BR-03: Approve Tier-A limit if score >= 680 and CIC group == 1',
      mutation: 'Computed credit score = 745 (Tier-A Approved: 20,000,000 VND)',
      output: 'Persist Credit Decision'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Skipped due to Stage 2 Biometric Policy Block',
      rule: 'Do not compute credit limit on failed eKYC',
      mutation: 'No credit line created',
      output: 'Prompt user to re-scan face in bright lighting'
    },
    error: {
      status: 'WARN',
      input: 'Fallback Mode: Using internal telco/device/repayment features only (CIC unavailable)',
      rule: 'BR-04: Grant conservative provisional micro-limit (3,000,000 VND) & enqueue async CIC check',
      mutation: 'Provisional Tier-C limit granted • Async reconciliation queued',
      output: 'Persist Provisional Decision + Async Job'
    }
  },
  {
    id: 'step-4',
    stage: '4. Decision Persistence',
    actor: 'Risk Ledger & Async Queue',
    component: 'Decision Audit & Retry Queue',
    summary: 'Save signed credit decision & schedule background verification if degraded',
    happy: {
      status: 'PASS',
      input: 'INSERT INTO credit_decisions (applicant_id, tier, limit, mode) VALUES ("app_3091", "A", 20000000, "FULL")',
      rule: 'Record immutable model feature snapshot for State Bank audit compliance',
      mutation: 'Credit line activated immediately (14ms)',
      output: 'Return Approved Limit to Client'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Recorded eKYC rejection attempt #1 (max 3 attempts/day)',
      rule: 'Track anti-fraud velocity counter',
      mutation: 'Attempt counter = 1/3',
      output: 'Return Guided Retry UI'
    },
    error: {
      status: 'PASS',
      input: 'INSERT provisional limit 3,000,000 VND + ENQUEUE job "cic.reverify.app_3091" (delay: 60s)',
      rule: 'Graceful degradation keeps user onboarding conversion alive during partner outage',
      mutation: 'Provisional limit active • Background HALF_OPEN probe scheduled',
      output: 'Return Provisional Approval (202 Accepted)'
    }
  },
  {
    id: 'step-5',
    stage: '5. Client UX & Telemetry',
    actor: 'Onboarding UI & Prometheus',
    component: 'Conversion & Breaker Metrics',
    summary: 'Render instant credit decision & emit circuit_breaker_state gauge',
    happy: {
      status: 'PASS',
      input: '{ "status": "APPROVED", "creditLimit": 20000000, "slaMs": 412 }',
      rule: 'End-to-end eKYC + Scoring completed under 1.5s SLA',
      mutation: 'User enters BNPL active wallet',
      output: '200 OK — Full Limit 20,000,000 VND Activated!'
    },
    edge: {
      status: 'BLOCKED',
      input: '{ "status": "RETRY_EKYC", "remainingAttempts": 2 }',
      rule: 'Clear camera guidance shown without technical jargon',
      mutation: 'User guided to retry Liveness scan',
      output: '403 Blocked — Safe Anti-Spoofing Guard'
    },
    error: {
      status: 'WARN',
      input: '{ "status": "PROVISIONAL_APPROVED", "creditLimit": 3000000, "breakerState": "OPEN" }',
      rule: 'Zero cascading outage! User gets instant 3M VND limit while full limit upgrades asynchronously',
      mutation: 'PagerDuty alert + automatic HALF_OPEN recovery probe in 30s',
      output: '202 Accepted — Graceful Fallback Verified!'
    }
  }
]

const buildAutoDebitDlqSteps = (crCode) => [
  {
    id: 'step-1',
    stage: '1. T+0 Scheduler Trigger',
    actor: 'Cron / Quartz Partitioner',
    component: 'Batch Due-Date Scanner',
    summary: `Scan due BNPL installments for [${crCode}] & partition by shard key`,
    happy: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "batchDate": "2026-10-25", "loanId": "ln_55201", "dueAmount": 1250000 }`,
      rule: 'BR-01: Select ACTIVE installments due on T+0 not yet settled',
      mutation: 'Claimed loan ln_55201 via SKIP LOCKED batch cursor',
      output: 'Dispatch to Auto-Debit Worker'
    },
    edge: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "loanId": "ln_55201", "manualPaidAt": "2026-10-25T07:58:00Z" }`,
      rule: 'User already paid manually 2 minutes before T+0 batch run',
      mutation: 'Forwarded to pre-debit state check',
      output: 'Dispatch to Auto-Debit Worker'
    },
    error: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "loanId": "ln_55201", "linkedBank": "NAPAS_TOKEN_99", "balance": 120000 }`,
      rule: 'Linked bank account has insufficient funds or temporary bank maintenance',
      mutation: 'Dispatched for debit attempt #1',
      output: 'Dispatch to Auto-Debit Worker'
    }
  },
  {
    id: 'step-2',
    stage: '2. Pre-Debit State Check',
    actor: 'Auto-Debit Worker',
    component: 'Optimistic Lock & Status Guard',
    summary: 'Re-verify installment status with SELECT FOR UPDATE before calling bank rail',
    happy: {
      status: 'PASS',
      input: 'SELECT status, version FROM installments WHERE id = "ln_55201" FOR UPDATE -> status = DUE (v3)',
      rule: 'BR-02: Prevent double collection if user paid manually via QR/App',
      mutation: 'Installment transitioned to DEBITING (v4)',
      output: 'Invoke Bank Direct Debit Rail'
    },
    edge: {
      status: 'BLOCKED',
      input: 'Installment status is already PAID (paid via VietQR at 07:58:00Z)',
      rule: 'BR-02: Abort auto-debit immediately if installment is already settled',
      mutation: 'Zero bank call made • Prevented double charge',
      output: '200 Skipped — Already Settled by User'
    },
    error: {
      status: 'PASS',
      input: 'Installment status = DUE (v3) • Proceeding to bank debit attempt #1',
      rule: 'Acquire debit lock & attach idempotency key "debit:ln_55201:2026-10-25"',
      mutation: 'Attempt #1 initiated',
      output: 'Invoke Bank Direct Debit Rail'
    }
  },
  {
    id: 'step-3',
    stage: '3. Bank Direct Debit Rail',
    actor: 'NAPAS / Partner Bank API',
    component: 'Direct Debit Execution',
    summary: 'Execute tokenized auto-debit against customer linked bank account',
    happy: {
      status: 'PASS',
      input: 'POST /v2/direct-debit { "token": "NAPAS_TOKEN_99", "amount": 1250000 }',
      rule: 'BR-03: Bank returns settlement ref & debit confirmation within 3000ms',
      mutation: 'Bank Debit OK (bankRef: FT2629800192)',
      output: 'Proceed to Ledger Settlement'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Skipped bank call because installment was already PAID',
      rule: 'No external call needed',
      mutation: 'Zero external latency',
      output: 'Complete batch item'
    },
    error: {
      status: 'FAIL',
      input: 'Bank Response: 402 INSUFFICIENT_FUNDS / 503 BANK_SWITCH_TIMEOUT',
      rule: 'BR-04: Classify error (Transient 5xx vs Business Insufficient Funds) and route to Retry Engine',
      mutation: 'Debit attempt #1 failed • Routed to Exponential Backoff Queue',
      output: 'Schedule Retry with Full Jitter'
    }
  },
  {
    id: 'step-4',
    stage: '4. Retry & DLQ Orchestrator',
    actor: 'Kafka Retry Topic / DLQ',
    component: 'Exponential Backoff + Full Jitter',
    summary: 'Compute delay = random(0, min(cap, base * 2^attempt)) or route to DLQ after max retries',
    happy: {
      status: 'PASS',
      input: 'No retry needed — settled on Attempt #1',
      rule: 'Mark installment PAID & release credit limit back to user wallet',
      mutation: 'Installment PAID • Available limit restored (+1,250,000 VND)',
      output: 'Emit Settlement Receipt'
    },
    edge: {
      status: 'PASS',
      input: 'Reconciliation marker confirmed (Manual VietQR payment matched)',
      rule: 'Ensure usage limit is already restored',
      mutation: 'Batch item marked RECONCILED_SKIPPED',
      output: 'Emit Reconciliation Log'
    },
    error: {
      status: 'WARN',
      input: 'Attempts #1..#3 exhausted (15m, 2h, 6h with Full Jitter) -> Moved to Dead-Letter Queue (DLQ)',
      rule: 'BR-05: After 3 failed attempts, stop hammering bank API, move to DLQ, and trigger ZNS/SMS payment link',
      mutation: 'Published to bnpl.autodebit.dlq • Fallback ZNS/SMS VietQR sent to user',
      output: 'Trigger Customer Notification & Ops DLQ Alert'
    }
  },
  {
    id: 'step-5',
    stage: '5. Notification & Reconciliation',
    actor: 'ZNS/SMS Gateway & Ops Console',
    component: 'Customer Comms & EOD Recon',
    summary: 'Send receipt or fallback VietQR link & reconcile T+0 settlement ledger',
    happy: {
      status: 'PASS',
      input: '{ "event": "AUTO_DEBIT_SUCCESS", "loanId": "ln_55201", "bankRef": "FT2629800192" }',
      rule: 'Push app notification & include in EOD T+0 reconciliation batch',
      mutation: '100% automated T+0 collection completed',
      output: '200 OK — T+0 Auto-Debit Settled!'
    },
    edge: {
      status: 'PASS',
      input: '{ "event": "AUTO_DEBIT_SKIPPED_ALREADY_PAID", "loanId": "ln_55201" }',
      rule: 'Zero double-collection guaranteed',
      mutation: 'Audit log recorded',
      output: '200 OK — Duplicate Collection Prevented!'
    },
    error: {
      status: 'WARN',
      input: '{ "event": "AUTO_DEBIT_DLQ_FALLBACK", "znsSent": true, "gracePeriodHours": 24 }',
      rule: 'Grant 24h grace period without late fee if failure was due to bank maintenance',
      mutation: 'User receives 1-tap VietQR link via Zalo ZNS • Ops DLQ ticket created',
      output: '202 DLQ Handled — Backoff & ZNS Fallback Verified!'
    }
  }
]

const buildRateLimitedApiSteps = (crCode) => [
  {
    id: 'step-1',
    stage: '1. Edge Request & Fingerprint',
    actor: 'Client / Public Partner API',
    component: 'Edge Envoy & IP/Token Extractor',
    summary: `Incoming high-throughput API traffic for [${crCode}]`,
    happy: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "clientId": "merchant_44", "endpoint": "GET /v1/bnpl/limit", "rps": 18 }`,
      rule: 'BR-01: Extract authenticated tenant key & route to Token Bucket filter',
      mutation: 'Bucket key: rl:merchant_44:limit_api identified',
      output: 'Forward to Token Bucket Limiter'
    },
    edge: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "clientId": "merchant_44", "rps": 240, "burst": "exceeded" }`,
      rule: 'Sudden traffic spike (240 req/s > 100 req/s quota)',
      mutation: 'Forwarded to Token Bucket limiter',
      output: 'Forward to Token Bucket Limiter'
    },
    error: {
      status: 'PASS',
      input: `{ "ticket": "${crCode}", "hotKey": "promo_campaign_2026", "concurrentMisses": 500 }`,
      rule: 'Hot cache key expires under 500 concurrent requests (Cache Stampede risk)',
      mutation: 'Requests enter Cache-Aside + Singleflight layer',
      output: 'Forward to Cache & Singleflight Guard'
    }
  },
  {
    id: 'step-2',
    stage: '2. Token Bucket Rate Limiter',
    actor: 'Redis Lua Token Bucket',
    component: 'Capacity: 100 | Refill: 50/sec',
    summary: 'Atomically refill tokens based on elapsed time & consume 1 token',
    happy: {
      status: 'PASS',
      input: 'EVALSHA token_bucket.lua "rl:merchant_44" capacity=100 refill=50 -> remaining=82',
      rule: 'BR-02: Allow request when remaining tokens >= 1',
      mutation: '1 token consumed • X-RateLimit-Remaining: 82 attached',
      output: 'Proceed to L1/L2 Cache Lookup'
    },
    edge: {
      status: 'BLOCKED',
      input: 'EVALSHA token_bucket.lua "rl:merchant_44" -> remaining=0 (bucket empty)',
      rule: 'BR-02: Reject excess traffic with HTTP 429 & Retry-After header',
      mutation: 'Blocked at Edge in 0.8ms • Core DB protected',
      output: '429 Too Many Requests (Retry-After: 2s)'
    },
    error: {
      status: 'PASS',
      input: 'Token bucket passed (remaining=64) • Proceeding to hot cache lookup',
      rule: 'Rate limit within threshold',
      mutation: 'Request enters Cache-Aside layer',
      output: 'Proceed to L1/L2 Cache Lookup'
    }
  },
  {
    id: 'step-3',
    stage: '3. Cache-Aside & Singleflight',
    actor: 'Redis L2 Cache + Singleflight',
    component: 'Stampede & Coalescing Guard',
    summary: 'Serve from Redis cache or coalesce concurrent cache misses into 1 DB query',
    happy: {
      status: 'PASS',
      input: 'GET cache:bnpl:limit:usr_88412 -> HIT (TTL remaining: 184s)',
      rule: 'BR-03: Serve directly from L2 Redis cache on HIT (p99 < 4ms)',
      mutation: 'Cache HIT • Zero database load',
      output: 'Return Cached Payload (3.2ms)'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Skipped cache lookup because request was rate-limited at Stage 2',
      rule: 'Zero downstream resource consumption',
      mutation: 'No cache or DB call made',
      output: 'Return 429 response headers'
    },
    error: {
      status: 'WARN',
      input: 'Cache MISS on expired hot key + 500 concurrent threads arriving simultaneously',
      rule: 'BR-04: Singleflight coalesces 500 concurrent misses into exactly 1 database query',
      mutation: '1 leader thread queries DB • 499 follower threads await shared promise',
      output: 'Execute Single Coalesced DB Query'
    }
  },
  {
    id: 'step-4',
    stage: '4. Origin DB & Jittered TTL',
    actor: 'Read Replica DB & Cache Writer',
    component: 'Cache Repopulation with Jitter',
    summary: 'Fetch from read replica on miss & write back to Redis with randomized TTL jitter',
    happy: {
      status: 'PASS',
      input: 'Origin DB bypassed (Served 100% from Redis L2 Cache)',
      rule: 'Keep origin database CPU < 15% during peak traffic',
      mutation: 'Origin DB queries = 0',
      output: 'Proceed to Client Response'
    },
    edge: {
      status: 'SKIPPED',
      input: 'Origin DB bypassed (Blocked at Edge Rate Limiter)',
      rule: 'Origin DB completely isolated from tenant burst',
      mutation: 'Origin DB queries = 0',
      output: 'Proceed to 429 Client Response'
    },
    error: {
      status: 'PASS',
      input: 'Leader thread fetched row in 11ms -> SET cache:hot_key EX (300 + random(0..60)s)',
      rule: 'BR-05: Add +/-20% TTL jitter so keys never expire at the exact same second',
      mutation: '1 DB query served all 500 waiting requests (99.8% DB load reduction!)',
      output: 'Broadcast Result to All 500 Coalesced Callers'
    }
  },
  {
    id: 'step-5',
    stage: '5. Response & Observability',
    actor: 'API Gateway & Grafana',
    component: 'RateLimit Headers & SLA Telemetry',
    summary: 'Return standardized X-RateLimit-* headers & record cache hit ratio',
    happy: {
      status: 'PASS',
      input: 'HTTP 200 OK | X-Cache: HIT | X-RateLimit-Limit: 100 | X-RateLimit-Remaining: 82',
      rule: 'Sub-5ms p99 latency achieved via Cache-Aside',
      mutation: 'Metrics emitted: cache_hit_ratio = 98.4%',
      output: '200 OK — Ultra-Low Latency Cache Hit!'
    },
    edge: {
      status: 'BLOCKED',
      input: 'HTTP 429 | Retry-After: 2 | X-RateLimit-Reset: 1762001402',
      rule: 'Client SDK reads Retry-After header and backs off automatically',
      mutation: 'No noisy neighbor impact on other merchants',
      output: '429 Rate Limited — Tenant Isolation Verified!'
    },
    error: {
      status: 'PASS',
      input: 'HTTP 200 OK (500 coalesced callers) | X-Singleflight: SHARED | DB Queries: 1',
      rule: 'Cache Stampede completely neutralized by Singleflight + TTL Jitter',
      mutation: 'Zero DB connection pool exhaustion',
      output: '200 OK — Cache Stampede Neutralized!'
    }
  }
]

export const buildSimulationModel = (card, columnTitle = 'Usage Limit', presetOverride = null) => {
  const crCode = card?.crCode || 'BNPL-945'
  const title = card?.title || 'Usage Limit - Monthly 1 time synchronized update for user'
  const activePreset = presetOverride && SIMULATION_PRESET_KEYS.includes(presetOverride)
    ? presetOverride
    : detectSimulationPreset(card, columnTitle)

  switch (activePreset) {
  case 'idempotent-payment':
    return buildIdempotentPaymentSteps(crCode)
  case 'ekyc-circuit-breaker':
    return buildEkycCircuitBreakerSteps(crCode)
  case 'auto-debit-dlq':
    return buildAutoDebitDlqSteps(crCode)
  case 'rate-limited-api':
    return buildRateLimitedApiSteps(crCode)
  case 'usage-limit-lock':
  default:
    return buildUsageLimitLockSteps(crCode, title, columnTitle)
  }
}
