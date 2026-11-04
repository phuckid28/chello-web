// Clean-room Multiplayer Cursor Swarm, Spatial Pentatonic Audio Math & Sprint Time-Lapse Engine
// Inspired by Figma multiplayer cursors & procedural swarm choreography.

export const CURSOR_PALETTE = [
  '#0D99FF', // Figma Blue
  '#F24822', // Coral Red
  '#10B981', // Emerald
  '#A855F7', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Rose Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16' // Lime
]

const FALLBACK_AGENT_NAMES = [
  'Chella AI • Gemini',
  'Sora Architect',
  'Sprint Bot',
  'QA Inspector',
  'BA Reviewer',
  'Release Guard',
  'UX Co-Pilot',
  'Schema Bot'
]

// E Major Pentatonic intervals in semitones above E: E, F#, G#, B, C#
export const E_MAJOR_PENTATONIC = [0, 2, 4, 7, 9]
export const BASE_MIDI_E2 = 40
export const BASE_MIDI_E3 = 52

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const computeSpatialPan = (x = 500, viewportWidth = 1280) => {
  const safeW = Math.max(1, Number(viewportWidth) || 1280)
  const raw = (Number(x) / safeW) * 1.6 - 0.8
  return Math.round(clamp(raw, -0.8, 0.8) * 1000) / 1000
}

export const midiToFreq = (midi = 69) => {
  return 440 * Math.pow(2, (Number(midi) - 69) / 12)
}

export const pickPentatonicMidi = ({
  x = 600,
  viewportWidth = 1280,
  columnIndex = 0,
  columnCount = 1,
  isHeader = false
} = {}) => {
  if (isHeader) {
    return BASE_MIDI_E3 // E3 warm root note for column/header frames
  }
  const safeCols = Math.max(1, Number(columnCount) || 1)
  const colRatio = clamp(Number(columnIndex) / Math.max(1, safeCols - 1), 0, 1)
  const xRatio = clamp(Number(x) / Math.max(1, Number(viewportWidth) || 1280), 0, 1)
  const blended = colRatio * 0.65 + xRatio * 0.35

  // Span 12 pentatonic steps (over 2 octaves from E3 to C#5)
  const totalSteps = 12
  const stepIndex = clamp(Math.round(blended * (totalSteps - 1)), 0, totalSteps - 1)
  const octave = Math.floor(stepIndex / E_MAJOR_PENTATONIC.length)
  const degree = E_MAJOR_PENTATONIC[stepIndex % E_MAJOR_PENTATONIC.length]
  return BASE_MIDI_E3 + octave * 12 + degree
}

export const getCursorColorForUser = (seed = '') => {
  const str = String(seed || 'chella')
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return CURSOR_PALETTE[hash % CURSOR_PALETTE.length]
}

export const extractSprintAgents = (board = {}, viewers = []) => {
  const names = []
  const pushUnique = (rawName, role = 'member') => {
    const clean = String(rawName || '').trim()
    if (!clean) return
    if (names.some((item) => item.name.toLowerCase() === clean.toLowerCase())) return
    names.push({
      id: `agent-${names.length}`,
      name: clean,
      role,
      color: getCursorColorForUser(clean)
    })
  }

  // Always include the AI Co-Pilot agent first
  pushUnique('🤖 Gemini AI', 'ai')

  // Online board viewers
  ;(viewers || []).forEach((v) => {
    const u = v?.user || v
    pushUnique(u?.displayName || u?.username, 'live')
  })

  // Board members
  ;(board?.FE_allUsers || []).forEach((u) => {
    pushUnique(u?.displayName || u?.username, 'member')
  })

  // Card assignees ("Handle by" comma-separated names)
  ;(board?.columns || []).forEach((col) => {
    const colCards = col?.cards || []
    colCards.forEach((card) => {
      if (card?.FE_PlaceholderCard || !card?.assignee) return
      String(card.assignee)
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((assigneeName) => pushUnique(assigneeName, 'assignee'))
    })
  })

  // Pad up to at least 6 agents so the swarm feels lively
  let idx = 0
  while (names.length < 6 && idx < FALLBACK_AGENT_NAMES.length) {
    pushUnique(FALLBACK_AGENT_NAMES[idx], 'bot')
    idx += 1
  }

  return names.slice(0, 14)
}

