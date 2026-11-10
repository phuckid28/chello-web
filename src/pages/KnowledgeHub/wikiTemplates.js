// Starter templates for Knowledge Hub pages (Confluence-style). Vietnamese & English bodies;
// Japanese / Korean users get the English body with technical headings that read naturally.

const TEMPLATES = {
  blank: {
    icon: '📄',
    titleKey: 'tplBlank',
    body: { vi: '', en: '' }
  },
  meeting: {
    icon: '🗓️',
    titleKey: 'tplMeeting',
    body: {
      vi: [
        '## 📌 Thông tin cuộc họp',
        '- **Ngày**: {date}',
        '- **Sprint**: {sprint}',
        '- **Thành phần**: ',
        '',
        '## 🎯 Mục tiêu',
        '- ',
        '',
        '## 📝 Nội dung thảo luận',
        '1. ',
        '',
        '## ✅ Kết luận & Action items',
        '- [ ] Việc cần làm — @người phụ trách — hạn',
        '',
        '## 🔗 CR liên quan',
        '- [[{crCode}]]'
      ].join('\n'),
      en: [
        '## 📌 Meeting info',
        '- **Date**: {date}',
        '- **Sprint**: {sprint}',
        '- **Attendees**: ',
        '',
        '## 🎯 Goals',
        '- ',
        '',
        '## 📝 Discussion',
        '1. ',
        '',
        '## ✅ Decisions & Action items',
        '- [ ] Task — @owner — due date',
        '',
        '## 🔗 Related CRs',
        '- [[{crCode}]]'
      ].join('\n')
    }
  },
  requirement: {
    icon: '📐',
    titleKey: 'tplRequirement',
    body: {
      vi: [
        '## 1. Bối cảnh & Mục tiêu',
        '- **CR**: [[{crCode}]]',
        '- **Vấn đề hiện tại**: ',
        '- **Giá trị mang lại**: ',
        '',
        '## 2. Phạm vi',
        '| Trong phạm vi | Ngoài phạm vi |',
        '| --- | --- |',
        '|  |  |',
        '',
        '## 3. Business Rules',
        '- **BR-01**: ',
        '',
        '## 4. Luồng nghiệp vụ (Flow)',
        '```mermaid',
        'sequenceDiagram',
        '  actor User',
        '  participant System',
        '  User->>System: Request',
        '  System-->>User: Response',
        '```',
        '',
        '## 5. Acceptance Criteria',
        '- [ ] Given ... When ... Then ...',
        '',
        '## 6. Câu hỏi mở',
        '- '
      ].join('\n'),
      en: [
        '## 1. Context & Goals',
        '- **CR**: [[{crCode}]]',
        '- **Current problem**: ',
        '- **Business value**: ',
        '',
        '## 2. Scope',
        '| In scope | Out of scope |',
        '| --- | --- |',
        '|  |  |',
        '',
        '## 3. Business Rules',
        '- **BR-01**: ',
        '',
        '## 4. Business Flow',
        '```mermaid',
        'sequenceDiagram',
        '  actor User',
        '  participant System',
        '  User->>System: Request',
        '  System-->>User: Response',
        '```',
        '',
        '## 5. Acceptance Criteria',
        '- [ ] Given ... When ... Then ...',
        '',
        '## 6. Open questions',
        '- '
      ].join('\n')
    }
  },
  decision: {
    icon: '⚖️',
    titleKey: 'tplDecision',
    body: {
      vi: [
        '## Trạng thái',
        'Đề xuất / **Đã chốt** / Thay thế',
        '',
        '## Bối cảnh',
        'Vấn đề cần quyết định là gì? Liên quan tới [[{crCode}]].',
        '',
        '## Các phương án đã cân nhắc',
        '| Phương án | Ưu điểm | Nhược điểm |',
        '| --- | --- | --- |',
        '| A |  |  |',
        '| B |  |  |',
        '',
        '## Quyết định',
        '',
        '## Hệ quả',
        '- '
      ].join('\n'),
      en: [
        '## Status',
        'Proposed / **Accepted** / Superseded',
        '',
        '## Context',
        'What needs to be decided? Related to [[{crCode}]].',
        '',
        '## Options considered',
        '| Option | Pros | Cons |',
        '| --- | --- | --- |',
        '| A |  |  |',
        '| B |  |  |',
        '',
        '## Decision',
        '',
        '## Consequences',
        '- '
      ].join('\n')
    }
  },
  glossary: {
    icon: '📚',
    titleKey: 'tplGlossary',
    body: {
      vi: '| Thuật ngữ | Định nghĩa | Ghi chú |\n| --- | --- | --- |\n| BNPL | Buy Now Pay Later — mua trước trả sau |  |\n| Usage Limit | Hạn mức sử dụng của khách hàng |  |',
      en: '| Term | Definition | Notes |\n| --- | --- | --- |\n| BNPL | Buy Now Pay Later |  |\n| Usage Limit | Customer spending limit |  |'
    }
  },
  retro: {
    icon: '🔁',
    titleKey: 'tplRetro',
    body: {
      vi: '## 🌟 Điều làm tốt\n- \n\n## 🧩 Điều cần cải thiện\n- \n\n## 💡 Ý tưởng thử nghiệm Sprint sau\n- \n\n## ✅ Action items\n- [ ] ',
      en: '## 🌟 What went well\n- \n\n## 🧩 What to improve\n- \n\n## 💡 Experiments for next Sprint\n- \n\n## ✅ Action items\n- [ ] '
    }
  },
  release: {
    icon: '🚀',
    titleKey: 'tplRelease',
    body: {
      vi: '## Phiên bản\n- **Sprint**: {sprint}\n- **Ngày phát hành**: {date}\n\n## Tính năng mới\n- [[{crCode}]] — \n\n## Sửa lỗi\n- \n\n## Lưu ý triển khai\n- ',
      en: '## Version\n- **Sprint**: {sprint}\n- **Release date**: {date}\n\n## New features\n- [[{crCode}]] — \n\n## Bug fixes\n- \n\n## Deployment notes\n- '
    }
  },
  systemArch: {
    icon: '🏛️',
    titleKey: 'tplSystemArch',
    body: {
      vi: [
        '## 1. Tổng quan Kiến trúc (System Design 101)',
        '- **CR liên quan**: [[{crCode}]] ({sprint})',
        '- **Mẫu thiết kế áp dụng**: Distributed Lock / Circuit Breaker / Transactional Outbox',
        '- **SLA mục tiêu**: Latency p99 < 300ms • Availability >= 99.95%',
        '',
        '## 2. Sơ đồ Luồng Tuần tự (Sequence Blueprint)',
        '```mermaid',
        'sequenceDiagram',
        '  autonumber',
        '  actor Client',
        '  participant Gateway as API Gateway',
        '  participant Redis as Redis Lock / Cache',
        '  participant Service as Core Service',
        '  participant DB as Core Ledger DB',
        '  Client->>Gateway: POST /v1/action (Idempotency-Key)',
        '  Gateway->>Redis: SET lock_key NX PX 30000',
        '  Redis-->>Gateway: OK (Lock Acquired)',
        '  Gateway->>Service: Execute Business Rule',
        '  Service->>DB: Atomic Transaction + Outbox Event',
        '  DB-->>Service: Commit OK',
        '  Service-->>Client: 200 OK (Synchronized)',
        '```',
        '',
        '## 3. Chiến lược Chịu lỗi & Phục hồi (Resilience & Failure Modes)',
        '| Kịch bản lỗi | Cơ chế bảo vệ | Hành vi Rollback / Fallback |',
        '| --- | --- | --- |',
        '| Race Condition (2 request song song) | Redis `SETNX` + Fencing Token | Chặn luồng thứ 2 với `409/429` |',
        '| Đối tác thứ 3 phản hồi chậm (>1.5s) | Circuit Breaker (`OPEN` 30s) | Chuyển sang hàng đợi Fallback / Degraded Mode |',
        '| Timeout DB khi đang ghi | Atomic Rollback + Giải phóng Lock | Không trừ hạn mức, cho phép Retry an toàn |'
      ].join('\n'),
      en: [
        '## 1. Architecture Overview (System Design 101)',
        '- **Related CR**: [[{crCode}]] ({sprint})',
        '- **Applied Patterns**: Distributed Lock / Circuit Breaker / Transactional Outbox',
        '- **Target SLA**: Latency p99 < 300ms • Availability >= 99.95%',
        '',
        '## 2. Sequence Blueprint',
        '```mermaid',
        'sequenceDiagram',
        '  autonumber',
        '  actor Client',
        '  participant Gateway as API Gateway',
        '  participant Redis as Redis Lock / Cache',
        '  participant Service as Core Service',
        '  participant DB as Core Ledger DB',
        '  Client->>Gateway: POST /v1/action (Idempotency-Key)',
        '  Gateway->>Redis: SET lock_key NX PX 30000',
        '  Redis-->>Gateway: OK (Lock Acquired)',
        '  Gateway->>Service: Execute Business Rule',
        '  Service->>DB: Atomic Transaction + Outbox Event',
        '  DB-->>Service: Commit OK',
        '  Service-->>Client: 200 OK (Synchronized)',
        '```',
        '',
        '## 3. Resilience & Failure Modes',
        '| Failure Mode | Protection Pattern | Rollback / Fallback Behavior |',
        '| --- | --- | --- |',
        '| Concurrent duplicate requests | Redis `SETNX` + Fencing Token | Reject 2nd thread with `409/429` |',
        '| Upstream partner latency (>1.5s) | Circuit Breaker (`OPEN` 30s) | Route to Fallback Queue / Degraded Mode |',
        '| Database write timeout | Atomic Rollback + Lock Release | Quota preserved, safe client retry |'
      ].join('\n')
    }
  },
  apiMatrix: {
    icon: '🔌',
    titleKey: 'tplApiMatrix',
    body: {
      vi: [
        '## 1. Đặc tả Endpoint & Idempotency',
        '- **CR**: [[{crCode}]] ({sprint})',
        '- **Endpoint**: `POST /v1/bnpl/usage-limit/sync`',
        '- **Idempotency Header**: `Idempotency-Key: <UUIDv7>` (TTL: 24h)',
        '- **Rate Limit**: Token Bucket `100 req/phút/user` (`Retry-After` khi `429`)',
        '',
        '## 2. Ma trận Mã Trạng thái & Xử lý Lỗi (Error Matrix)',
        '| HTTP Status | Error Code | Nguyên nhân | Hành động phía Client / Retry |',
        '| --- | --- | --- | --- |',
        '| `200 OK` | `SYNC_COMPLETED` | Đồng bộ thành công | Cập nhật UI badge & lưu cache |',
        '| `409 Conflict` | `MONTHLY_QUOTA_REACHED` | Đã dùng hết 1 lần đồng bộ trong tháng | Không retry; hiển thị ngày đầu tháng kế tiếp |',
        '| `422 Unprocessable` | `IDEMPOTENCY_MISMATCH` | Trùng `Idempotency-Key` nhưng khác payload | Sinh `Idempotency-Key` mới |',
        '| `429 Too Many Req` | `RATE_LIMIT_EXCEEDED` | Vượt ngưỡng Token Bucket hoặc đang giữ Lock | Retry sau `Retry-After` giây |',
        '| `503 Unavailable` | `UPSTREAM_TIMEOUT` | Timeout DB / Đối tác thứ 3 | Exponential Backoff + Full Jitter (tối đa 3 lần) |'
      ].join('\n'),
      en: [
        '## 1. Endpoint & Idempotency Specification',
        '- **CR**: [[{crCode}]] ({sprint})',
        '- **Endpoint**: `POST /v1/bnpl/usage-limit/sync`',
        '- **Idempotency Header**: `Idempotency-Key: <UUIDv7>` (TTL: 24h)',
        '- **Rate Limit**: Token Bucket `100 req/min/user` (`Retry-After` on `429`)',
        '',
        '## 2. Status Code & Error Recovery Matrix',
        '| HTTP Status | Error Code | Root Cause | Client Recovery / Retry Policy |',
        '| --- | --- | --- | --- |',
        '| `200 OK` | `SYNC_COMPLETED` | Synchronized successfully | Refresh UI state & cache |',
        '| `409 Conflict` | `MONTHLY_QUOTA_REACHED` | Monthly 1-time quota already used | Do not retry; display next eligible month |',
        '| `422 Unprocessable` | `IDEMPOTENCY_MISMATCH` | Same `Idempotency-Key` with different payload | Generate a fresh `Idempotency-Key` |',
        '| `429 Too Many Req` | `RATE_LIMIT_EXCEEDED` | Token bucket empty or lock active | Backoff for `Retry-After` seconds |',
        '| `503 Unavailable` | `UPSTREAM_TIMEOUT` | DB or upstream partner timeout | Exponential Backoff + Full Jitter (max 3 attempts) |'
      ].join('\n')
    }
  }
}

export const WIKI_TEMPLATE_KEYS = Object.keys(TEMPLATES)

export const getWikiTemplate = (key) => TEMPLATES[key] || TEMPLATES.blank

export const renderWikiTemplate = (key, { lang = 'vi', sprint = 'Sprint', crCode = 'CR-1', date = '' } = {}) => {
  const tpl = getWikiTemplate(key)
  const body = tpl.body[lang] ?? tpl.body.en
  return body
    .replace(/\{sprint\}/g, sprint)
    .replace(/\{crCode\}/g, crCode)
    .replace(/\{date\}/g, date)
}
