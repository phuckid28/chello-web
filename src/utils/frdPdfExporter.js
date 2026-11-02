import {
  formatDateVN,
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  getStatusOption
} from '~/utils/excelExporter'
import { formatProgress } from '~/utils/progress'

export const extractSprintNumberOnly = (rawSprint, fallback = '34') => {
  const digits = String(rawSprint ?? '').replace(/[^0-9]/g, '')
  return digits || String(fallback).replace(/[^0-9]/g, '') || '34'
}

// Parses a Mermaid sequenceDiagram block into visual actors & message transitions
export const parseSequenceDiagram = (rawCode) => {
  const lines = String(rawCode || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  if (!lines[0]?.startsWith('sequenceDiagram')) return null

  const participants = []
  const participantMap = new Map()
  const steps = []

  const ensureParticipant = (id, label) => {
    const cleanId = id.trim()
    if (!participantMap.has(cleanId)) {
      const entry = { id: cleanId, label: (label || cleanId).trim() }
      participantMap.set(cleanId, entry)
      participants.push(entry)
    }
    return participantMap.get(cleanId)
  }

  lines.slice(1).forEach((line) => {
    const actorMatch = line.match(/^(actor|participant)\s+([^\s]+)(?:\s+as\s+(.+))?$/i)
    if (actorMatch) {
      ensureParticipant(actorMatch[2], actorMatch[3] || actorMatch[2])
      return
    }

    const branchMatch = line.match(/^(alt|else|opt|loop)\s*(.*)$/i)
    if (branchMatch) {
      steps.push({
        type: 'branch',
        keyword: branchMatch[1].toUpperCase(),
        label: branchMatch[2] || ''
      })
      return
    }

    if (/^end$/i.test(line)) return

    const msgMatch = line.match(/^([A-Za-z0-9_-]+)\s*(-->>|->>|-->|->)\s*([A-Za-z0-9_-]+)\s*:\s*(.+)$/)
    if (msgMatch) {
      const fromP = ensureParticipant(msgMatch[1])
      const toP = ensureParticipant(msgMatch[3])
      steps.push({
        type: 'message',
        from: fromP.label,
        to: toP.label,
        dashed: msgMatch[2].startsWith('--'),
        text: msgMatch[4].trim()
      })
    }
  })

  if (participants.length === 0 && steps.length === 0) return null
  return { participants, steps }
}

const escapeHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const convertMarkdownToPrintableHtml = (mdText) => {
  const source = String(mdText || '').trim()
  if (!source) return '<p><em>Chưa có nội dung mô tả chi tiết FRD.</em></p>'

  const withDiagrams = source.replace(/```mermaid\s*([\s\S]*?)```/g, (_, code) => {
    const parsed = parseSequenceDiagram(code)
    if (!parsed) {
      return `<pre class="code-block">${escapeHtml(code)}</pre>`
    }
    const actorsHtml = parsed.participants
      .map(p => `<span class="actor-pill">${escapeHtml(p.label)}</span>`)
      .join('<span class="actor-arrow">→</span>')
    const stepsHtml = parsed.steps.map((s, i) => {
      if (s.type === 'branch') {
        return `<div class="seq-branch"><strong>[${escapeHtml(s.keyword)}]</strong> ${escapeHtml(s.label)}</div>`
      }
      return `<div class="seq-step"><span class="seq-idx">${String(i + 1).padStart(2, '0')}</span> <strong>${escapeHtml(s.from)}</strong> <span class="seq-arrow">${s.dashed ? '⇢' : '→'}</span> <strong>${escapeHtml(s.to)}</strong>: <code>${escapeHtml(s.text)}</code></div>`
    }).join('')
    return `<div class="seq-box"><div class="seq-title">SEQUENCE ARCHITECTURE FLOW</div><div class="seq-actors">${actorsHtml}</div>${stepsHtml}</div>`
  })

  const lines = withDiagrams.split(/\r?\n/)
  const htmlOut = []
  let inTable = false
  let inList = false

  const closeOpenBlocks = () => {
    if (inTable) {
      htmlOut.push('</tbody></table>')
      inTable = false
    }
    if (inList) {
      htmlOut.push('</ul>')
      inList = false
    }
  }

  const formatInline = (txt) => escapeHtml(txt)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="wikilink">🔗 $1</span>')

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) {
      closeOpenBlocks()
      return
    }
    if (line.startsWith('<div class="seq-box">') || line.startsWith('<pre class="code-block">')) {
      closeOpenBlocks()
      htmlOut.push(line)
      return
    }
    if (/^---+$/.test(line)) {
      closeOpenBlocks()
      htmlOut.push('<hr />')
      return
    }
    if (line.startsWith('# ')) {
      closeOpenBlocks()
      htmlOut.push(`<h1>${formatInline(line.slice(2))}</h1>`)
      return
    }
    if (line.startsWith('## ')) {
      closeOpenBlocks()
      htmlOut.push(`<h2>${formatInline(line.slice(3))}</h2>`)
      return
    }
    if (line.startsWith('### ')) {
      closeOpenBlocks()
      htmlOut.push(`<h3>${formatInline(line.slice(4))}</h3>`)
      return
    }
    if (line.startsWith('|') && line.endsWith('|')) {
      if (inList) {
        htmlOut.push('</ul>')
        inList = false
      }
      const cells = line.slice(1, -1).split('|').map(c => c.trim())
      if (cells.every(c => /^:?-+:?$/.test(c))) return
      if (!inTable) {
        htmlOut.push('<table><thead><tr>' + cells.map(c => `<th>${formatInline(c)}</th>`).join('') + '</tr></thead><tbody>')
        inTable = true
      } else {
        htmlOut.push('<tr>' + cells.map(c => `<td>${formatInline(c)}</td>`).join('') + '</tr>')
      }
      return
    }
    if (line.startsWith('- ')) {
      if (inTable) {
        htmlOut.push('</tbody></table>')
        inTable = false
      }
      if (!inList) {
        htmlOut.push('<ul>')
        inList = true
      }
      const itemText = line.slice(2).trim()
      if (itemText.startsWith('[x] ') || itemText.startsWith('[X] ')) {
        htmlOut.push(`<li>☑ ${formatInline(itemText.slice(4))}</li>`)
      } else if (itemText.startsWith('[ ] ')) {
        htmlOut.push(`<li>☐ ${formatInline(itemText.slice(4))}</li>`)
      } else {
        htmlOut.push(`<li>${formatInline(itemText)}</li>`)
      }
      return
    }
    closeOpenBlocks()
    htmlOut.push(`<p>${formatInline(line)}</p>`)
  })

  closeOpenBlocks()
  return htmlOut.join('\n')
}

