// CR Assistant — suggests BA subtasks / acceptance checkpoints for a CR.
// Currently powered by a local rule engine (works offline, no API key). The async signature of
// `requestSubtaskSuggestions` is intentionally kept so an AI provider can replace it later
// without touching the UI.

const BASE_RULE_ID = 'base'

// Each rule: keywords (regex tested on title + description + note) → localized subtasks
const RULES = [
  {
    id: BASE_RULE_ID,
    test: () => true,
    tasks: [
      {
        key: 'clarify',
        vi: 'Làm rõ yêu cầu & phạm vi CR với stakeholder',
        en: 'Clarify requirement & CR scope with stakeholders',
        ja: 'ステークホルダーと要件・CR スコープを明確化',
        ko: '이해관계자와 요구사항 및 CR 범위 명확화'
      },
      {
        key: 'impact',
        vi: 'Phân tích impact lên các module / hệ thống liên quan',
        en: 'Impact analysis on related modules / systems',
        ja: '関連モジュール・システムへの影響分析',
        ko: '관련 모듈 / 시스템 영향도 분석'
      },
      {
        key: 'frd',
        vi: 'Viết / cập nhật FRD (Business Rules, Flow, Acceptance Criteria)',
        en: 'Write / update FRD (Business Rules, Flow, Acceptance Criteria)',
        ja: 'FRD 作成・更新（Business Rules・Flow・Acceptance Criteria）',
        ko: 'FRD 작성 / 업데이트 (Business Rules, Flow, Acceptance Criteria)'
      },
      {
        key: 'review',
        vi: 'Review FRD cùng Dev & QA, chốt estimate',
        en: 'Walk through FRD with Dev & QA, confirm estimate',
        ja: 'Dev・QA と FRD レビュー、見積もり確定',
        ko: 'Dev & QA 와 FRD 리뷰 및 estimate 확정'
      },
      {
        key: 'uat',
        vi: 'Chuẩn bị test case UAT & dữ liệu test',
        en: 'Prepare UAT test cases & test data',
        ja: 'UAT テストケースとテストデータの準備',
        ko: 'UAT 테스트 케이스 및 테스트 데이터 준비'
      },
      {
        key: 'signoff',
        vi: 'UAT sign-off & cập nhật release note',
        en: 'UAT sign-off & update release note',
        ja: 'UAT 承認とリリースノート更新',
        ko: 'UAT sign-off 및 release note 업데이트'
      }
    ]
  },
  {
    id: 'api',
    test: (s) => /\b(api|endpoint|integration|tích hợp|webhook|gateway|callback)\b/i.test(s),
    tasks: [{
      key: 'api-contract',
      vi: 'Định nghĩa API contract, mã lỗi & timeout/retry',
      en: 'Define API contract, error codes & timeout/retry policy',
      ja: 'API 契約・エラーコード・タイムアウト/リトライ方針の定義',
      ko: 'API contract, 에러 코드 및 timeout/retry 정책 정의'
    }]
  },
  {
    id: 'ui',
    test: (s) => /(\bui\b|\bux\b|màn hình|screen|giao diện|popup|form|wireframe|mockup|button)/i.test(s),
    tasks: [{
      key: 'ui-mockup',
      vi: 'Vẽ wireframe / mockup & mô tả trạng thái màn hình',
      en: 'Draft wireframe / mockup & describe screen states',
      ja: 'ワイヤーフレーム/モックアップ作成と画面状態の記述',
      ko: '와이어프레임 / 목업 작성 및 화면 상태 정의'
    }]
  },
  {
    id: 'notification',
    test: (s) => /(notif|thông báo|email|sms|push|otp|zalo)/i.test(s),
    tasks: [{
      key: 'noti-template',
      vi: 'Chốt nội dung template thông báo (Email / SMS / Push)',
      en: 'Finalize notification templates (Email / SMS / Push)',
      ja: '通知テンプレート（Email / SMS / Push）の確定',
      ko: '알림 템플릿 (Email / SMS / Push) 확정'
    }]
  },
  {
    id: 'limit',
    test: (s) => /(limit|quota|hạn mức|threshold|ngưỡng|giới hạn)/i.test(s),
    tasks: [{
      key: 'limit-boundary',
      vi: 'Liệt kê boundary case (đúng ngưỡng, vượt ngưỡng, reset kỳ)',
      en: 'List boundary cases (at limit, over limit, period reset)',
      ja: '境界ケースの洗い出し（上限ちょうど・超過・期間リセット）',
      ko: '경계 케이스 정리 (한도 도달, 초과, 기간 리셋)'
    }]
  },
  {
    id: 'payment',
    test: (s) => /(payment|thanh toán|bnpl|refund|hoàn tiền|transaction|giao dịch|credit|tín dụng)/i.test(s),
    tasks: [{
      key: 'payment-recon',
      vi: 'Xác định luồng đối soát, rollback & idempotency giao dịch',
      en: 'Define reconciliation, rollback & transaction idempotency',
      ja: '照合・ロールバック・取引の冪等性を定義',
      ko: '대사, 롤백 및 거래 멱등성 정의'
    }]
  },
  {
    id: 'report',
    test: (s) => /(report|báo cáo|excel|export|xuất file|dashboard|thống kê)/i.test(s),
    tasks: [{
      key: 'report-mapping',
      vi: 'Mapping cột báo cáo, công thức & nguồn dữ liệu',
      en: 'Map report columns, formulas & data sources',
      ja: 'レポート列・計算式・データソースのマッピング',
      ko: '보고서 컬럼, 계산식 및 데이터 소스 매핑'
    }]
  },
  {
    id: 'data',
    test: (s) => /(migration|migrate|dữ liệu cũ|data fix|backfill|đồng bộ|sync|batch|job)/i.test(s),
    tasks: [{
      key: 'data-plan',
      vi: 'Lập kế hoạch đồng bộ / migrate dữ liệu & phương án rollback',
      en: 'Plan data sync / migration & rollback strategy',
      ja: 'データ同期/移行計画とロールバック方針の策定',
      ko: '데이터 동기화 / 마이그레이션 계획 및 롤백 전략 수립'
    }]
  },
  {
    id: 'permission',
    test: (s) => /(permission|role|quyền|phân quyền|rbac|admin|approve|phê duyệt)/i.test(s),
    tasks: [{
      key: 'permission-matrix',
      vi: 'Lập ma trận phân quyền (role × hành động)',
      en: 'Build permission matrix (role × action)',
      ja: '権限マトリクス（ロール × 操作）の作成',
      ko: '권한 매트릭스 (역할 × 동작) 작성'
    }]
  }
]

const normalize = (s) => String(s || '').trim().toLowerCase()

export const suggestSubtasksLocally = (card, { lang = 'vi' } = {}) => {
  const corpus = [card?.title, card?.description, card?.note].filter(Boolean).join(' \n ')
  const existing = (card?.checklist || []).map(i => normalize(i.title))
  const isDuplicate = (text) => existing.some(e => e && (e.includes(normalize(text)) || normalize(text).includes(e)))

  const contextual = RULES.filter(r => r.id !== BASE_RULE_ID && r.test(corpus))
  const base = RULES.find(r => r.id === BASE_RULE_ID)

  return [...contextual, base]
    .flatMap(rule => rule.tasks.map(task => ({
      key: task.key,
      ruleId: rule.id,
      title: task[lang] || task.en
    })))
    .filter(s => !isDuplicate(s.title))
}

export const requestSubtaskSuggestions = async (card, options = {}) => {
  return suggestSubtasksLocally(card, options)
}
