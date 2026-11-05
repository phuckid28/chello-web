// Baoyu-Design (`dataviz` + `claude-dashboard`) OKLab/CVD Palette Validator & Traceable KPI Lineage Engine
// Computes OKLCH Lightness/Chroma, Machado (2009) Protan/Deutan/Tritan OKLab Delta-E (x100),
// WCAG Surface Contrast, and `data-source` / `data-where` row-level attribution for Sprint Analytics.

import {
  BA_STATUS_OPTIONS,
  computeTeamResourcePoints,
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  normalizeCrStatus,
  parseAssigneeList
} from '~/utils/excelExporter'
import { formatProgress } from '~/utils/progress'
import { SPEC_KIT_VERDICTS, auditCrConvergence } from '~/utils/specKitAudit'

const LIGHT_BAND = [0.43, 0.77]
const DARK_BAND = [0.48, 0.67]
const CHROMA_FLOOR = 0.10
const CVD_TARGET = 8.0
const CVD_FLOOR = 6.0
const NORMAL_FLOOR = 15.0
const CONTRAST_MIN = 3.0

const DEFAULT_SURFACES = Object.freeze({
  light: '#fcfcfb',
  dark: '#1a1a19'
})

// Validated 8-slot categorical palettes from baoyu-design/skills/dataviz/references/palette.md
// Worst adjacent CVD Delta-E: 9.1 (light) / 8.4 (dark) >= 8.0 target; Normal-vision >= 19.3
export const CHELLA_CATEGORICAL_PALETTE = Object.freeze({
  light: Object.freeze(['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']),
  dark: Object.freeze(['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'])
})

// Machado, Oliveira & Fernandes (2009) severity 1.0 CVD matrices in linear RGB
const MACHADO_MATRICES = Object.freeze({
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998]
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.011820, 0.042940, 0.968881]
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.303900]
  ]
})

const hexToSrgb = (hex) => {
  const clean = String(hex || '#000000').trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return [0, 0, 0]
  return [0, 2, 4].map(idx => parseInt(clean.slice(idx, idx + 2), 16) / 255)
}

const srgbChannelToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

const hexToLinearRgb = (hex) => hexToSrgb(hex).map(srgbChannelToLinear)

const relativeLuminance = (hex) => {
  const [r, g, b] = hexToLinearRgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const wcagContrastRatio = (hexA, hexB) => {
  const lumA = relativeLuminance(hexA)
  const lumB = relativeLuminance(hexB)
  const hi = Math.max(lumA, lumB)
  const lo = Math.min(lumA, lumB)
  return (hi + 0.05) / (lo + 0.05)
}

const linearRgbToOklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  ]
}

export const hexToOklch = (hex) => {
  const [L, a, b] = linearRgbToOklab(hexToLinearRgb(hex))
  return [L, Math.hypot(a, b)]
}

const simulateCvdLinear = (hex, kind) => {
  const [r, g, b] = hexToLinearRgb(hex)
  const M = MACHADO_MATRICES[kind]
  if (!M) return [r, g, b]
  const clamp = (v) => Math.max(0, Math.min(1, v))
  return [
    clamp(M[0][0] * r + M[0][1] * g + M[0][2] * b),
    clamp(M[1][0] * r + M[1][1] * g + M[1][2] * b),
    clamp(M[2][0] * r + M[2][1] * g + M[2][2] * b)
  ]
}

export const oklabDeltaE = (hex1, hex2, cvdKind = null) => {
  const lab1 = linearRgbToOklab(cvdKind ? simulateCvdLinear(hex1, cvdKind) : hexToLinearRgb(hex1))
  const lab2 = linearRgbToOklab(cvdKind ? simulateCvdLinear(hex2, cvdKind) : hexToLinearRgb(hex2))
  return 100 * Math.hypot(lab1[0] - lab2[0], lab1[1] - lab2[1], lab1[2] - lab2[2])
}