export const buildSprintSwarmBlueprint = (board = {}) => {
  const rawColumns = (board?.columns || []).filter(Boolean)
  const colWidth = 278
  const colGap = 18
  const startX = 44
  const startY = 74
  const cardHeight = 96
  const cardGap = 12

  const guides = [
    {
      id: 'guide-y-header',
      axis: 'y',
      pos: startY,
      label: `Y: ${startY}px • Sprint Baseline`
    },
    ...rawColumns.slice(0, 6).map((col, idx) => ({
      id: `guide-x-col-${col._id || idx}`,
      axis: 'x',
      pos: startX + idx * (colWidth + colGap),
      label: `X: ${startX + idx * (colWidth + colGap)}px • ${col.title || `Col ${idx + 1}`}`
    }))
  ]

  const columns = []
  const cards = []
  const tasks = []

  const addTask = (spec) => {
    const task = {
      id: `task-${tasks.length}`,
      state: 'wait',
      progress: 0,
      deps: [],
      ...spec
    }
    tasks.push(task)
    return task
  }

  // 1. Guide tasks
  const guideTaskIds = guides.map((g) => {
    const t = addTask({
      kind: 'guide',
      targetId: g.id,
      x: g.axis === 'x' ? g.pos : startX + 120,
      y: g.axis === 'y' ? g.pos : startY - 18,
      w: g.axis === 'x' ? 2 : 600,
      h: g.axis === 'y' ? 2 : 420,
      tool: 'arrow',
      badge: g.label,
      duration: 0.42
    })
    return t.id
  })

  // 2. Column & Card tasks
  rawColumns.forEach((col, colIndex) => {
    const realCards = (col?.cards || []).filter((c) => !c?.FE_PlaceholderCard)
    const colX = startX + colIndex * (colWidth + colGap)
    const colH = Math.max(190, 68 + realCards.length * (cardHeight + cardGap))
    const colId = String(col._id || `col-${colIndex}`)

    columns.push({
      id: colId,
      title: col.title || `Column ${colIndex + 1}`,
      colIndex,
      x: colX,
      y: startY,
      w: colWidth,
      h: colH,
      cardCount: realCards.length
    })

    const colTask = addTask({
      kind: 'column',
      targetId: colId,
      colIndex,
      x: colX,
      y: startY,
      w: colWidth,
      h: colH,
      tool: 'cross',
      badge: `${colWidth} × ${colH}`,
      label: col.title || 'Column',
      deps: guideTaskIds.slice(0, 2),
      duration: 0.65
    })

    let masterCardId = null
    let masterTaskId = null
    let prevCardBottom = startY + 52

    realCards.forEach((card, cardIndex) => {
      const cardId = String(card._id || `card-${colIndex}-${cardIndex}`)
      const cardX = colX + 12
      const cardY = startY + 52 + cardIndex * (cardHeight + cardGap)
      const cardW = colWidth - 24
      const isDuplicate = cardIndex > 0 && Boolean(masterCardId)
      const gapPx = isDuplicate ? cardY - prevCardBottom : 0
      prevCardBottom = cardY + cardHeight

      cards.push({
        id: cardId,
        columnId: colId,
        colIndex,
        cardIndex,
        crCode: card.crCode || `CR-${colIndex + 1}0${cardIndex + 1}`,
        title: card.title || 'Untitled CR',
        assignee: card.assignee || 'Unassigned',
        baStatus: card.baStatus || col.title || 'Processing',
        priority: card.priority || 'Medium',
        devProgress: Number(card.devProgress) || 0,
        x: cardX,
        y: cardY,
        w: cardW,
        h: cardHeight,
        isDuplicate,
        masterCardId: isDuplicate ? masterCardId : null,
        gapPx
      })

      if (!isDuplicate) {
        masterCardId = cardId
        const drawTask = addTask({
          kind: 'card_master',
          targetId: cardId,
          colIndex,
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardHeight,
          tool: 'cross',
          badge: `${cardW} × ${cardHeight}`,
          label: card.crCode || card.title,
          deps: [colTask.id],
          duration: 0.6
        })
        masterTaskId = drawTask.id

        addTask({
          kind: 'card_text',
          targetId: cardId,
          colIndex,
          x: cardX + 14,
          y: cardY + 26,
          w: cardW - 28,
          h: 42,
          tool: 'ibeam',
          badge: `✏️ ${card.crCode || 'CR'}`,
          label: card.title || '',
          deps: [drawTask.id],
          duration: 0.55
        })
      } else {
        const dupTask = addTask({
          kind: 'card_dup',
          targetId: cardId,
          masterCardId,
          colIndex,
          x: cardX,
          y: cardY,
          w: cardW,
          h: cardHeight,
          gapPx,
          tool: 'dup',
          badge: `⌥ +${gapPx}px`,
          label: card.crCode || card.title,
          deps: [masterTaskId],
          duration: 0.52
        })

        addTask({
          kind: 'card_text',
          targetId: cardId,
          colIndex,
          x: cardX + 14,
          y: cardY + 26,
          w: cardW - 28,
          h: 42,
          tool: 'ibeam',
          badge: `✏️ ${card.crCode || 'CR'}`,
          label: card.title || '',
          deps: [dupTask.id],
          duration: 0.48
        })
      }
    })
  })

  const totalWidth = Math.max(960, startX * 2 + rawColumns.length * (colWidth + colGap))
  const totalHeight = Math.max(540, ...columns.map((c) => c.y + c.h + 60))

  return {
    guides,
    columns,
    cards,
    tasks,
    totalWidth,
    totalHeight,
    columnCount: Math.max(1, rawColumns.length)
  }
}

