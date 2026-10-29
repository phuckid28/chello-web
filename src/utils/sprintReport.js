// Sprint Status / Daily Stand-up report generator (Markdown) — paste into Teams, Slack, Email or Confluence
import {
  BA_STATUS_OPTIONS,
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  formatDateVN,
  getCardDevProgress,
  getDeadlineStatus,
  normalizeCrStatus,
  parseAssigneeList
} from '~/utils/excelExporter'
import { getPriorityOption } from '~/utils/crMeta'

export const REPORT_MODES = ['status', 'standup']

const REPORT_TEXT = {
  vi: {
    statusTitle: 'Báo cáo tiến độ',
    standupTitle: 'Daily Stand-up',
    summary: 'Tổng quan',
    totalCrs: 'Tổng số CR',
    avgProgress: 'Dev Progress trung bình',
    atRisk: 'Cần chú ý (quá hạn / sắp đến hạn)',
    blocking: 'Đang Blocking',
    byStatus: 'Theo Status',
    byOwner: 'Theo người phụ trách (Handle by)',
    unassigned: 'Chưa phân công',
    none: 'Không có',
    due: 'Due',
    updateTill: 'Cập nhật tới',
    by: 'Người cập nhật'
  },
  en: {
    statusTitle: 'Status report',
    standupTitle: 'Daily Stand-up',
    summary: 'Summary',
    totalCrs: 'Total CRs',
    avgProgress: 'Average Dev Progress',
    atRisk: 'Needs attention (overdue / due soon)',
    blocking: 'Blocking',
    byStatus: 'By Status',
    byOwner: 'By owner (Handle by)',
    unassigned: 'Unassigned',
    none: 'None',
    due: 'Due',
    updateTill: 'Update till',
    by: 'By'
  },
  ja: {
    statusTitle: '進捗レポート',
    standupTitle: 'デイリースタンドアップ',
    summary: '概要',
    totalCrs: 'CR 合計',
    avgProgress: '平均 Dev Progress',
    atRisk: '要注意（期限超過 / 期限間近）',
    blocking: 'Blocking 中',
    byStatus: 'Status 別',
    byOwner: '担当者別（Handle by）',
    unassigned: '未割り当て',
    none: 'なし',
    due: '期限',
    updateTill: '更新日',
    by: '更新者'
  },
  ko: {
    statusTitle: '진행 상황 보고서',
    standupTitle: '데일리 스탠드업',
    summary: '요약',
    totalCrs: '전체 CR',
    avgProgress: '평균 Dev Progress',
    atRisk: '주의 필요 (기한 초과 / 임박)',
    blocking: 'Blocking 중',
    byStatus: 'Status 별',
    byOwner: '담당자별 (Handle by)',
    unassigned: '미배정',
    none: '없음',
    due: '기한',
    updateTill: '업데이트 기준일',
    by: '작성자'
  }
}

const crLine = (card, now, t) => {
  const dl = getDeadlineStatus(card, now)
  const priority = getPriorityOption(card.priority)
  const progress = Math.round(getCardDevProgress(card) * 100)
  const due = dl.shortDate ? ` • ${t.due} ${dl.shortDate}` : ''
  const flag = dl.code === 'overdue' ? ' ⚠️' : (dl.code === 'due-soon' ? ' ⏰' : '')
  return `- ${priority.icon} **${card.crCode || 'CR'}** ${card.title} — _${normalizeCrStatus(card.baStatus)}_ • ${progress}%${due}${flag}`
}

const groupBy = (items, keyFn) => items.reduce((acc, item) => {
  keyFn(item).forEach(key => {
    acc.set(key, [...(acc.get(key) || []), item])
  })
  return acc
}, new Map())

export const buildSprintReport = ({ board, mode = 'status', lang = 'vi', now = Date.now() }) => {
  const t = REPORT_TEXT[lang] || REPORT_TEXT.en
  const sprint = { ...DEFAULT_SPRINT_CONFIG, ...(board?.sprintConfig || {}) }
  const cards = collectBoardCardsWithColumn(board).map(r => r.card)

  const atRisk = cards.filter(c => ['overdue', 'due-soon'].includes(getDeadlineStatus(c, now).code))
  const blocking = cards.filter(c => normalizeCrStatus(c.baStatus) === 'Blocking')
  const avg = cards.length
    ? Math.round((cards.reduce((sum, c) => sum + getCardDevProgress(c), 0) / cards.length) * 100)
    : 0

  const title = mode === 'standup' ? t.standupTitle : t.statusTitle
  const lines = [
    `## ${title} • ${sprint.name} (${sprint.startDate} – ${sprint.endDate})`,
    `_${t.updateTill}: ${formatDateVN(now)} • ${t.by}: ${sprint.updatedBy || '—'}_`,
    '',
    `### 📊 ${t.summary}`,
    `- ${t.totalCrs}: **${cards.length}**`,
    `- ${t.avgProgress}: **${avg}%**`,
    `- ${t.atRisk}: **${atRisk.length}**`,
    `- ${t.blocking}: **${blocking.length}**`,
    ''
  ]

  const section = (heading, list) => {
    lines.push(`### ${heading}`)
    lines.push(...(list.length ? list.map(c => crLine(c, now, t)) : [`- _${t.none}_`]))
    lines.push('')
  }

  section(`⚠️ ${t.atRisk}`, atRisk)
  section(`⛔ ${t.blocking}`, blocking)

  if (mode === 'standup') {
    const byOwner = groupBy(cards, c => {
      const owners = parseAssigneeList(c.assignee)
      return owners.length ? owners : [t.unassigned]
    })
    lines.push(`### 👥 ${t.byOwner}`)
    Array.from(byOwner.keys()).sort().forEach(owner => {
      lines.push(`#### ${owner}`)
      lines.push(...byOwner.get(owner).map(c => crLine(c, now, t)))
    })
    lines.push('')
  } else {
    lines.push(`### 🗂️ ${t.byStatus}`)
    BA_STATUS_OPTIONS.forEach(opt => {
      const list = cards.filter(c => normalizeCrStatus(c.baStatus) === opt.value)
      if (!list.length) return
      lines.push(`#### ${opt.label} (${list.length})`)
      lines.push(...list.map(c => crLine(c, now, t)))
    })
    lines.push('')
  }

  if (sprint.goal) lines.push(`> 📝 ${sprint.goal}`)
  return lines.join('\n').trim() + '\n'
}