export const exportFrdAsPrintablePdf = (card, rawMarkdown, sprintNumberInput = '34') => {
  const crCode = card?.crCode || 'BNPL-945'
  const sprintNum = extractSprintNumberOnly(card?.sprint || sprintNumberInput, '34')
  const stOpt = getStatusOption(card?.baStatus)
  const dl = getDeadlineStatus(card)
  const devProg = getCardDevProgress(card)
  const resUsed = getCardResourceUsed(card)
  const bodyHtml = convertMarkdownToPrintableHtml(rawMarkdown ?? card?.description ?? '')
  const checklistItems = card?.checklist || []

  const checklistHtml = checklistItems.length > 0
    ? `<h2>Acceptance Criteria & Subtasks (${checklistItems.filter(i => i.isCompleted).length}/${checklistItems.length})</h2>
       <ul>${checklistItems.map(i => `<li>${i.isCompleted ? '☑' : '☐'} ${escapeHtml(i.title)}</li>`).join('')}</ul>`
    : ''

  const docHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>FRD_${escapeHtml(crCode)}_Sprint_${escapeHtml(sprintNum)}.pdf</title>
  <style>
    @page { size: A4; margin: 14mm 16mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #e2e8f0;
      margin: 0;
      padding: 24px;
      line-height: 1.6;
    }
    .toolbar {
      max-width: 210mm;
      margin: 0 auto 16px auto;
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toolbar button {
      background: #0284c7;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 7px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .page {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 20mm 18mm;
      border-radius: 8px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.16);
    }
    .doc-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .doc-kicker {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #0284c7;
      text-transform: uppercase;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      margin: 4px 0 0 0;
      color: #0f172a;
    }
    .meta-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12.5px;
    }
    .meta-grid th, .meta-grid td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }
    .meta-grid th {
      background: #f1f5f9;
      font-weight: 800;
      width: 18%;
      color: #334155;
    }
    h1 { font-size: 17px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 20px; }
    h2 { font-size: 14.5px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 18px; }
    h3 { font-size: 13.5px; margin-top: 14px; }
    p, li { font-size: 13px; color: #1e293b; }
    ul { padding-left: 20px; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12.5px; }
    th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
    th { background: #f8fafc; font-weight: 800; }
    code {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 11.5px;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
    }
    .wikilink {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      font-size: 11.5px;
      padding: 1px 7px;
      border-radius: 5px;
    }
    .seq-box {
      border: 1px solid #94a3b8;
      background: #f8fafc;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 12px 0;
    }
    .seq-title {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 11px;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .seq-actors {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #cbd5e1;
    }
    .actor-pill {
      background: #0f172a;
      color: #f8fafc;
      font-size: 11.5px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 5px;
    }
    .actor-arrow { color: #64748b; font-weight: 800; }
    .seq-branch {
      margin: 6px 0 4px 0;
      font-size: 11.5px;
      color: #0369a1;
      background: #e0f2fe;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .seq-step {
      font-size: 12px;
      padding: 4px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .seq-idx {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 10.5px;
      font-weight: 800;
      color: #64748b;
      margin-right: 6px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .page { box-shadow: none; margin: 0; padding: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <strong>📄 FRD PDF Specification Preview</strong> — [${escapeHtml(crCode)}] Sprint ${escapeHtml(sprintNum)}
    </div>
    <button onclick="window.print()">🖨️ Lưu thành PDF / In tài liệu (Save as PDF)</button>
  </div>
  <div class="page">
    <div class="doc-header">
      <div>
        <div class="doc-kicker">CHELLA ENTERPRISE FRD SPECIFICATION • SPRINT ${escapeHtml(sprintNum)}</div>
        <h1 class="doc-title">[${escapeHtml(crCode)}] ${escapeHtml(card?.title || 'Change Request Specification')}</h1>
      </div>
      <div style="text-align:right;font-size:11.5px;color:#475569;">
        <div><strong>Ngày xuất:</strong> ${escapeHtml(formatDateVN(new Date()))}</div>
        <div><strong>Status:</strong> ${escapeHtml(stOpt.value)}</div>
      </div>
    </div>

    <table class="meta-grid">
      <tbody>
        <tr>
          <th>Ticket ID</th>
          <td><strong>${escapeHtml(crCode)}</strong></td>
          <th>Sprint</th>
          <td><strong>${escapeHtml(sprintNum)}</strong></td>
        </tr>
        <tr>
          <th>Status</th>
          <td>${escapeHtml(stOpt.value)}</td>
          <th>Priority</th>
          <td>${escapeHtml(String(card?.priority || 'medium').toUpperCase())}</td>
        </tr>
        <tr>
          <th>Handle by</th>
          <td>${escapeHtml(card?.assignee || 'Unassigned')}</td>
          <th>Due date / Progress</th>
          <td>${escapeHtml(dl.shortDate || card?.deadline || 'TBD')} (${escapeHtml(formatProgress(devProg))})</td>
        </tr>
        <tr>
          <th>Story Point</th>
          <td>${escapeHtml(String(resUsed || 1))} pt</td>
          <th>Note</th>
          <td>${escapeHtml(card?.note || '—')}</td>
        </tr>
      </tbody>
    </table>

    ${bodyHtml}
    ${checklistHtml}
  </div>
  <script>
    setTimeout(function () { window.print(); }, 350);
  </script>
</body>
</html>`

  const printWin = window.open('', '_blank', 'width=980,height=860')
  if (printWin) {
    printWin.document.open()
    printWin.document.write(docHtml)
    printWin.document.close()
  }
}
