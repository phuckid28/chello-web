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
