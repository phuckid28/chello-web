import {
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  getCardDevProgress,
  getCardResourceUsed,
  normalizeCrStatus,
  parseAssigneeList
} from '~/utils/excelExporter'
import { SPEC_KIT_VERDICTS, auditCrConvergence } from '~/utils/specKitAudit'

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const buildSprintRecapDeck = (board) => {
  const sprintConfig = { ...DEFAULT_SPRINT_CONFIG, ...(board?.sprintConfig || {}) }
  const items = collectBoardCardsWithColumn(board)
  const totalCrs = items.length

  let totalPoints = 0
  let progressSum = 0
  let doneCount = 0
  let testingCount = 0
  let processingCount = 0
  let totalFrds = 0
  let totalLinks = 0
  let specScoreSum = 0
  let convergedCount = 0

  const contributorMap = new Map()
  const topicMap = new Map()

  const enrichedCrs = items.map(({ card, columnTitle }) => {
    const prog = getCardDevProgress(card)
    const pts = getCardResourceUsed(card)
    const status = normalizeCrStatus(card.baStatus)
    const spec = auditCrConvergence(card)
    const frds = card?.frdDocuments?.length || 0
    const links = card?.linkedCardIds?.length || 0

    totalPoints += pts
    progressSum += prog
    totalFrds += frds
    totalLinks += links
    specScoreSum += spec.score

    if (spec.verdict === SPEC_KIT_VERDICTS.CONVERGED) {
      convergedCount += 1
    }

    if (status === 'Deployed' || status === 'Done testing' || status === 'Ready for deploy' || prog >= 1) {
      doneCount += 1
    } else if (status === 'In testing' || status === 'Ready for testing') {
      testingCount += 1
    } else {
      processingCount += 1
    }

    const prevTopic = topicMap.get(columnTitle) || { topic: columnTitle, count: 0, points: 0 }
    topicMap.set(columnTitle, {
      topic: columnTitle,
      count: prevTopic.count + 1,
      points: Number((prevTopic.points + pts).toFixed(1))
    })

    const assignees = parseAssigneeList(card?.assignee)
    assignees.forEach((person) => {
      const prev = contributorMap.get(person) || { name: person, crCount: 0, points: 0 }
      contributorMap.set(person, {
        name: person,
        crCount: prev.crCount + 1,
        points: Number((prev.points + pts).toFixed(1))
      })
    })

    return {
      _id: card._id,
      crCode: card.crCode || 'CR',
      title: card.title || 'Untitled CR',
      topic: columnTitle,
      status,
      progressPercent: Math.round(prog * 100),
      points: pts,
      specScore: spec.score,
      specLabel: spec.beaconLabel
    }
  })

  const avgProgressPercent = totalCrs > 0 ? Math.round((progressSum / totalCrs) * 100) : 0
  const avgSpecScore = totalCrs > 0 ? Math.round(specScoreSum / totalCrs) : 100
  const completionRate = totalCrs > 0 ? Math.round((doneCount / totalCrs) * 100) : 0

  const topContributors = Array.from(contributorMap.values())
    .sort((a, b) => b.points - a.points || b.crCount - a.crCount)
    .slice(0, 5)

  const topicBreakdown = Array.from(topicMap.values())
    .sort((a, b) => b.count - a.count)

  const highlightedCrs = [...enrichedCrs]
    .sort((a, b) => b.points - a.points || b.progressPercent - a.progressPercent)
    .slice(0, 4)

  const metrics = {
    sprintName: sprintConfig.name || board?.title || 'Sprint',
    sprintNumber: sprintConfig.sprintNumber || '34',
    dateRange: `${sprintConfig.startDate || ''} → ${sprintConfig.endDate || ''}`,
    boardTitle: board?.title || 'Chella Sprint Board',
    totalCrs,
    totalPoints: Number(totalPoints.toFixed(1)),
    avgProgressPercent,
    completionRate,
    doneCount,
    testingCount,
    processingCount,
    avgSpecScore,
    convergedCount,
    totalFrds,
    totalLinks,
    topContributors,
    topicBreakdown,
    highlightedCrs
  }

  const slides = [
    {
      id: 'hero',
      index: '01',
      eyebrow: 'SCENE 01 • SPRINT EXECUTIVE PULSE',
      title: `${metrics.sprintName} — Delivery Recap`,
      subtitle: `${metrics.boardTitle} (${metrics.dateRange})`
    },
    {
      id: 'velocity',
      index: '02',
      eyebrow: 'SCENE 02 • VELOCITY & TOPIC MATRIX',
      title: `${metrics.avgProgressPercent}% Dev Velocity • ${metrics.totalPoints} Story Points`,
      subtitle: `${metrics.doneCount} Ready/Done • ${metrics.testingCount} In Testing • ${metrics.processingCount} Processing`
    },
    {
      id: 'speckit',
      index: '03',
      eyebrow: 'SCENE 03 • SPEC-KIT SDD & ARCHITECTURE QUALITY',
      title: `${metrics.avgSpecScore}% Spec-Kit Convergence Score`,
      subtitle: `${metrics.convergedCount}/${metrics.totalCrs} CRs Converged • ${metrics.totalFrds} FRD Docs • ${metrics.totalLinks} Knowledge Links`
    },
    {
      id: 'spotlight',
      index: '04',
      eyebrow: 'SCENE 04 • TEAM MVPS & HIGHLIGHTED CRS',
      title: 'Top Contributors & Key Deliverables',
      subtitle: 'Recognising engineering & BA ownership across the Sprint'
    }
  ]

  return { metrics, slides }
}

