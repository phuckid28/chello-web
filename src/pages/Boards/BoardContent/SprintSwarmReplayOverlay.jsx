import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { createSwarmSimulation, stepSwarmSimulation } from '~/fx/swarmEngine'
import { fxCelebrate } from '~/fx/fxEvents'
import { getPresenceViewers } from '~/apis'
import { playSpatialGlassNote, playSpatialKeyTick } from '~/utils/soundEffects'
import FigmaCursorPointer from './parts/FigmaCursorPointer'

const RULER_TICKS_X = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500]
const RULER_TICKS_Y = [0, 100, 200, 300, 400, 500, 600, 700]

const CORNER_HANDLES = [
  { top: -3, left: -3 },
  { top: -3, right: -3 },
  { bottom: -3, left: -3 },
  { bottom: -3, right: -3 }
]

function SprintSwarmReplayOverlay({ open, onClose, board, themeConfig }) {
  const [speed, setSpeed] = useState(1)
  const [soundOn, setSoundOn] = useState(true)
  const [sim, setSim] = useState(() => (open && board ? createSwarmSimulation(board, { speed: 1 }) : null))
  const lastKeyTickRef = useRef(0)
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn

  const startFreshSimulation = useCallback(
    (initialPaused = false) => {
      if (!board) return
      const viewers = board?._id ? getPresenceViewers(board._id) : []
      setSim(
        createSwarmSimulation(board, {
          viewers,
          speed,
          paused: initialPaused
        })
      )
    },
    [board, speed]
  )

  useEffect(() => {
    if (!open || !board) {
      setSim(null)
      return
    }
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    startFreshSimulation(prefersReducedMotion)
  }, [open, board, startFreshSimulation])

  // Keep simulation speed synced
  useEffect(() => {
    setSim((prev) => (prev ? { ...prev, speed } : null))
  }, [speed])

  const hasSim = Boolean(sim)
  const isPaused = Boolean(sim?.paused)

  // Animation loop with requestAnimationFrame
  useEffect(() => {
    if (!open || !hasSim || isPaused) return undefined

    let rafId = null
    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTime) / 1000))
      lastTime = now

      setSim((prevSim) => {
        if (!prevSim || prevSim.paused) return prevSim
        const { sim: nextSim, events } = stepSwarmSimulation(prevSim, dt)
        const vw = window.innerWidth || 1280

        if (soundOnRef.current) {
          // Check if any agent is actively typing text
          const typingTask = nextSim.tasks.find(
            (t) => t.state === 'active' && t.kind === 'card_text'
          )
          if (typingTask && now - lastKeyTickRef.current > 92) {
            lastKeyTickRef.current = now
            playSpatialKeyTick({
              x: typingTask.x + typingTask.w * (typingTask.progress || 0.5),
              viewportWidth: vw
            })
          }

          events.forEach((ev) => {
            if (ev.type === 'task_done') {
              if (ev.kind === 'column' || ev.kind === 'guide') {
                playSpatialGlassNote({
                  x: ev.x,
                  viewportWidth: vw,
                  isHeader: true
                })
              } else {
                playSpatialGlassNote({
                  x: ev.x,
                  viewportWidth: vw,
                  columnIndex: ev.colIndex,
                  columnCount: nextSim.blueprint.columnCount
                })
              }
            } else if (ev.type === 'all_done') {
              playSpatialGlassNote({
                x: ev.x,
                viewportWidth: vw,
                isCompleteChord: true
              })
              fxCelebrate()
            }
          })
        } else {
          events.forEach((ev) => {
            if (ev.type === 'all_done') fxCelebrate()
          })
        }

        return nextSim
      })

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [open, hasSim, isPaused])

  // Keyboard shortcuts inside overlay
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      } else if (e.key === ' ') {
        e.preventDefault()
        setSim((prev) => (prev ? { ...prev, paused: !prev.paused } : null))
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        startFreshSimulation(false)
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setSoundOn((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, startFreshSimulation])

  const taskLookups = useMemo(() => {
    const byTargetKind = new Map()
    ;(sim?.tasks || []).forEach((t) => {
      byTargetKind.set(`${t.kind}:${t.targetId}`, t)
    })
    return byTargetKind
  }, [sim?.tasks])

  if (!open || !sim) return null

  const progressPct = sim.totalCount > 0 ? Math.round((sim.doneCount / sim.totalCount) * 100) : 100
  const accent = themeConfig?.accentColor || '#38bdf8'

  return (
    <Box
      role="dialog"
      aria-label="Sprint Swarm Time-Lapse Replay"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(9, 13, 22, 0.96)' : 'rgba(248, 250, 252, 0.96)'),
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top 20px Figma Horizontal Ruler */}
      <Box
        sx={{
          position: 'relative',
          height: '20px',
          ml: '20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0b101d' : '#f1f5f9'),
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        {RULER_TICKS_X.map((pos) => (
          <Box
            key={pos}
            sx={{
              position: 'absolute',
              left: `${pos}px`,
              top: 0,
              bottom: 0,
              borderLeft: '1px solid rgba(148, 163, 184, 0.28)',
              pl: '3px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography
              sx={{
                fontSize: '9px',
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                color: 'text.secondary',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {pos}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Corner 20x20 Origin Box */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20px',
          height: '20px',
          borderRight: '1px solid rgba(148, 163, 184, 0.22)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0b101d' : '#f1f5f9'),
          display: 'grid',
          placeItems: 'center',
          fontSize: '9px',
          color: accent,
          fontWeight: 800
        }}
      >
        ⊹
      </Box>

      {/* Main Blueprint Stage + Left Vertical Ruler */}
      <Box sx={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Left 20px Figma Vertical Ruler */}
        <Box
          sx={{
            position: 'relative',
            width: '20px',
            flexShrink: 0,
            borderRight: '1px solid rgba(148, 163, 184, 0.22)',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0b101d' : '#f1f5f9'),
            overflow: 'hidden'
          }}
        >
          {RULER_TICKS_Y.map((pos) => (
            <Box
              key={pos}
              sx={{
                position: 'absolute',
                top: `${pos}px`,
                left: 0,
                right: 0,
                borderTop: '1px solid rgba(148, 163, 184, 0.28)',
                pt: '2px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography
                sx={{
                  fontSize: '8px',
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  color: 'text.secondary',
                  writingMode: 'vertical-rl',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {pos}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Scrollable / Panned Blueprint Canvas */}
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            overflow: 'auto',
            backgroundImage: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px)'
                : 'radial-gradient(rgba(15, 23, 42, 0.10) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              minWidth: `${sim.blueprint.totalWidth}px`,
              minHeight: `${sim.blueprint.totalHeight}px`,
              pb: 10
            }}
          >
            {/* 1. Red Figma Snap Guides */}
            {sim.blueprint.guides.map((g) => {
              const gTask = taskLookups.get(`guide:${g.id}`)
              if (!gTask || gTask.state === 'wait') return null
              const isHoriz = g.axis === 'y'

              return (
                <Box
                  key={g.id}
                  sx={{
                    position: 'absolute',
                    left: isHoriz ? 0 : `${g.pos}px`,
                    top: isHoriz ? `${g.pos}px` : 0,
                    right: isHoriz ? 0 : 'auto',
                    bottom: isHoriz ? 'auto' : 0,
                    width: isHoriz ? '100%' : '1px',
                    height: isHoriz ? '1px' : '100%',
                    borderTop: isHoriz ? '1px dashed rgba(242, 72, 34, 0.55)' : 'none',
                    borderLeft: !isHoriz ? '1px dashed rgba(242, 72, 34, 0.55)' : 'none',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: isHoriz ? -18 : 8,
                      left: isHoriz ? 12 : 4,
                      px: 0.6,
                      py: 0.1,
                      borderRadius: '4px',
                      bgcolor: 'rgba(242, 72, 34, 0.9)',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 700,
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {g.label}
                  </Box>
                </Box>
              )
            })}

            {/* 2. Blueprint Columns */}
            {sim.blueprint.columns.map((col) => {
              const colTask = taskLookups.get(`column:${col.id}`)
              if (!colTask || colTask.state === 'wait') return null
              const isDrawing = colTask.state === 'active'
              const p = isDrawing ? Math.max(0.08, colTask.progress) : 1

              return (
                <Box
                  key={col.id}
                  sx={{
                    position: 'absolute',
                    left: `${col.x}px`,
                    top: `${col.y}px`,
                    width: `${Math.round(col.w * p)}px`,
                    height: `${Math.round(col.h * p)}px`,
                    borderRadius: '12px',
                    border: isDrawing ? '1.5px solid #0D99FF' : '1px solid rgba(148, 163, 184, 0.26)',
                    bgcolor: (theme) =>
                      isDrawing
                        ? 'rgba(13, 153, 255, 0.06)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(15, 23, 42, 0.72)'
                          : 'rgba(255, 255, 255, 0.85)',
                    boxShadow: isDrawing ? '0 0 0 3px rgba(13, 153, 255, 0.14)' : '0 6px 20px rgba(0, 0, 0, 0.14)',
                    p: 1.5,
                    overflow: 'visible',
                    zIndex: 4
                  }}
                >
                  {isDrawing &&
                    CORNER_HANDLES.map((pos, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: 'absolute',
                          ...pos,
                          width: 6,
                          height: 6,
                          bgcolor: '#ffffff',
                          border: '1.5px solid #0D99FF'
                        }}
                      />
                    ))}

                  {!isDrawing && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {col.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={col.cardCount}
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          fontFamily: '"JetBrains Mono", Consolas, monospace'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )
            })}

            {/* 3. Blueprint Cards (Master draw + ⌥-drag Duplicate + Progressive Text Typing) */}
            {sim.blueprint.cards.map((card) => {
              const drawTask =
                taskLookups.get(`card_master:${card.id}`) || taskLookups.get(`card_dup:${card.id}`)
              const textTask = taskLookups.get(`card_text:${card.id}`)

              if (!drawTask || drawTask.state === 'wait') return null

              const isDrawingBox = drawTask.state === 'active'
              const isDupActive = drawTask.kind === 'card_dup' && isDrawingBox
              const boxProgress = isDrawingBox ? Math.max(0.12, drawTask.progress) : 1

              const currentY = isDupActive
                ? card.y - (1 - boxProgress) * (card.gapPx + card.h * 0.65)
                : card.y
              const currentW = isDupActive ? card.w : Math.round(card.w * boxProgress)
              const currentH = isDupActive ? card.h : Math.round(card.h * boxProgress)

              const textProgress =
                !textTask || textTask.state === 'wait'
                  ? 0
                  : textTask.state === 'done'
                    ? 1
                    : textTask.progress
              const isTyping = textTask?.state === 'active'
              const visibleTitle = card.title.slice(
                0,
                Math.max(0, Math.ceil(card.title.length * textProgress))
              )

              return (
                <Box key={card.id}>
                  {/* Red Figma Smart-Spacing Gap Indicator during ⌥-drag duplication */}
                  {isDupActive && card.gapPx > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${card.x + card.w / 2}px`,
                        top: `${card.y - card.gapPx}px`,
                        height: `${card.gapPx}px`,
                        borderLeft: '1.5px dashed #F24822',
                        zIndex: 12,
                        pointerEvents: 'none'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 6,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          px: 0.55,
                          py: 0.1,
                          borderRadius: '4px',
                          bgcolor: '#F24822',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 800,
                          fontFamily: '"JetBrains Mono", Consolas, monospace',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {`⌥ +${card.gapPx}px`}
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${card.x}px`,
                      top: `${Math.round(currentY)}px`,
                      width: `${currentW}px`,
                      height: `${currentH}px`,
                      borderRadius: '10px',
                      border:
                        isDrawingBox || isTyping
                          ? '1.5px solid #0D99FF'
                          : '1px solid rgba(148, 163, 184, 0.24)',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? '#131b2e' : '#ffffff',
                      boxShadow: isDupActive
                        ? '0 12px 28px rgba(13, 153, 255, 0.28)'
                        : '0 2px 8px rgba(15, 23, 42, 0.12)',
                      p: 1.1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      zIndex: isDupActive ? 10 : 6
                    }}
                  >
                    {isDrawingBox &&
                      CORNER_HANDLES.map((pos, i) => (
                        <Box
                          key={i}
                          sx={{
                            position: 'absolute',
                            ...pos,
                            width: 5,
                            height: 5,
                            bgcolor: '#ffffff',
                            border: '1.5px solid #0D99FF'
                          }}
                        />
                      ))}

                    {!isDrawingBox && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                          <Typography
                            sx={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              fontFamily: '"JetBrains Mono", Consolas, monospace',
                              color: accent
                            }}
                          >
                            {card.crCode}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              px: 0.6,
                              py: 0.1,
                              borderRadius: '4px',
                              bgcolor: 'rgba(56, 189, 248, 0.14)',
                              color: 'text.secondary'
                            }}
                          >
                            {card.baStatus}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '1.9em'
                          }}
                        >
                          {visibleTitle}
                          {isTyping && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                width: '2px',
                                height: '12px',
                                bgcolor: '#0D99FF',
                                ml: '2px',
                                verticalAlign: 'middle'
                              }}
                            />
                          )}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.25 }}>
                          <Typography
                            sx={{
                              fontSize: '0.64rem',
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '70%'
                            }}
                          >
                            👤 {card.assignee}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.62rem',
                              fontFamily: '"JetBrains Mono", Consolas, monospace',
                              fontWeight: 700,
                              color: card.devProgress >= 100 ? '#10b981' : 'text.secondary'
                            }}
                          >
                            {card.devProgress}%
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              )
            })}

            {/* 4. Multi-Agent Swarm Cursors */}
            {sim.agents.map((agent) => (
              <FigmaCursorPointer
                key={agent.id}
                x={agent.x}
                y={agent.y}
                name={agent.name}
                color={agent.color}
                tool={agent.tool}
                badge={agent.badge}
                isAi={agent.role === 'ai'}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Bottom Floating HUD Control Bar (with mandatory Pause/Resume control per modern-web-guidance) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          py: 1,
          borderRadius: '14px',
          bgcolor: 'rgba(15, 23, 42, 0.92)',
          border: `1px solid ${accent}`,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
          color: '#f8fafc',
          flexWrap: 'wrap',
          maxWidth: '95vw'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: accent }} />
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              letterSpacing: '0.05em'
            }}
          >
            SWARM REPLAY
          </Typography>
          <Chip
            size="small"
            label={`${sim.agents.length} Cursors`}
            sx={{
              height: 20,
              fontSize: '0.66rem',
              fontWeight: 800,
              bgcolor: 'rgba(56, 189, 248, 0.18)',
              color: '#bae6fd'
            }}
          />
        </Box>

        <Box sx={{ width: { xs: 90, sm: 140 }, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', fontFamily: 'monospace' }}>
            <span>{sim.completed ? 'COMPLETED ✓' : 'BUILDING...'}</span>
            <span>
              {sim.doneCount}/{sim.totalCount} ({progressPct}%)
            </span>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              height: 5,
              borderRadius: 3,
              bgcolor: 'rgba(148, 163, 184, 0.25)',
              '& .MuiLinearProgress-bar': { bgcolor: sim.completed ? '#10b981' : accent }
            }}
          />
        </Box>

        <Tooltip title={sim.paused ? 'Tiếp tục phát (Space)' : 'Tạm dừng chuyển động (Space)'}>
          <Button
            size="small"
            variant="contained"
            onClick={() => setSim((prev) => (prev ? { ...prev, paused: !prev.paused } : null))}
            startIcon={sim.paused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.74rem',
              borderRadius: '8px',
              bgcolor: sim.paused ? '#10b981' : 'rgba(56, 189, 248, 0.24)',
              color: '#ffffff',
              '&:hover': { bgcolor: sim.paused ? '#059669' : 'rgba(56, 189, 248, 0.38)' }
            }}
          >
            {sim.paused ? 'Tiếp tục' : 'Tạm dừng'}
          </Button>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
          {[1, 2, 3].map((spd) => (
            <Chip
              key={spd}
              size="small"
              label={`${spd}×`}
              clickable
              onClick={() => setSpeed(spd)}
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 800,
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                bgcolor: speed === spd ? accent : 'rgba(255,255,255,0.08)',
                color: speed === spd ? '#0f172a' : '#e2e8f0'
              }}
            />
          ))}
        </Box>

        <Tooltip title={soundOn ? 'Tắt âm thanh Spatial Glass Piano (M)' : 'Bật âm thanh Spatial Glass Piano (M)'}>
          <IconButton
            size="small"
            onClick={() => setSoundOn((prev) => !prev)}
            sx={{ color: soundOn ? '#34d399' : '#94a3b8', bgcolor: 'rgba(255,255,255,0.08)' }}
          >
            {soundOn ? <VolumeUpRoundedIcon fontSize="small" /> : <VolumeOffRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Phát lại từ đầu (R)">
          <IconButton
            size="small"
            onClick={() => startFreshSimulation(false)}
            sx={{ color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.08)' }}
          >
            <ReplayRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Thoát về bảng Live (Esc)">
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onClose}
            startIcon={<CloseRoundedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.74rem',
              borderRadius: '8px',
              borderColor: 'rgba(248, 250, 252, 0.35)'
            }}
          >
            Go Live
          </Button>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default SprintSwarmReplayOverlay
