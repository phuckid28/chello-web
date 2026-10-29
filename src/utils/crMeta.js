// CR metadata shared across views: Priority scale (Jira-style) & helpers

export const PRIORITY_OPTIONS = [
  { value: 'highest', label: 'Highest', icon: '⏫', color: '#dc2626', weight: 5 },
  { value: 'high', label: 'High', icon: '🔺', color: '#f97316', weight: 4 },
  { value: 'medium', label: 'Medium', icon: '🟰', color: '#eab308', weight: 3 },
  { value: 'low', label: 'Low', icon: '🔻', color: '#0ea5e9', weight: 2 },
  { value: 'lowest', label: 'Lowest', icon: '⏬', color: '#64748b', weight: 1 }
]

export const DEFAULT_PRIORITY = 'medium'

export const getPriorityOption = (rawPriority) => {
  const key = String(rawPriority || '').trim().toLowerCase()
  return PRIORITY_OPTIONS.find(o => o.value === key) ||
    PRIORITY_OPTIONS.find(o => o.value === DEFAULT_PRIORITY)
}

// Accepts Jira / Excel style values like "P1", "Critical", "Cao", "Thấp"
export const normalizePriority = (rawPriority) => {
  const s = String(rawPriority || '').trim().toLowerCase()
  if (!s) return DEFAULT_PRIORITY
  const exact = PRIORITY_OPTIONS.find(o => o.value === s)
  if (exact) return exact.value
  if (/^(p0|blocker|critical|urgent|khẩn|rất cao)/.test(s)) return 'highest'
  if (/^(p1|major|cao)/.test(s)) return 'high'
  if (/^(p3|minor|thấp)/.test(s)) return 'low'
  if (/^(p4|trivial|rất thấp)/.test(s)) return 'lowest'
  return DEFAULT_PRIORITY
}
