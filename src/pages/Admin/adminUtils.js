// Pure helpers for the global admin console, v8 observability command center & v9 enterprise governance.

export const SEARCH_DEBOUNCE_MS = 350
const MAX_X_LABELS = 8
const BAR_GAP_RATIO = 0.25
const TICK_COUNT = 4

export const isUserLocked = (user, now = Date.now()) => Boolean(user?.lockedUntil) && Number(user.lockedUntil) > now

export const patchUserInList = (users, userId, patch) =>
  users.map((user) => (user._id === userId ? { ...user, ...patch } : user))

export const replaceUserInList = (users, updated) => {
  if (!updated?._id) return users
  return patchUserInList(users, updated._id, updated)
}

export const appendUniqueUsers = (users, items = []) => {
  const known = new Set(users.map((user) => user._id))
  return [...users, ...items.filter((item) => item?._id && !known.has(item._id))]
}

export const normalizeUsersPage = (response) => {
  if (Array.isArray(response)) return { items: response, nextCursor: null }
  return {
    items: Array.isArray(response?.items) ? response.items : [],
    nextCursor: response?.nextCursor || null
  }
}

const niceTicks = (max) => {
  if (max <= 0) return [0, 1]
  const step = Math.max(1, Math.ceil(max / TICK_COUNT))
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
}

/** Geometry for the inline SVG signup bar chart. */
export const buildSignupChart = (signups, { width, height, padding }) => {
  const series = Array.isArray(signups) ? signups : []
  const counts = series.map((point) => (Number.isFinite(Number(point?.count)) && point.count !== '' ? Number(point.count) : 0))
  const max = counts.length ? Math.max(...counts) : 0
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const ticks = niceTicks(max)
  const scaleMax = Math.max(max, ticks[ticks.length - 1], 1)
  const slot = series.length ? plotWidth / series.length : 0
  const labelEvery = Math.max(1, Math.ceil(series.length / MAX_X_LABELS))
  const bars = series.map((point, index) => {
    const count = counts[index]
    const barHeight = (count / scaleMax) * plotHeight
    return {
      date: String(point?.date ?? ''),
      count,
      x: padding.left + index * slot + (slot * BAR_GAP_RATIO) / 2,
      width: slot * (1 - BAR_GAP_RATIO),
      y: padding.top + plotHeight - barHeight,
      height: barHeight,
      showLabel: index % labelEvery === 0
    }
  })
  const tickLines = ticks.map((value) => ({ value, y: padding.top + plotHeight - (value / scaleMax) * plotHeight }))
  return { bars, max, ticks, tickLines, plotHeight, plotWidth }
}