export const createSwarmSimulation = (board = {}, options = {}) => {
  const blueprint = buildSprintSwarmBlueprint(board)
  const agents = extractSprintAgents(board, options.viewers || []).map((ag, idx) => {
    const fromLeft = idx % 2 === 0
    return {
      ...ag,
      x: fromLeft ? 24 : blueprint.totalWidth - 60,
      y: 80 + (idx * 52) % 360,
      targetX: 180 + idx * 45,
      targetY: 140 + (idx % 4) * 70,
      tool: 'arrow',
      badge: '',
      taskId: null,
      orbitAngle: (idx / 8) * Math.PI * 2
    }
  })

  return {
    blueprint,
    agents,
    tasks: blueprint.tasks.map((t) => ({ ...t })),
    time: 0,
    speed: clamp(Number(options.speed) || 1, 0.5, 4),
    paused: Boolean(options.paused),
    doneCount: 0,
    totalCount: blueprint.tasks.length,
    completed: blueprint.tasks.length === 0
  }
}

export const stepSwarmSimulation = (sim, dt = 0.016) => {
  if (!sim || sim.paused) {
    return { sim, events: [] }
  }

  const clampedDt = clamp(Number(dt) || 0.016, 0.001, 0.35) * (sim.speed || 1)
  const nextTime = sim.time + clampedDt
  const tasks = sim.tasks.map((t) => ({ ...t }))
  const taskById = new Map(tasks.map((t) => [t.id, t]))
  const events = []

  const isDepsDone = (task) => (task.deps || []).every((depId) => taskById.get(depId)?.state === 'done')

  const agents = sim.agents.map((agent, idx) => {
    const nextAgent = { ...agent }
    let currentTask = nextAgent.taskId ? taskById.get(nextAgent.taskId) : null

    // Assign an unlocked waiting task if agent is idle
    if (!currentTask || currentTask.state === 'done') {
      const candidate = tasks.find((t) => t.state === 'wait' && isDepsDone(t))
      if (candidate) {
        candidate.state = 'active'
        candidate.progress = 0
        nextAgent.taskId = candidate.id
        currentTask = candidate
      } else {
        nextAgent.taskId = null
        currentTask = null
      }
    }

    if (currentTask) {
      currentTask.progress = clamp(
        currentTask.progress + clampedDt / Math.max(0.18, currentTask.duration || 0.5),
        0,
        1
      )
      const p = currentTask.progress
      nextAgent.tool = currentTask.tool || 'arrow'
      nextAgent.badge = currentTask.badge || ''

      if (currentTask.kind === 'column' || currentTask.kind === 'card_master') {
        nextAgent.targetX = currentTask.x + currentTask.w * p
        nextAgent.targetY = currentTask.y + currentTask.h * p
        nextAgent.badge = `${Math.round(currentTask.w * p)} × ${Math.round(currentTask.h * p)}`
      } else if (currentTask.kind === 'card_dup') {
        nextAgent.targetX = currentTask.x + currentTask.w * 0.5
        nextAgent.targetY = currentTask.y - (1 - p) * (currentTask.gapPx + 40) + currentTask.h * 0.4
      } else if (currentTask.kind === 'card_text') {
        nextAgent.targetX = currentTask.x + currentTask.w * p
        nextAgent.targetY = currentTask.y + 12
      } else {
        nextAgent.targetX = currentTask.x
        nextAgent.targetY = currentTask.y
      }

      if (currentTask.progress >= 1) {
        currentTask.state = 'done'
        nextAgent.taskId = null
        nextAgent.badge = ''
        nextAgent.tool = 'arrow'
        events.push({
          type: 'task_done',
          kind: currentTask.kind,
          targetId: currentTask.targetId,
          colIndex: currentTask.colIndex || 0,
          x: currentTask.x + (currentTask.w || 0) / 2,
          y: currentTask.y + (currentTask.h || 0) / 2
        })
      }
    } else {
      // Gentle Boids / orbital flocking when idle or after completion
      const angle = nextAgent.orbitAngle + nextTime * 1.3 + idx * 0.45
      const centerX = sim.blueprint.totalWidth * 0.45
      const centerY = 230
      nextAgent.targetX = centerX + Math.cos(angle) * (120 + (idx % 4) * 38)
      nextAgent.targetY = centerY + Math.sin(angle * 1.2) * (75 + (idx % 3) * 26)
      nextAgent.tool = 'arrow'
      nextAgent.badge = ''
    }

    // Smooth spring interpolation toward target
    const lerpFactor = clamp(clampedDt * 9.5, 0.12, 0.85)
    nextAgent.x += (nextAgent.targetX - nextAgent.x) * lerpFactor
    nextAgent.y += (nextAgent.targetY - nextAgent.y) * lerpFactor

    return nextAgent
  })

  const doneCount = tasks.filter((t) => t.state === 'done').length
  const completed = doneCount >= tasks.length && tasks.length > 0
  if (completed && !sim.completed) {
    events.push({
      type: 'all_done',
      x: sim.blueprint.totalWidth * 0.5
    })
  }

  return {
    sim: {
      ...sim,
      tasks,
      agents,
      time: nextTime,
      doneCount,
      completed
    },
    events
  }
}