export const validateDatavizPalette = (palette = [], { mode = 'dark', surface, pairs = 'adjacent' } = {}) => {
  const resolvedMode = mode === 'light' ? 'light' : 'dark'
  const resolvedSurface = surface || DEFAULT_SURFACES[resolvedMode]
  const [loL, hiL] = resolvedMode === 'light' ? LIGHT_BAND : DARK_BAND

  const offBand = palette.filter(c => {
    const [L] = hexToOklch(c)
    return L < loL || L > hiL
  })
  const lowChroma = palette.filter(c => hexToOklch(c)[1] < CHROMA_FLOOR)

  const n = palette.length
  const pairIndices = []
  if (pairs === 'all') {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) pairIndices.push([i, j])
    }
  } else {
    for (let i = 0; i < n - 1; i++) pairIndices.push([i, i + 1])
  }

  let worstCvd = { deltaE: 99, kind: 'deutan', pair: [] }
  for (const kind of ['protan', 'deutan']) {
    for (const [i, j] of pairIndices) {
      const d = oklabDeltaE(palette[i], palette[j], kind)
      if (d < worstCvd.deltaE) {
        worstCvd = { deltaE: Number(d.toFixed(1)), kind, pair: [palette[i], palette[j]] }
      }
    }
  }

  let worstNormal = { deltaE: 99, pair: [] }
  for (const [i, j] of pairIndices) {
    const d = oklabDeltaE(palette[i], palette[j], null)
    if (d < worstNormal.deltaE) {
      worstNormal = { deltaE: Number(d.toFixed(1)), pair: [palette[i], palette[j]] }
    }
  }

  const lowContrast = palette.filter(c => wcagContrastRatio(c, resolvedSurface) < CONTRAST_MIN)

  const cvdStatus = worstCvd.deltaE >= CVD_TARGET ? 'pass' : (worstCvd.deltaE >= CVD_FLOOR ? 'floor' : 'fail')
  const normalStatus = worstNormal.deltaE >= NORMAL_FLOOR ? 'pass' : 'fail'
  const lightnessOk = offBand.length === 0
  const chromaOk = lowChroma.length === 0
  const ok = lightnessOk && chromaOk && cvdStatus !== 'fail' && normalStatus === 'pass'

  return {
    ok,
    mode: resolvedMode,
    surface: resolvedSurface,
    worstCvdDeltaE: worstCvd.deltaE,
    worstCvdPair: worstCvd.pair,
    worstCvdKind: worstCvd.kind,
    worstNormalDeltaE: worstNormal.deltaE,
    worstNormalPair: worstNormal.pair,
    checks: [
      { id: 'lightness', label: 'Lightness band', status: lightnessOk ? 'pass' : 'fail', detail: `OKLCH L in [${loL}, ${hiL}]` },
      { id: 'chroma', label: 'Chroma floor', status: chromaOk ? 'pass' : 'fail', detail: `OKLCH C >= ${CHROMA_FLOOR}` },
      { id: 'cvd', label: 'CVD separation (Protan/Deutan)', status: cvdStatus, detail: `Worst ΔE ${worstCvd.deltaE} (${worstCvd.kind})` },
      { id: 'normal', label: 'Normal-vision floor', status: normalStatus, detail: `Worst ΔE ${worstNormal.deltaE}` },
      { id: 'contrast', label: 'Surface contrast', status: lowContrast.length === 0 ? 'pass' : 'relief', detail: `${palette.length - lowContrast.length}/${palette.length} >= 3:1` }
    ]
  }
}

const mapCardToDatasetRow = (card, idx) => {
  const status = normalizeCrStatus(card?.baStatus)
  const devProgress = getCardDevProgress(card)
  const resourceUsed = getCardResourceUsed(card)
  const deadline = getDeadlineStatus(card)
  const audit = auditCrConvergence(card)

  return {
    rowIndex: idx,
    _id: card?._id || `row-${idx}`,
    crCode: card?.crCode || `BNPL-${idx + 1}`,
    title: card?.title || 'Untitled CR',
    columnTitle: card?.columnTitle || 'Topic',
    status,
    assignee: card?.assignee || 'Unassigned',
    assignees: parseAssigneeList(card?.assignee),
    devProgress,
    devProgressLabel: formatProgress(devProgress),
    resourceUsed,
    deadlineCode: deadline.code,
    deadlineLabel: deadline.label,
    convergenceVerdict: audit.verdict,
    convergenceBeacon: audit.beaconLabel,
    convergenceScore: audit.score,
    rawCard: card
  }
}

