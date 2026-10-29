// Dev Progress helpers: progress is picked from 0% to 100% in 10% steps.
// It is persisted as a fraction (0 → 1) so existing cards and Excel imports keep working.

export const PROGRESS_STEP_PERCENT = 10
export const PROGRESS_STEP_COUNT = 100 / PROGRESS_STEP_PERCENT

export const PROGRESS_OPTIONS = Array.from({ length: PROGRESS_STEP_COUNT + 1 }, (_, i) => {
  const percent = i * PROGRESS_STEP_PERCENT
  return { percent, value: percent / 100, label: `${percent}%` }
})

// Accepts 0.7, "0.7", 70, "70", "70%", "70 %" and returns the nearest 10% step as a fraction.
export const snapProgress = (raw) => {
  if (raw === undefined || raw === null || raw === '') return 0
  const text = String(raw).trim().replace(',', '.')
  const hasPercentSign = text.endsWith('%')
  const num = Number(hasPercentSign ? text.slice(0, -1) : text)
  if (!Number.isFinite(num)) return 0
  const percent = hasPercentSign || num > 1 ? num : num * 100
  const clamped = Math.min(100, Math.max(0, percent))
  const stepped = Math.round(clamped / PROGRESS_STEP_PERCENT) * PROGRESS_STEP_PERCENT
  return stepped / 100
}

export const progressToPercent = (raw) => Math.round(snapProgress(raw) * 100)

export const formatProgress = (raw) => `${progressToPercent(raw)}%`

// Cold → warm → green scale used by progress bars and graph rings
export const getProgressColor = (raw) => {
  const percent = progressToPercent(raw)
  if (percent >= 100) return '#10b981'
  if (percent >= 70) return '#22c55e'
  if (percent >= 40) return '#f59e0b'
  if (percent > 0) return '#fb7185'
  return '#94a3b8'
}
