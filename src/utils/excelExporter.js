// Sprint CR Excel (.XLS) & CSV Exporter, Resource Point Calculator, Deadline Analyzer & FRD File Manager
// Aligned 1:1 with the Sprint 34 Template (Sprint, Start date, End date, Update till, By, Status, Handle by, Resource point, Ticket ID, CR Description, Status, Handle by, Due date for dev, Dev Progress, Resource used, Note)

const ROSTER_STORAGE_KEY = 'chella_sprint_team_roster'

export const DEFAULT_TEAM_ROSTER = [
  'Lam Chi Kien',
  'Phan Nguyen Song Toan',
  'Ho Thao Dieu',
  'Nguyen Phuoc Long',
  'Nguyen Khanh Duy',
  'Hoang Vinh Son',
  'Bui Hoang Gia Phuc',
  'Vo Viet Binh'
]

export const DEFAULT_SPRINT_CONFIG = {
  name: 'Sprint 34',
  sprintNumber: '34',
  startDate: '22/10/2026',
  endDate: '05/11/2026',
  updateTill: '29/10/2026',
  updatedBy: 'Dao Thanh Phuc',
  goal: '',
  teamRoster: DEFAULT_TEAM_ROSTER
}

export const BA_STATUS_OPTIONS = [
  { value: 'Processing', label: '⚙️ Processing', color: '#38bdf8' },
  { value: 'In testing', label: '🧪 In testing', color: '#a78bfa' },
  { value: 'Blocking', label: '⛔ Blocking', color: '#ef4444' },
  { value: 'Ready for deploy', label: '🚀 Ready for deploy', color: '#f59e0b' },
  { value: 'Deployed', label: '✅ Deployed', color: '#10b981' },
  { value: 'Done testing', label: '✔️ Done testing', color: '#14b8a6' }
]

export const normalizeCrStatus = (rawStatus) => {
  if (!rawStatus) return 'Processing'
  const s = String(rawStatus).trim()
  const exact = BA_STATUS_OPTIONS.find(o => o.value.toLowerCase() === s.toLowerCase())
  if (exact) return exact.value
  if (/ready\s*for\s*deploy/i.test(s)) return 'Ready for deploy'
  if (/deploy/i.test(s) || /^done$/i.test(s)) return 'Deployed'
  if (/done\s*test/i.test(s)) return 'Done testing'
  if (/test|sit|uat/i.test(s)) return 'In testing'
  if (/block/i.test(s)) return 'Blocking'
  return 'Processing'
}

export const getStatusOption = (rawStatus) => {
  const norm = normalizeCrStatus(rawStatus)
  return BA_STATUS_OPTIONS.find(o => o.value === norm) || BA_STATUS_OPTIONS[0]
}

const normalizeRosterItem = (item) => {
  if (!item) return ''
  if (typeof item === 'string') return item.trim()
  if (typeof item === 'object' && item.name) return String(item.name).trim()
  return ''
}

const readLocalRoster = () => {
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    // localStorage may be unavailable (private mode / SSR / tests) — fall back to defaults
    return []
  }
}

// Source of truth priority: roster persisted on the board (API) → last local roster → default team.
// Members removed from the board roster stay removed (defaults are no longer force-merged back in).
export const getSavedTeamRoster = (board) => {
  const boardRoster = board?.sprintConfig?.teamRoster
  const fromBoard = Array.isArray(boardRoster) ? boardRoster.map(normalizeRosterItem).filter(Boolean) : []
  const fromLocal = readLocalRoster().map(normalizeRosterItem).filter(Boolean)
  const base = fromBoard.length ? fromBoard : (fromLocal.length ? fromLocal : DEFAULT_TEAM_ROSTER)
  return Array.from(new Set(base))
}

export const saveTeamRosterLocal = (rosterArray) => {
  try {
    const normalized = (Array.isArray(rosterArray) ? rosterArray : [])
      .map(normalizeRosterItem)
      .filter(Boolean)
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(normalized))
  } catch (e) {
    // Ignore
  }
}

export const saveTeamRoster = saveTeamRosterLocal