export const buildSprintDatasetSources = (board, columns = []) => {
  const realCards = []
  const colList = Array.isArray(columns) ? columns : []
  colList.forEach(col => {
    const cardList = Array.isArray(col?.cards) ? col.cards : []
    cardList.forEach(card => {
      if (!card?.FE_PlaceholderCard) {
        realCards.push({ ...card, columnTitle: col.title })
      }
    })
  })

  const rows = realCards.map(mapCardToDatasetRow)
  const teamRosterRows = computeTeamResourcePoints(board)

  const totalCrs = rows.length
  const totalPoints = Number(rows.reduce((sum, r) => sum + (Number(r.resourceUsed) || 0), 0).toFixed(2))
  const avgProgress = totalCrs > 0
    ? rows.reduce((sum, r) => sum + r.devProgress, 0) / totalCrs
    : 0
  const overdueRows = rows.filter(r => r.deadlineCode === 'overdue')
  const convergedRows = rows.filter(r => r.convergenceVerdict === SPEC_KIT_VERDICTS.CONVERGED)
  const attentionRows = rows.filter(
    r => r.convergenceVerdict === SPEC_KIT_VERDICTS.CONTRADICTS ||
      r.convergenceVerdict === SPEC_KIT_VERDICTS.NEEDS_CLARIFICATION
  )

  const kpiById = {
    total_crs: {
      id: 'total_crs',
      title: 'Total Sprint CRs',
      datasetId: 'datasets/sprint_crs',
      field: 'crCode',
      whereClause: 'FE_PlaceholderCard=false',
      formula: 'COUNT(datasets/sprint_crs)',
      value: totalCrs,
      formattedValue: `${totalCrs} CRs`,
      rows
    },
    avg_dev_progress: {
      id: 'avg_dev_progress',
      title: 'Average Dev Progress',
      datasetId: 'datasets/sprint_crs',
      field: 'devProgress',
      whereClause: 'all active CRs',
      formula: 'AVG(datasets/sprint_crs.devProgress)',
      value: Math.round(avgProgress * 100),
      formattedValue: `${Math.round(avgProgress * 100)}%`,
      rows
    },
    total_resource_points: {
      id: 'total_resource_points',
      title: 'Total Resource Points',
      datasetId: 'datasets/sprint_crs',
      field: 'resourceUsed',
      whereClause: 'resourceUsed > 0',
      formula: 'SUM(datasets/sprint_crs.resourceUsed)',
      value: totalPoints,
      formattedValue: `${totalPoints} pt`,
      rows: rows.filter(r => r.resourceUsed > 0)
    },
    overdue_crs: {
      id: 'overdue_crs',
      title: 'Overdue CRs',
      datasetId: 'datasets/sprint_crs',
      field: 'deadline',
      whereClause: 'deadlineCode=overdue',
      formula: 'COUNT(datasets/sprint_crs WHERE deadline < now AND status NOT IN Done)',
      value: overdueRows.length,
      formattedValue: `${overdueRows.length} CRs`,
      rows: overdueRows
    },
    converged_crs: {
      id: 'converged_crs',
      title: 'Spec-Kit Converged CRs',
      datasetId: 'datasets/sprint_crs',
      field: 'convergenceVerdict',
      whereClause: 'convergenceVerdict=converged',
      formula: 'COUNT(datasets/sprint_crs WHERE verdict = converged)',
      value: convergedRows.length,
      formattedValue: `${convergedRows.length}/${totalCrs} CRs`,
      rows: convergedRows
    },
    spec_attention_crs: {
      id: 'spec_attention_crs',
      title: 'CRs Needing Spec Clarification / Gap Fix',
      datasetId: 'datasets/sprint_crs',
      field: 'convergenceVerdict',
      whereClause: 'convergenceVerdict IN (contradicts,needs-clarification)',
      formula: 'COUNT(datasets/sprint_crs WHERE uncertainties > 0 OR contradicts)',
      value: attentionRows.length,
      formattedValue: `${attentionRows.length} CRs`,
      rows: attentionRows
    }
  }

  BA_STATUS_OPTIONS.forEach((st, idx) => {
    const matching = rows.filter(r => r.status === st.value)
    kpiById[`status:${st.value}`] = {
      id: `status:${st.value}`,
      title: `Status: ${st.value}`,
      datasetId: 'datasets/sprint_crs',
      field: 'baStatus',
      whereClause: `baStatus=${st.value}`,
      formula: `COUNT(datasets/sprint_crs WHERE baStatus = "${st.value}")`,
      value: matching.length,
      formattedValue: `${matching.length} CRs`,
      color: CHELLA_CATEGORICAL_PALETTE.dark[idx % CHELLA_CATEGORICAL_PALETTE.dark.length],
      rows: matching
    }
  })

  teamRosterRows.forEach((memberRow, idx) => {
    const matching = rows.filter(r =>
      r.assignees.some(a => a.toLowerCase() === memberRow.name.toLowerCase())
    )
    kpiById[`member:${memberRow.name}`] = {
      id: `member:${memberRow.name}`,
      title: `Handle by: ${memberRow.name}`,
      datasetId: 'datasets/team_roster',
      field: 'resourceUsed',
      whereClause: `assignee CONTAINS "${memberRow.name}"`,
      formula: `SUM(datasets/sprint_crs.resourceUsed WHERE "${memberRow.name}" IN assignees) / COUNT(assignees)`,
      value: memberRow.points,
      formattedValue: `${memberRow.points} pt (${memberRow.crCount} CRs)`,
      color: CHELLA_CATEGORICAL_PALETTE.dark[idx % CHELLA_CATEGORICAL_PALETTE.dark.length],
      rows: matching
    }
  })

  return {
    datasets: {
      'datasets/sprint_crs': {
        id: 'datasets/sprint_crs',
        title: 'Sprint Change Requests (CRs)',
        description: `Live board dataset (${rows.length} rows) with Spec-Kit convergence & resource metrics.`,
        rows
      },
      'datasets/team_roster': {
        id: 'datasets/team_roster',
        title: 'Team Resource Allocation',
        description: `Aggregated resource points across ${teamRosterRows.length} roster members.`,
        rows: teamRosterRows
      }
    },
    kpiById,
    paletteAudit: {
      dark: validateDatavizPalette(CHELLA_CATEGORICAL_PALETTE.dark, { mode: 'dark' }),
      light: validateDatavizPalette(CHELLA_CATEGORICAL_PALETTE.light, { mode: 'light' })
    }
  }
}
