// Shared constants for the Knowledge Graph (node types, edge kinds, defaults, tuning values)

export const NODE_TYPES = ['sprint', 'topic', 'cr', 'member', 'frd', 'wiki', 'tag']

// Node types the user can toggle in the Filters panel (the Sprint root is always visible)
export const TOGGLEABLE_TYPES = ['topic', 'cr', 'member', 'frd', 'wiki', 'tag']

export const EDGE_KINDS = ['topic', 'contains', 'assigned', 'frd', 'wikilink', 'tagged']

// Edge kinds that represent knowledge links (used for backlinks / orphan detection)
export const LINK_KINDS = ['wikilink']

export const NODE_BASE_RADIUS = {
  sprint: 20,
  topic: 14,
  cr: 10,
  member: 9,
  frd: 6.5,
  wiki: 9,
  tag: 7
}

// Fixed palette per node type (Sprint takes the theme accent, CR takes its Status colour)
export const TYPE_COLORS = {
  topic: '#818cf8',
  member: '#f472b6',
  frd: '#34d399',
  wiki: '#e879f9',
  tag: '#fbbf24'
}

export const SPRINT_FALLBACK_COLOR = '#38bdf8'
export const WIKILINK_COLOR = '#f5d061'
export const PATH_COLOR = '#22d3ee'
export const OVERDUE_COLOR = '#ef4444'

export const DEFAULT_FILTERS = {
  topic: true,
  cr: true,
  member: true,
  frd: true,
  wiki: true,
  tag: false
}

export const DEFAULT_DISPLAY = {
  labels: true,
  arrows: false,
  sizeBy: 'degree',
  hulls: false,
  orphans: true,
  minimap: true,
  glow: true
}

export const DEFAULT_FORCES = {
  repel: 100,
  linkDistance: 80,
  centerStrength: 0.35
}

export const FORCE_LIMITS = {
  repel: { min: 20, max: 500, step: 5 },
  linkDistance: { min: 30, max: 220, step: 5 },
  centerStrength: { min: 0, max: 1, step: 0.05 }
}

export const CAMERA_LIMITS = { min: 0.06, max: 4 }
export const FIT_PADDING = 56
export const FIT_DURATION_MS = 520

// Zoom level at which every label becomes visible (below it only important labels show)
export const LABEL_ZOOM_FULL = 0.85
export const LABEL_ZOOM_FADE = 0.45
export const DETAIL_ZOOM = 0.55
export const MAX_LABEL_LENGTH = 26

export const BORN_DURATION_MS = 460
export const BORN_STAGGER_MS = 5
export const BORN_STAGGER_MAX_MS = 700

export const QUERY_KEYS = ['type', 'status', 'assignee', 'tag', 'priority', 'overdue', 'orphan', 'topic']

export const PIN_STORAGE_PREFIX = 'chella_graph_pins_'
export const SETTINGS_STORAGE_KEY = 'chella_graph_settings'

export const LOCAL_DEPTHS = [1, 2, 3]
export const DEFAULT_LOCAL_DEPTH = 2

export const TIMELAPSE_TICK_MS = 140
export const TIMELAPSE_TARGET_STEPS = 90