export const parseAssigneeList = (assigneeStr) => {
  if (!assigneeStr) return []
  return String(assigneeStr)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

export const formatDateVN = (dateInput) => {
  if (!dateInput) return ''
  if (typeof dateInput === 'string' && /^\d{1,2}\/\d{1,2}(\/\d{4})?$/.test(dateInput.trim())) {
    return dateInput.trim()
  }
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return String(dateInput)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatShortDueDate = (dateInput) => {
  if (!dateInput) return ''
  const str = String(dateInput).trim()
  // Already D/M like 5/11
  const dmMatch = str.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (dmMatch) return `${Number(dmMatch[1])}/${Number(dmMatch[2])}`
  // DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) return `${Number(dmyMatch[1])}/${Number(dmyMatch[2])}`
  // YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (ymdMatch) return `${Number(ymdMatch[3])}/${Number(ymdMatch[2])}`

  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return str
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export const parseDeadlineTimestamp = (card) => {
  if (!card) return null
  if (card.deadline) {
    const str = String(card.deadline).trim()
    const dmMatch = str.match(/^(\d{1,2})\/(\d{1,2})$/)
    if (dmMatch) {
      const [, dd, mm] = dmMatch
      const year = new Date().getFullYear()
      return new Date(`${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T23:59:59`).getTime()
    }
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

export const getCardDevProgress = (card) => {
  if (!card) return 0
  if (card.devProgress !== undefined && card.devProgress !== null && card.devProgress !== '') {
    const num = Number(card.devProgress)
    if (!Number.isNaN(num)) {
      return num > 1 ? Math.min(1, Number((num / 100).toFixed(2))) : Math.max(0, Number(num.toFixed(2)))
    }
  }
  const checklist = card.checklist || []
  if (checklist.length > 0) {
    const done = checklist.filter(i => i.isCompleted).length
    return Number((done / checklist.length).toFixed(2))
  }
  const norm = normalizeCrStatus(card.baStatus)
  if (norm === 'Ready for deploy' || norm === 'Deployed' || norm === 'Done testing') return 1
  if (norm === 'In testing') return 0.8
  if (norm === 'Processing') return 0.5
  return 0
}

export const getCardResourceUsed = (card) => {
  if (!card) return 0
  if (card.resourceUsed !== undefined && card.resourceUsed !== null && card.resourceUsed !== '') {
    const num = Number(card.resourceUsed)
    if (!Number.isNaN(num)) return num
  }
  return 0
}

export const getDeadlineStatus = (card, now = Date.now()) => {
  const normStatus = normalizeCrStatus(card?.baStatus)
  const isDone = Boolean(
    card?.isCompleted ||
    normStatus === 'Deployed' ||
    normStatus === 'Done testing' ||
    normStatus === 'Ready for deploy'
  )
  const ts = parseDeadlineTimestamp(card)

  if (!ts) {
    return {
      code: isDone ? 'done' : 'none',
      label: isDone ? 'Completed' : 'No Due Date',
      shortLabel: isDone ? 'Done' : 'No Due Date',
      color: isDone ? '#10b981' : '#64748b',
      bgColor: isDone ? 'rgba(16, 185, 129, 0.16)' : 'rgba(100, 116, 139, 0.14)',
      daysLeft: null,
      formattedDate: '',
      shortDate: ''
    }
  }

  const formattedDate = formatDateVN(ts)
  const shortDate = formatShortDueDate(card?.deadline || ts)
  if (isDone) {
    return {
      code: 'done',
      label: `${shortDate} (${normStatus})`,
      shortLabel: `${shortDate} • ${normStatus}`,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.18)',
      daysLeft: 0,
      formattedDate,
      shortDate
    }
  }

  const diffDays = Math.ceil((ts - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays)
    return {
      code: 'overdue',
      label: `Overdue ${overdueDays}d (${shortDate})`,
      shortLabel: `${shortDate} (-${overdueDays}d)`,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.20)',
      daysLeft: diffDays,
      formattedDate,
      shortDate
    }
  }

  if (diffDays <= 2) {
    return {
      code: 'due-soon',
      label: diffDays === 0 ? `Due Today (${shortDate})` : `Due in ${diffDays}d (${shortDate})`,
      shortLabel: diffDays === 0 ? `Today • ${shortDate}` : `${shortDate} (${diffDays}d)`,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.20)',
      daysLeft: diffDays,
      formattedDate,
      shortDate
    }
  }

  return {
    code: 'on-track',
    label: `Due ${shortDate} (${diffDays}d left)`,
    shortLabel: `${shortDate} (${diffDays}d)`,
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.16)',
    daysLeft: diffDays,
    formattedDate,
    shortDate
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
        columnTitle: col.title || 'General Topic'
      })
    })
  })
  return rows
}