export const renderSprintRecapHtml = (deck, themeConfig = {}) => {
  const { metrics } = deck
  const accent = themeConfig.accentColor || '#38bdf8'
  const secondary = themeConfig.secondaryAccent || '#f472b6'
  const themeName = themeConfig.name || 'Chella Studio'

  const crsHtml = metrics.highlightedCrs
    .map(
      (cr) =>
        `<div class="card-row"><span class="code">${escapeHtml(cr.crCode)}</span><span class="title">${escapeHtml(cr.title)}</span><span class="meta">${escapeHtml(cr.status)} • ${cr.progressPercent}% • ${cr.points}pt</span></div>`
    )
    .join('')

  const contributorsHtml = metrics.topContributors
    .map(
      (c) =>
        `<div class="card-row"><span class="title">${escapeHtml(c.name)}</span><span class="meta">${c.crCount} CRs • ${c.points} Story Points</span></div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(metrics.sprintName)} — Chella Sprint Recap Deck</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, sans-serif;
      background: #090d16;
      color: #f8fafc;
      padding: 32px;
      line-height: 1.5;
    }
    .deck { max-width: 980px; margin: 0 auto; display: grid; gap: 24px; }
    .slide {
      border-radius: 20px;
      padding: 32px;
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 22, 0.98));
      border: 1px solid ${accent}66;
      box-shadow: 0 20px 48px rgba(0,0,0,0.45);
    }
    .eyebrow {
      font-family: monospace;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: ${accent};
      margin-bottom: 8px;
    }
    h1, h2 { font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
    .sub { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
    .kpi {
      padding: 16px;
      border-radius: 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .kpi-val { font-size: 28px; font-weight: 800; color: ${accent}; font-variant-numeric: tabular-nums; }
    .kpi-lbl { font-size: 12px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.08em; }
    .card-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      margin-bottom: 8px;
    }
    .code { font-family: monospace; font-weight: 800; color: ${secondary}; }
    .title { flex: 1; font-weight: 700; }
    .meta { font-family: monospace; font-size: 13px; color: ${accent}; }
  </style>
</head>
<body>
  <div class="deck">
    <section class="slide">
      <div class="eyebrow">01 / SPRINT EXECUTIVE PULSE • ${escapeHtml(themeName)}</div>
      <h1>${escapeHtml(metrics.sprintName)} — ${escapeHtml(metrics.boardTitle)}</h1>
      <p class="sub">${escapeHtml(metrics.dateRange)}</p>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${metrics.totalCrs}</div><div class="kpi-lbl">Total CRs</div></div>
        <div class="kpi"><div class="kpi-val">${metrics.totalPoints}pt</div><div class="kpi-lbl">Story Points</div></div>
        <div class="kpi"><div class="kpi-val">${metrics.avgProgressPercent}%</div><div class="kpi-lbl">Avg Dev Velocity</div></div>
        <div class="kpi"><div class="kpi-val">${metrics.avgSpecScore}%</div><div class="kpi-lbl">Spec-Kit Convergence</div></div>
      </div>
    </section>
    <section class="slide">
      <div class="eyebrow">02 / HIGHLIGHTED CHANGE REQUESTS</div>
      <h2>Key Sprint Deliverables</h2>
      <p class="sub">${metrics.doneCount} Ready/Done • ${metrics.testingCount} In Testing • ${metrics.processingCount} Processing</p>
      ${crsHtml || '<p class="sub">No CRs recorded yet.</p>'}
    </section>
    <section class="slide">
      <div class="eyebrow">03 / TEAM MVPS & OWNERSHIP</div>
      <h2>Top Contributors</h2>
      <p class="sub">Ranked by Story Points & CR ownership</p>
      ${contributorsHtml || '<p class="sub">No assignees recorded yet.</p>'}
    </section>
  </div>
</body>
</html>`
}

export const downloadSprintRecapHtml = (board, themeConfig) => {
  const deck = buildSprintRecapDeck(board)
  const html = renderSprintRecapHtml(deck, themeConfig)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeSprint = String(deck.metrics.sprintName || 'sprint').replace(/[^a-zA-Z0-9_-]/g, '_')
  link.href = url
  link.download = `Chella_Sprint_Recap_${safeSprint}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
