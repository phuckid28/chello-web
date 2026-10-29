// Business Analyst (BA) Sprint CR Excel Exporter, Deadline Analyzer & FRD File Downloader

export const DEFAULT_SPRINT_CONFIG = {
  name: 'Sprint 34',
  startDate: '22/10/2026',
  endDate: '05/11/2026',
  goal: 'Theo dõi CR, tài liệu FRD & nghiệm thu UAT kỳ Sprint 34 (chu kỳ 2 tuần)'
}

export const BA_STATUS_OPTIONS = [
  { value: 'In Analysis', label: '🔍 In Analysis (Đang phân tích)', color: '#38bdf8' },
  { value: 'FRD Review', label: '📝 FRD Review (Chờ duyệt FRD)', color: '#818cf8' },
  { value: 'In Dev', label: '⚙️ In Dev (Đang phát triển)', color: '#f59e0b' },
  { value: 'In SIT/UAT', label: '🧪 In SIT/UAT (Đang kiểm thử)', color: '#ec4899' },
  { value: 'Done', label: '✅ Done (Hoàn thành / Golive)', color: '#10b981' },
  { value: 'Blocked', label: '⛔ Blocked (Đang vướng mắc)', color: '#ef4444' }
]

export const formatDateVN = (dateInput) => {
  if (!dateInput) return ''
  // Already in DD/MM/YYYY format
  if (typeof dateInput === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput.trim())) {
    return dateInput.trim()
  }
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return String(dateInput)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const parseDeadlineTimestamp = (card) => {
  if (!card) return null
  if (card.deadline) {
    // Support YYYY-MM-DD or DD/MM/YYYY
    const str = String(card.deadline).trim()
    const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (dmyMatch) {
      const [, dd, mm, yyyy] = dmyMatch
      return new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T23:59:59`).getTime()
    }
    const parsed = new Date(`${str}T23:59:59`).getTime()
    if (!Number.isNaN(parsed)) return parsed
  }
  if (card.dueDate) {
    const parsed = new Date(card.dueDate).getTime()
    if (!Number.isNaN(parsed)) return parsed
  }
  return null
}

export const getDeadlineStatus = (card) => {
  const isDone = Boolean(card?.isCompleted || card?.baStatus === 'Done')
  const ts = parseDeadlineTimestamp(card)

  if (!ts) {
    return {
      code: isDone ? 'done' : 'none',
      label: isDone ? 'Hoàn thành' : 'Chưa đặt hạn',
      shortLabel: isDone ? 'Done' : 'No Deadline',
      color: isDone ? '#10b981' : '#64748b',
      bgColor: isDone ? 'rgba(16, 185, 129, 0.16)' : 'rgba(100, 116, 139, 0.14)',
      daysLeft: null,
      formattedDate: ''
    }
  }

  const formattedDate = formatDateVN(ts)
  if (isDone) {
    return {
      code: 'done',
      label: `Hoàn thành (${formattedDate})`,
      shortLabel: `${formattedDate} • Done`,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.18)',
      daysLeft: 0,
      formattedDate
    }
  }

  const now = Date.now()
  const diffDays = Math.ceil((ts - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays)
    return {
      code: 'overdue',
      label: `Quá hạn ${overdueDays} ngày (${formattedDate})`,
      shortLabel: `Quá hạn ${overdueDays}d • ${formattedDate}`,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.20)',
      daysLeft: diffDays,
      formattedDate
    }
  }

  if (diffDays <= 2) {
    return {
      code: 'due-soon',
      label: diffDays === 0 ? `Hạn hôm nay (${formattedDate})` : `Sắp đến hạn còn ${diffDays} ngày (${formattedDate})`,
      shortLabel: diffDays === 0 ? `Hôm nay • ${formattedDate}` : `Còn ${diffDays}d • ${formattedDate}`,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.20)',
      daysLeft: diffDays,
      formattedDate
    }
  }

  return {
    code: 'on-track',
    label: `Đúng tiến độ • Còn ${diffDays} ngày (${formattedDate})`,
    shortLabel: `${formattedDate} (${diffDays}d)`,
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.16)',
    daysLeft: diffDays,
    formattedDate
  }
}

const escapeHtml = (str) => {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const collectBoardCardsWithColumn = (board) => {
  if (!board?.columns) return []
  const rows = []
  let autoIndex = 1

  board.columns.forEach(col => {
    const cards = (col.cards || []).filter(c => !c.FE_PlaceholderCard)
    cards.forEach(card => {
      rows.push({
        index: autoIndex++,
        card,
        columnTitle: col.title || 'Backlog'
      })
    })
  })
  return rows
}

export const exportSprintCrsToExcel = (board, filterSprint = '') => {
  if (!board) return
  const sprintConfig = board.sprintConfig || DEFAULT_SPRINT_CONFIG
  const sprintName = sprintConfig.name || 'Sprint 34'
  const startDate = sprintConfig.startDate || '22/10/2026'
  const endDate = sprintConfig.endDate || '05/11/2026'
  const updatedToDate = formatDateVN(new Date())

  const allItems = collectBoardCardsWithColumn(board)
  const filteredItems = filterSprint
    ? allItems.filter(({ card }) => (card.sprint || sprintName).toLowerCase() === filterSprint.toLowerCase())
    : allItems

  const tableRowsHtml = filteredItems.map(({ index, card, columnTitle }) => {
    const crCode = card.crCode?.trim() || `CR-${index}`
    const cardSprint = card.sprint?.trim() || sprintName
    const assignee = card.assignee?.trim() || board.owners?.[0]?.displayName || 'Chưa phân công'
    const statusText = card.baStatus ? `${card.baStatus} (${columnTitle})` : columnTitle
    const dlStatus = getDeadlineStatus(card)
    const checklist = card.checklist || []
    const doneTasks = checklist.filter(i => i.isCompleted).length
    const checklistSummary = checklist.length > 0 ? `[Subtasks: ${doneTasks}/${checklist.length}] ` : ''
    const frdNames = (card.frdDocuments || []).map(f => f.name).join(', ')
    const frdSummary = frdNames ? `[FRD: ${frdNames}] ` : ''
    const finalNote = `${ card.note ? card.note + ' ' : '' }${frdSummary}${checklistSummary}`.trim()

    let statusBg = '#f8fafc'
    let statusColor = '#0f172a'
    if (dlStatus.code === 'overdue') {
      statusBg = '#fee2e2'
      statusColor = '#991b1b'
    } else if (dlStatus.code === 'due-soon') {
      statusBg = '#fef3c7'
      statusColor = '#92400e'
    } else if (dlStatus.code === 'done') {
      statusBg = '#d1fae5'
      statusColor = '#065f46'
    }

    return `
      <tr>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;">${index}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;font-weight:bold;color:#1e3a8a;">${escapeHtml(cardSprint)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;">${escapeHtml(startDate)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;">${escapeHtml(endDate)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;color:#0369a1;">${escapeHtml(updatedToDate)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;font-weight:bold;background:#eff6ff;color:#1d4ed8;">${escapeHtml(crCode)}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;">${escapeHtml(card.title)}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;">${escapeHtml(assignee)}</td>
        <td style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;">${escapeHtml(statusText)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:8px;background:${statusBg};color:${statusColor};font-weight:bold;">
          ${escapeHtml(dlStatus.formattedDate || 'Chưa đặt hạn')} (${escapeHtml(dlStatus.label)})
        </td>
        <td style="border:1px solid #cbd5e1;padding:8px;">${escapeHtml(finalNote || '—')}</td>
      </tr>
    `
  }).join('')

  const workbookHtml = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>${escapeHtml(sprintName)} CR Report</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
  </head>
  <body style="font-family:Segoe UI, Arial, sans-serif; font-size:11pt;">
    <table style="border-collapse:collapse; width:100%;">
      <tr>
        <td colspan="11" style="background:#0f172a;color:#ffffff;font-size:15pt;font-weight:bold;padding:12px;text-align:left;">
          BÁO CÁO THEO DÕI CHANGE REQUEST (CR) &amp; TIẾN ĐỘ BA — ${escapeHtml(board.title?.toUpperCase())}
        </td>
      </tr>
      <tr>
        <td colspan="11" style="background:#e0f2fe;color:#0c4a6e;font-size:11pt;font-weight:bold;padding:8px;">
          Kỳ Sprint: ${escapeHtml(sprintName)} | Thời gian: ${escapeHtml(startDate)} - ${escapeHtml(endDate)} (2 tuần) | Cập nhật tới ngày: ${escapeHtml(updatedToDate)} | Tổng số CR: ${filteredItems.length}
        </td>
      </tr>
      <tr style="background:#1e293b;color:#ffffff;font-weight:bold;text-align:center;">
        <th style="border:1px solid #475569;padding:10px;width:50px;">STT</th>
        <th style="border:1px solid #475569;padding:10px;width:110px;">Kỳ Sprint</th>
        <th style="border:1px solid #475569;padding:10px;width:120px;">Thời gian bắt đầu</th>
        <th style="border:1px solid #475569;padding:10px;width:120px;">Thời gian kết thúc</th>
        <th style="border:1px solid #475569;padding:10px;width:130px;">Cập nhật tới ngày</th>
        <th style="border:1px solid #475569;padding:10px;width:110px;">Mã CR</th>
        <th style="border:1px solid #475569;padding:10px;width:280px;">Tên CR</th>
        <th style="border:1px solid #475569;padding:10px;width:160px;">Người phụ trách</th>
        <th style="border:1px solid #475569;padding:10px;width:170px;">Trạng thái (Status)</th>
        <th style="border:1px solid #475569;padding:10px;width:210px;">Deadline &amp; Cảnh báo</th>
        <th style="border:1px solid #475569;padding:10px;width:320px;">Note cần thiết (BA / FRD / Subtasks)</th>
      </tr>
      ${tableRowsHtml}
    </table>
  </body>
</html>`

  const blob = new Blob([workbookHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeSprint = sprintName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const safeDate = updatedToDate.replace(/\//g, '-')
  link.href = url
  link.download = `BA_CR_Report_${safeSprint}_Updated_${safeDate}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadAttachedFrdFile = (frdDoc) => {
  if (!frdDoc) return
  const content = frdDoc.content || ''
  let linkHref = ''
  let shouldRevoke = false

  if (content.startsWith('data:')) {
    linkHref = content
  } else {
    const mimeType = frdDoc.type || 'text/markdown;charset=utf-8;'
    const blob = new Blob([content], { type: mimeType })
    linkHref = URL.createObjectURL(blob)
    shouldRevoke = true
  }

  const link = document.createElement('a')
  link.href = linkHref
  link.download = frdDoc.name || 'FRD_Document.md'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  if (shouldRevoke) {
    URL.revokeObjectURL(linkHref)
  }
}

export const exportCardAsFrdMarkdown = (card, sprintName = 'Sprint 34') => {
  if (!card) return
  const crCode = card.crCode || 'CR-001'
  const dl = getDeadlineStatus(card)
  const checklistMd = (card.checklist || [])
    .map(item => `- [${item.isCompleted ? 'x' : ' '}] ${item.title}`)
    .join('\n')

  const mdContent = [
    `# [${crCode}] ${card.title}`,
    '',
    `- **Mã CR**: ${crCode}`,
    `- **Kỳ Sprint**: ${card.sprint || sprintName}`,
    `- **Người phụ trách (PIC)**: ${card.assignee || 'Chưa phân công'}`,
    `- **Trạng thái (Status)**: ${card.baStatus || 'In Analysis'}`,
    `- **Deadline**: ${dl.formattedDate || 'Chưa đặt hạn'} (${dl.label})`,
    `- **Ghi chú BA (Note)**: ${card.note || 'Không có'}`,
    '',
    '---',
    '',
    '## Đặc tả Yêu cầu Nghiệp vụ (FRD Specification)',
    '',
    card.description || '_Chưa có nội dung đặc tả chi tiết._',
    '',
    '---',
    '',
    '## Danh sách Subtasks / Acceptance Criteria',
    checklistMd || '- [ ] Hoàn thiện nghiệm thu UAT'
  ].join('\n')

  downloadAttachedFrdFile({
    name: `FRD_${crCode.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`,
    type: 'text/markdown;charset=utf-8;',
    content: mdContent
  })
}

export const GENERATE_BA_FRD_TEMPLATE = (crCode = 'BNPL-1', title = 'Tên Change Request') => [
  `# FRD [${crCode}]: ${title}`,
  '',
  '## 1. Tổng quan & Mục tiêu thay đổi (Business Context & Objective)',
  '- **Bối cảnh hiện tại (As-Is)**: Mô tả luồng hiện hành và điểm nghẽn nghiệp vụ.',
  '- **Mục tiêu thay đổi (To-Be)**: Nâng cấp luồng xử lý tự động, giảm thời gian thao tác và kiểm soát rủi ro.',
  '- **Phạm vi ảnh hưởng (Impacted Systems)**: Mobile App, API Gateway, Core Service, Đối soát (Reconciliation).',
  '',
  '## 2. Tác nhân & Phân quyền (Actors & Permissions)',
  '| Actor | Vai trò | Quyền hạn trên hệ thống |',
  '| :--- | :--- | :--- |',
  '| Khách hàng (End User) | Khởi tạo yêu cầu | Xem hạn mức, gửi đăng ký, xác nhận OTP |',
  '| Hệ thống Core / Risk | Xử lý tự động | Kiểm tra điều kiện BR, phê duyệt hoặc từ chối |',
  '| Vận hành / Admin | Giám sát & Hậu kiểm | Tra cứu lịch sử giao dịch, xuất báo cáo đối soát |',
  '',
  '## 3. Quy tắc nghiệp vụ (Business Rules)',
  '- **BR-01 (Kiểm tra điều kiện)**: Khách hàng phải có trạng thái tài khoản `ACTIVE` và hoàn tất eKYC.',
  '- **BR-02 (Xử lý ngoại lệ & Timeout)**: Nếu đối tác phản hồi quá 30 giây, chuyển trạng thái giao dịch sang `PENDING_RECONCILE`.',
  '- **BR-03 (Audit & Logging)**: Lưu đầy đủ lịch sử thay đổi trạng thái kèm mã giao dịch tham chiếu.',
  '',
  '## 4. Mô hình hóa Luồng xử lý (System Sequence / Flow)',
  '```mermaid',
  'sequenceDiagram',
  '  actor User as Khách hàng',
  '  participant Client as Web/App',
  '  participant API as Core Service',
  '  participant DB as Database',
  '  User->>Client: Gửi yêu cầu nghiệp vụ',
  '  Client->>API: POST /v1/transactions',
  '  API->>DB: Kiểm tra Business Rules (BR-01, BR-02)',
  '  DB-->>API: Hợp lệ',
  '  API-->>Client: Trả kết quả thành công (200 OK)',
  '```',
  '',
  '## 5. Đặc tả Dữ liệu & Trường thông tin (Data Dictionary)',
  '| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả & Ràng buộc |',
  '| :--- | :--- | :---: | :--- |',
  '| `requestId` | `String (UUID)` | Có | Mã định danh duy nhất của yêu cầu |',
  '| `amount` | `Decimal(18,2)` | Có | Số tiền giao dịch (`> 0`) |',
  '| `status` | `Enum` | Có | `INIT`, `PROCESSING`, `SUCCESS`, `FAILED` |',
  '',
  '## 6. Tiêu chí nghiệm thu (UAT Acceptance Criteria)',
  '- **AC-01 (Happy Case)**: Thực hiện luồng thành công từ đầu đến cuối và cập nhật đúng trạng thái DB.',
  '- **AC-02 (Validation Case)**: Hiển thị đúng mã lỗi khi vi phạm `BR-01` hoặc thiếu trường bắt buộc.',
  '- **AC-03 (Edge Case)**: Không phát sinh giao dịch trùng lặp (Idempotency) khi người dùng bấm đúp.'
].join('\n')