export const computeTeamResourcePoints = (board) => {
  const roster = getSavedTeamRoster(board)
  const pointsMap = new Map()
  roster.forEach(name => pointsMap.set(name, { name, points: 0, crCount: 0 }))

  const allItems = collectBoardCardsWithColumn(board)
  allItems.forEach(({ card }) => {
    const handlers = parseAssigneeList(card.assignee)
    const resourceUsed = getCardResourceUsed(card)
    handlers.forEach(person => {
      if (!pointsMap.has(person)) {
        pointsMap.set(person, { name: person, points: 0, crCount: 0 })
      }
      const entry = pointsMap.get(person)
      entry.crCount += 1
      // Add resourceUsed if specified
      entry.points = Number((entry.points + resourceUsed).toFixed(2))
    })
  })

  return Array.from(pointsMap.values())
}

// Export styled Excel (.xls) matching the exact 2-tier layout of the user's Sprint 34 Excel template
export const exportSprintCrsToExcel = (board) => {
  if (!board) return
  const sprintConfig = board.sprintConfig || DEFAULT_SPRINT_CONFIG
  const sprintNumber = sprintConfig.sprintNumber || String(sprintConfig.name || '34').replace(/[^0-9]/g, '') || '34'
  const startDate = sprintConfig.startDate || '22/10/2026'
  const endDate = sprintConfig.endDate || '05/11/2026'
  const updateTill = sprintConfig.updateTill || formatDateVN(new Date())
  const updatedBy = sprintConfig.updatedBy || board.owners?.[0]?.displayName || 'Dao Thanh Phuc'
  const sprintNote = sprintConfig.goal || ''

  const allItems = collectBoardCardsWithColumn(board)
  const resourceRows = computeTeamResourcePoints(board)
  const statusList = BA_STATUS_OPTIONS.map(s => s.value)
  const topRowCount = Math.max(9, resourceRows.length + 1, statusList.length + 1)

  const topSummaryHtml = []
  for (let r = 0; r < topRowCount; r++) {
    let colA = ''
    let colB = ''
    if (r === 0) { colA = 'Sprint:'; colB = sprintNumber }
    else if (r === 1) { colA = 'Start date:'; colB = startDate }
    else if (r === 2) { colA = 'End date:'; colB = endDate }
    else if (r === 3) { colA = 'Update till:'; colB = updateTill }
    else if (r === 4) { colA = 'By:'; colB = updatedBy }
    else if (r === 7) { colA = 'Note'; colB = sprintNote }

    let colD = ''
    let colE = ''
    if (r === 0) {
      colD = 'Status'
      colE = statusList[0] || 'Processing'
    } else if (r <= statusList.length - 1) {
      colD = ''
      colE = statusList[r] || ''
    }

    let colG = ''
    let colH = ''
    if (r === 0) {
      colG = 'Handle by'
      colH = 'Resource point'
    } else if (r - 1 < resourceRows.length) {
      colG = resourceRows[r - 1].name
      colH = String(resourceRows[r - 1].points)
    }

    topSummaryHtml.push(`
      <tr>
        <td style="font-weight:bold;padding:4px 8px;border:1px solid #e2e8f0;background:${colA ? '#f1f5f9' : '#ffffff'};">${escapeHtml(colA)}</td>
        <td style="padding:4px 8px;border:1px solid #e2e8f0;font-weight:${r === 0 ? 'bold' : 'normal'};">${escapeHtml(colB)}</td>
        <td style="border:none;width:24px;"></td>
        <td style="font-weight:bold;padding:4px 8px;border:1px solid #e2e8f0;background:${colD ? '#e0f2fe' : '#ffffff'};">${escapeHtml(colD)}</td>
        <td style="padding:4px 8px;border:1px solid #e2e8f0;">${escapeHtml(colE)}</td>
        <td style="border:none;width:24px;"></td>
        <td style="font-weight:${r === 0 ? 'bold' : 'normal'};padding:4px 8px;border:1px solid #e2e8f0;background:${r === 0 ? '#dcfce7' : '#ffffff'};">${escapeHtml(colG)}</td>
        <td style="text-align:center;font-weight:${r === 0 ? 'bold' : 'normal'};padding:4px 8px;border:1px solid #e2e8f0;background:${r === 0 ? '#dcfce7' : '#ffffff'};">${escapeHtml(colH)}</td>
      </tr>
    `)
  }

  const crRowsHtml = allItems.map(({ index, card, columnTitle }) => {
    const ticketId = card.crCode?.trim() || `BNPL-${index}`
    const crDesc = card.columnTitle && !card.title?.includes(columnTitle)
      ? `${columnTitle} - ${card.title}`
      : card.title
    const statusText = normalizeCrStatus(card.baStatus)
    const handleBy = card.assignee?.trim() || ''
    const dueShort = formatShortDueDate(card.deadline || card.dueDate)
    const devProg = getCardDevProgress(card)
    const resUsed = getCardResourceUsed(card)
    const noteText = card.note?.trim() || ''

    return `
      <tr>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;font-weight:bold;color:#1d4ed8;">${escapeHtml(ticketId)}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;">${escapeHtml(crDesc)}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;font-weight:bold;">${escapeHtml(statusText)}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;">${escapeHtml(handleBy)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:7px 10px;">${escapeHtml(dueShort)}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:7px 10px;font-weight:bold;">${devProg}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:7px 10px;">${resUsed || ''}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;">${escapeHtml(noteText)}</td>
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
            <x:Name>Sprint ${escapeHtml(sprintNumber)}</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
  </head>
  <body style="font-family:Calibri, Segoe UI, Arial, sans-serif; font-size:11pt;">
    <table style="border-collapse:collapse;">
      ${topSummaryHtml.join('')}
      <tr><td colspan="8" style="height:18px;border:none;"></td></tr>
      <tr><td colspan="8" style="height:18px;border:none;"></td></tr>
      <tr style="background:#1e293b;color:#ffffff;font-weight:bold;text-align:left;">
        <th style="border:1px solid #334155;padding:8px 10px;width:110px;">Ticket ID</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:420px;">CR Description</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:150px;">Status</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:230px;">Handle by</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:130px;text-align:center;">Due date for dev</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:115px;text-align:center;">Dev Progress</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:120px;text-align:center;">Resource used</th>
        <th style="border:1px solid #334155;padding:8px 10px;width:280px;">Note</th>
      </tr>
      ${crRowsHtml}
    </table>
  </body>
</html>`

  const blob = new Blob([workbookHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeDate = updateTill.replace(/\//g, '-')
  link.href = url
  link.download = `Sprint_${sprintNumber}_CR_Tracking_${safeDate}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const escapeCsvCell = (val) => {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

// Export raw CSV matching the exact template format shared by the user
export const exportSprintCrsToCsv = (board) => {
  if (!board) return
  const sprintConfig = board.sprintConfig || DEFAULT_SPRINT_CONFIG
  const sprintNumber = sprintConfig.sprintNumber || String(sprintConfig.name || '34').replace(/[^0-9]/g, '') || '34'
  const startDate = sprintConfig.startDate || '22/10/2026'
  const endDate = sprintConfig.endDate || '05/11/2026'
  const updateTill = sprintConfig.updateTill || formatDateVN(new Date())
  const updatedBy = sprintConfig.updatedBy || 'Dao Thanh Phuc'
  const sprintNote = sprintConfig.goal || ''

  const resourceRows = computeTeamResourcePoints(board)
  const statusList = BA_STATUS_OPTIONS.map(s => s.value)
  const topRowCount = Math.max(9, resourceRows.length + 1)

  const lines = []
  for (let r = 0; r < topRowCount; r++) {
    let c0 = ''
    let c1 = ''
    if (r === 0) { c0 = 'Sprint:'; c1 = sprintNumber }
    else if (r === 1) { c0 = 'Start date:'; c1 = startDate }
    else if (r === 2) { c0 = 'End date:'; c1 = endDate }
    else if (r === 3) { c0 = 'Update till:'; c1 = updateTill }
    else if (r === 4) { c0 = 'By:'; c1 = updatedBy }
    else if (r === 7) { c0 = 'Note'; c1 = sprintNote }

    const c3 = r === 0 ? 'Status' : ''
    const c4 = r < statusList.length ? statusList[r] : ''
    const c6 = r === 0 ? 'Handle by' : (resourceRows[r - 1]?.name || '')
    const c7 = r === 0 ? 'Resource point' : (r - 1 < resourceRows.length ? String(resourceRows[r - 1].points) : '')

    lines.push([c0, c1, '', c3, c4, '', c6, c7].map(escapeCsvCell).join(','))
  }

  lines.push(',,,,,,,')
  lines.push(',,,,,,,')
  lines.push('Ticket ID,CR Description,Status,Handle by,Due date for dev,Dev Progress,Resource used,Note')

  const allItems = collectBoardCardsWithColumn(board)
  allItems.forEach(({ index, card }) => {
    const ticketId = card.crCode?.trim() || `BNPL-${index}`
    const statusText = normalizeCrStatus(card.baStatus)
    const handleBy = card.assignee?.trim() || ''
    const dueShort = formatShortDueDate(card.deadline || card.dueDate)
    const devProg = getCardDevProgress(card)
    const resUsed = getCardResourceUsed(card) || ''
    const noteText = card.note?.trim() || ''

    lines.push([
      ticketId,
      card.title || '',
      statusText,
      handleBy,
      dueShort,
      devProg,
      resUsed,
      noteText
    ].map(escapeCsvCell).join(','))
  })

  const csvContent = '\uFEFF' + lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Sprint_${sprintNumber}_Template.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Parse CSV line respecting quoted strings with commas
export const splitCsvLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export const parseSprintCsvTemplate = (csvText) => {
  const lines = String(csvText || '').split(/\r?\n/)
  const sprintMeta = {
    sprintNumber: '34',
    startDate: '22/10/2026',
    endDate: '05/11/2026',
    updateTill: '26/10/2026',
    updatedBy: 'Dao Thanh Phuc',
    teamRoster: [...DEFAULT_TEAM_ROSTER]
  }
  const crRows = []
  let inCrTable = false

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue
    const cols = splitCsvLine(rawLine)
    if (cols[0]?.toLowerCase() === 'ticket id' && cols[1]?.toLowerCase().includes('cr')) {
      inCrTable = true
      continue
    }

    if (!inCrTable) {
      if (/^sprint:?$/i.test(cols[0]) && cols[1]) sprintMeta.sprintNumber = cols[1]
      if (/^start date:?$/i.test(cols[0]) && cols[1]) sprintMeta.startDate = cols[1]
      if (/^end date:?$/i.test(cols[0]) && cols[1]) sprintMeta.endDate = cols[1]
      if (/^update till:?$/i.test(cols[0]) && cols[1]) sprintMeta.updateTill = cols[1]
      if (/^by:?$/i.test(cols[0]) && cols[1]) sprintMeta.updatedBy = cols[1]
      if (cols[6] && cols[6].toLowerCase() !== 'handle by' && !sprintMeta.teamRoster.includes(cols[6])) {
        sprintMeta.teamRoster.push(cols[6])
      }
    } else {
      const ticketId = cols[0] || ''
      const crDescription = cols[1] || ''
      if (!ticketId && !crDescription) continue

      // Extract Topic from "Topic - Rest of description" if present
      let topic = 'Usage Limit & Core'
      const dashIdx = crDescription.indexOf(' - ')
      if (dashIdx > 0 && dashIdx < 35) {
        topic = crDescription.slice(0, dashIdx).trim()
      }

      // Normalize due date like 5/11 -> 2026-11-05
      let deadlineIso = '2026-11-05'
      const rawDue = cols[4] || ''
      const dm = rawDue.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/)
      if (dm) {
        const yyyy = dm[3] || '2026'
        deadlineIso = `${yyyy}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}`
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDue)) {
        deadlineIso = rawDue
      }

      crRows.push({
        crCode: ticketId || 'BNPL-945',
        title: crDescription || ticketId,
        topic,
        baStatus: normalizeCrStatus(cols[2] || 'Processing'),
        assignee: cols[3] || '',
        deadline: deadlineIso,
        devProgress: cols[5] !== undefined && cols[5] !== '' ? Number(cols[5]) : 1,
        resourceUsed: cols[6] !== undefined && cols[6] !== '' ? Number(cols[6]) : 0,
        note: cols[7] || ''
      })
    }
  }

  return { sprintMeta, crRows }
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
  const crCode = card.crCode || 'BNPL-945'
  const dl = getDeadlineStatus(card)
  const devProg = getCardDevProgress(card)
  const resUsed = getCardResourceUsed(card)
  const checklistMd = (card.checklist || [])
    .map(item => `- [${item.isCompleted ? 'x' : ' '}] ${item.title}`)
    .join('\n')

  const mdContent = [
    `# [${crCode}] ${card.title}`,
    '',
    '## 1. Sprint & CR Metadata',
    `- **Ticket ID**: \`${crCode}\``,
    `- **Sprint**: ${card.sprint || sprintName}`,
    `- **Status**: ${normalizeCrStatus(card.baStatus)}`,
    `- **Handle by**: ${card.assignee || 'Unassigned'}`,
    `- **Due date for dev**: ${dl.shortDate || card.deadline || 'TBD'}`,
    `- **Dev Progress**: ${devProg} (${Math.round(devProg * 100)}%)`,
    `- **Resource used**: ${resUsed}`,
    `- **Note**: ${card.note || '—'}`,
    '',
    '## 2. Functional Requirements Specification (FRD)',
    card.description || '_No detailed specification yet._',
    '',
    '## 3. Acceptance Criteria & Checklist',
    checklistMd || '- [ ] Define UAT scenarios'
  ].join('\n')

  downloadAttachedFrdFile({
    name: `FRD_${crCode.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`,
    type: 'text/markdown;charset=utf-8;',
    content: mdContent
  })
}

export const GENERATE_BA_FRD_TEMPLATE = (crCode = 'BNPL-945', title = 'Usage Limit - Monthly 1 time synchronized update for user') => {
  return [
    `# FRD [${crCode}]: ${title}`,
    '',
    '## 1. Business Objective & Scope',
    '- **Problem Statement**: Ensure each user account can synchronize and update its monthly usage limit at most once per billing cycle without race conditions.',
    '- **Target Outcome**: 100% consistency between User Profile Service, Usage Limit Engine, and Billing Ledger.',
    '',
    '## 2. Actors & Stakeholders',
    '- **End User**: Requests or triggers monthly usage limit synchronization.',
    '- **Usage Limit Service**: Validates monthly quota (`max_sync_per_month = 1`) and updates limit state.',
    '- **Core Ledger / DB**: Persists updated limit and synchronization timestamp.',
    '',
    '## 3. Business Rules (BR)',
    '| Rule ID | Rule Name | Specification |',
    '| :--- | :--- | :--- |',
    '| **BR-01** | Monthly Sync Quota | Each `user_id` is allowed at most **1** synchronized update per calendar month (`YYYY-MM`). |',
    '| **BR-02** | Idempotency Lock | Concurrent requests within the same second must be locked via Redis key `usage_sync:{user_id}:{YYYY_MM}`. |',
    '| **BR-03** | Audit Trail | Every limit change must record `previous_limit`, `new_limit`, `updated_at`, and `trigger_source`. |',
    '',
    '## 4. Sequence Flow & Technical Visualization',
    '```mermaid',
    'sequenceDiagram',
    '  actor User as User / Client',
    '  participant API as API Gateway',
    '  participant LimitSvc as Usage Limit Service',
    '  participant DB as Core Database',
    '  User->>API: POST /v1/usage-limit/sync',
    '  API->>LimitSvc: Verify monthly sync quota (YYYY-MM)',
    '  alt First sync in current month',
    '    LimitSvc->>DB: Update limit & set last_sync_month = YYYY-MM',
    '    DB-->>LimitSvc: Commit OK',
    '    LimitSvc-->>API: 200 OK (Synchronized)',
    '  else Already synced this month',
    '    LimitSvc-->>API: 409 Conflict (LIMIT_ALREADY_SYNCED_THIS_MONTH)',
    '  end',
    '```',
    '',
    '## 5. Related Knowledge Nodes (Obsidian WikiLinks)',
    '- Upstream Dependency: [[BNPL-1]]',
    '- Downstream Notification: [[BNPL-2]]',
    '',
    '## 6. Test Scenarios & Acceptance Criteria',
    '- [x] **TC-01 (Happy Path)**: User with `last_sync_month != current_month` updates usage limit -> Status `200 OK`, DB updated.',
    '- [x] **TC-02 (Quota Reached)**: User attempts a 2nd update in the same month -> Rejects with `409 Conflict`.',
    '- [ ] **TC-03 (Month Rollover)**: On the 1st day of the next month (`00:00 UTC+7`), user can synchronize again.'
  ].join('\n')
}