export const formatBytes = (rawBytes = 0) => {
  const bytes = Math.max(0, Number(rawBytes) || 0)
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  if (i === 0) return `${Math.round(bytes)} B`
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export const formatUptime = (rawSeconds = 0) => {
  const total = Math.max(0, Math.floor(Number(rawSeconds) || 0))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

/** Geometry for dual-series line/area SVG charts (e.g., Bytes In vs Out, Latency p50 vs p95). */
export const buildDualLineChart = (rawSeries, { width, height, padding, keyA = 'bytesIn', keyB = 'bytesOut' }) => {
  const series = Array.isArray(rawSeries) ? rawSeries : []
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const baselineY = padding.top + plotHeight

  if (series.length === 0) {
    return { points: [], pathA: '', pathB: '', areaA: '', areaB: '', max: 0, ticks: [0, 1], tickLines: [], baselineY }
  }

  const valsA = series.map(p => Math.max(0, Number(p?.[keyA]) || 0))
  const valsB = series.map(p => Math.max(0, Number(p?.[keyB]) || 0))
  const max = Math.max(...valsA, ...valsB, 0)
  const ticks = niceTicks(max)
  const scaleMax = Math.max(max, ticks[ticks.length - 1], 1)
  const stepX = series.length > 1 ? plotWidth / (series.length - 1) : 0
  const labelEvery = Math.max(1, Math.ceil(series.length / MAX_X_LABELS))

  const points = series.map((item, idx) => {
    const valA = valsA[idx]
    const valB = valsB[idx]
    const x = series.length > 1 ? padding.left + idx * stepX : padding.left + plotWidth / 2
    const yA = baselineY - (valA / scaleMax) * plotHeight
    const yB = baselineY - (valB / scaleMax) * plotHeight
    return {
      label: String(item?.label || item?.date || idx),
      valA,
      valB,
      x: Math.round(x * 10) / 10,
      yA: Math.round(yA * 10) / 10,
      yB: Math.round(yB * 10) / 10,
      showLabel: idx % labelEvery === 0
    }
  })

  const buildPath = (keyY) => points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt[keyY]}`).join(' ')
  const pathA = buildPath('yA')
  const pathB = buildPath('yB')
  const firstX = points[0].x
  const lastX = points[points.length - 1].x
  const areaA = `${pathA} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  const areaB = `${pathB} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`
  const tickLines = ticks.map((value) => ({ value, y: baselineY - (value / scaleMax) * plotHeight }))

  return { points, pathA, pathB, areaA, areaB, max, ticks, tickLines, baselineY }
}

const STATUS_KEYS = [
  { key: 'status2xx', color: '#10b981', label: '2xx OK' },
  { key: 'status3xx', color: '#3b82f6', label: '3xx Redirect' },
  { key: 'status4xx', color: '#f59e0b', label: '4xx Client Error' },
  { key: 'status429', color: '#a855f7', label: '429 Rate Limited' },
  { key: 'status5xx', color: '#ef4444', label: '5xx Server Error' }
]

/** Geometry for stacked HTTP status bar chart (`2xx`, `3xx`, `4xx`, `429`, `5xx`). */
export const buildStackedStatusChart = (rawSeries, { width, height, padding }) => {
  const series = Array.isArray(rawSeries) ? rawSeries : []
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const baselineY = padding.top + plotHeight

  if (series.length === 0) {
    return { columns: [], max: 0, ticks: [0, 1], tickLines: [], legend: STATUS_KEYS }
  }

  const totals = series.map(item =>
    STATUS_KEYS.reduce((sum, s) => sum + Math.max(0, Number(item?.[s.key]) || 0), 0)
  )
  const max = Math.max(...totals, 0)
  const ticks = niceTicks(max)
  const scaleMax = Math.max(max, ticks[ticks.length - 1], 1)
  const slot = plotWidth / series.length
  const labelEvery = Math.max(1, Math.ceil(series.length / MAX_X_LABELS))

  const columns = series.map((item, idx) => {
    const x = padding.left + idx * slot + (slot * BAR_GAP_RATIO) / 2
    const barWidth = Math.max(2, slot * (1 - BAR_GAP_RATIO))
    let currentBottom = baselineY
    const segments = []

    STATUS_KEYS.forEach(s => {
      const count = Math.max(0, Number(item?.[s.key]) || 0)
      if (count > 0) {
        const segHeight = (count / scaleMax) * plotHeight
        const y = currentBottom - segHeight
        segments.push({
          key: s.key,
          color: s.color,
          label: s.label,
          count,
          x,
          y,
          width: barWidth,
          height: segHeight
        })
        currentBottom = y
      }
    })

    return {
      label: String(item?.label || idx),
      total: totals[idx],
      x,
      width: barWidth,
      showLabel: idx % labelEvery === 0,
      segments
    }
  })

  const tickLines = ticks.map((value) => ({ value, y: baselineY - (value / scaleMax) * plotHeight }))
  return { columns, max, ticks, tickLines, legend: STATUS_KEYS }
}

export const getThreatBadgeMeta = (threatLevel = 'normal') => {
  if (threatLevel === 'critical') {
    return { color: 'error', severity: 'error', labelKey: 'admThreatCritical' }
  }
  if (threatLevel === 'high') {
    return { color: 'warning', severity: 'warning', labelKey: 'admThreatHigh' }
  }
  if (threatLevel === 'elevated') {
    return { color: 'info', severity: 'info', labelKey: 'admThreatElevated' }
  }
  return { color: 'success', severity: 'success', labelKey: 'admThreatNormal' }
}

/**
 * Parses CSV, TSV, or JSON array text into an array of bulk user records:
 * `{ email, displayName, username, role, password }`
 */
export const parseBulkUsersText = (rawText = '') => {
  const trimmed = String(rawText || '').trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .filter(item => item && typeof item === 'object' && item.email)
          .map(item => ({
            email: String(item.email || '').trim().toLowerCase(),
            displayName: String(item.displayName || '').trim(),
            username: String(item.username || '').trim(),
            role: ['admin', 'ops_manager', 'security_auditor', 'client'].includes(String(item.role || '').trim())
              ? String(item.role).trim()
              : 'client',
            password: String(item.password || '').trim()
          }))
      }
    } catch {
      // Fallback to line-based parsing
    }
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const splitLine = (line) => {
    const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ','
    return line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''))
  }

  const firstCells = splitLine(lines[0]).map(c => c.toLowerCase())
  const hasHeader = firstCells.some(c => c === 'email' || c === 'e-mail' || c === 'role' || c === 'displayname')
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map((line) => {
    const cells = splitLine(line)
    const email = String(cells[0] || '').trim().toLowerCase()
    const displayName = String(cells[1] || '').trim()
    const roleRaw = String(cells[2] || 'client').trim().toLowerCase()
    const role = ['admin', 'ops_manager', 'security_auditor', 'client'].includes(roleRaw) ? roleRaw : 'client'
    const password = String(cells[3] || '').trim()
    return { email, displayName, role, password }
  }).filter(row => Boolean(row.email))
}

const escapeCsvCell = (value = '') => {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Builds a downloadable CSV string for newly created / updated credentials. */
export const buildCredentialsCsv = (results = []) => {
  const header = ['Email', 'Username', 'DisplayName', 'Role', 'TemporaryPassword', 'MustChangePassword', 'Status']
  const rows = (Array.isArray(results) ? results : []).map((r) => [
    escapeCsvCell(r.email || r.user?.email || ''),
    escapeCsvCell(r.username || r.user?.username || ''),
    escapeCsvCell(r.displayName || r.user?.displayName || ''),
    escapeCsvCell(r.role || r.user?.role || 'client'),
    escapeCsvCell(r.temporaryPassword || r.initialPassword || ''),
    escapeCsvCell((r.mustChangePassword ?? r.user?.mustChangePassword) !== false ? 'TRUE' : 'FALSE'),
    escapeCsvCell(r.action || r.status || 'created')
  ])
  return [header.join(','), ...rows.map(r => r.join(','))].join('\n')
}
