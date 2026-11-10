import { useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { toast } from 'react-toastify'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { buildSprintRecapDeck, downloadSprintRecapHtml } from '~/utils/sprintRecapSlides'
import { playUiChime } from '~/utils/soundEffects'
import { fxCelebrate } from '~/fx/fxEvents'

function SprintRecapModal({ open, onClose, board }) {
  const { themeConfig } = usePersonaTheme(board?.theme)
  const deck = useMemo(() => buildSprintRecapDeck(board), [board])
  const { metrics, slides } = deck

  const [sceneIdx, setSceneIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    if (open) {
      setSceneIdx(0)
      setAutoPlay(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !autoPlay) return undefined
    const timer = setInterval(() => {
      setSceneIdx((prev) => {
        if (prev >= slides.length - 1) {
          setAutoPlay(false)
          playUiChime('complete')
          fxCelebrate()
          return prev
        }
        playUiChime('sparkle')
        return prev + 1
      })
    }, 4200)
    return () => clearInterval(timer)
  }, [open, autoPlay, slides.length])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setAutoPlay(false)
        setSceneIdx((prev) => Math.min(slides.length - 1, prev + 1))
        playUiChime('sparkle')
      } else if (e.key === 'ArrowLeft') {
        setAutoPlay(false)
        setSceneIdx((prev) => Math.max(0, prev - 1))
        playUiChime('sparkle')
      } else if (e.key === ' ') {
        e.preventDefault()
        setAutoPlay((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, slides.length])

  const activeSlide = slides[sceneIdx] || slides[0]

  const handleExportHtml = () => {
    playUiChime('complete')
    downloadSprintRecapHtml(board, themeConfig)
    toast.success(`Đã xuất Slide Deck HTML (${metrics.sprintName}) ✓`)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          color: '#f8fafc',
          backgroundImage: `${themeConfig.boardOverlayDark}, url(${themeConfig.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: `1.5px solid ${themeConfig.accentColor}`,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)'
        }
      }}
    >
      {/* Top Scene Progress & Controls */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: 'rgba(9, 13, 22, 0.82)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.14)'
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${slides.length}, 1fr)`, gap: 1, mb: 1.25 }}>
          {slides.map((s, idx) => (
            <Box
              key={s.id}
              onClick={() => {
                setAutoPlay(false)
                setSceneIdx(idx)
                playUiChime('sparkle')
              }}
              sx={{
                height: 5,
                borderRadius: 99,
                cursor: 'pointer',
                bgcolor: idx <= sceneIdx ? themeConfig.accentColor : 'rgba(255, 255, 255, 0.18)',
                transition: 'background-color 0.25s ease'
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeRoundedIcon sx={{ color: themeConfig.accentColor, fontSize: 18 }} />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: themeConfig.accentColor
              }}
            >
              SPRINT WRAPPED DECK • {activeSlide.index}/0{slides.length}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              startIcon={autoPlay ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setAutoPlay((prev) => !prev)}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.28)',
                fontWeight: 700,
                fontSize: '0.74rem'
              }}
            >
              {autoPlay ? 'Pause' : 'Auto-Play'}
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleExportHtml}
              sx={{
                fontWeight: 800,
                fontSize: '0.74rem',
                color: '#0f172a',
                bgcolor: themeConfig.accentColor,
                '&:hover': { bgcolor: themeConfig.secondaryAccent, color: 'white' }
              }}
            >
              Export Slide HTML
            </Button>
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* Animated Slide Stage */}
      <Box
        key={activeSlide.id}
        className="chella-blur-enter"
        sx={{
          p: { xs: 2.5, md: 4 },
          minHeight: 370,
          bgcolor: 'rgba(9, 13, 22, 0.72)',
          backdropFilter: 'blur(14px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: themeConfig.accentColor,
              mb: 0.75
            }}
          >
            {activeSlide.eyebrow}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em', mb: 0.5 }}>
            {activeSlide.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(248, 250, 252, 0.78)', mb: 3 }}>
            {activeSlide.subtitle}
          </Typography>

          {/* Scene 01: Executive Hero */}
          {activeSlide.id === 'hero' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {[
                { label: 'TOTAL CRS', value: String(metrics.totalCrs).padStart(2, '0'), color: '#f8fafc' },
                { label: 'STORY POINTS', value: `${metrics.totalPoints}pt`, color: '#34d399' },
                { label: 'AVG VELOCITY', value: `${metrics.avgProgressPercent}%`, color: themeConfig.accentColor },
                { label: 'COMPLETION RATE', value: `${metrics.completionRate}%`, color: '#fbbf24' }
              ].map((kpi) => (
                <Box
                  key={kpi.label}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: 'rgba(15, 23, 42, 0.82)',
                    border: `1px solid ${themeConfig.columnBorder}`
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: 'rgba(248, 250, 252, 0.65)'
                    }}
                  >
                    {kpi.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: kpi.color,
                      mt: 0.5,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Scene 02: Velocity & Topic Breakdown */}
          {activeSlide.id === 'velocity' && (
            <Stack spacing={1.25}>
              {metrics.topicBreakdown.map((t) => {
                const share = metrics.totalCrs > 0 ? Math.round((t.count / metrics.totalCrs) * 100) : 0
                return (
                  <Box
                    key={t.topic}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: 'rgba(15, 23, 42, 0.82)',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {t.topic}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: '"JetBrains Mono", Consolas, monospace', fontWeight: 800, color: themeConfig.accentColor }}
                      >
                        {t.count} CRs • {t.points}pt ({share}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={share}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.12)',
                        '& .MuiLinearProgress-bar': { bgcolor: themeConfig.accentColor }
                      }}
                    />
                  </Box>
                )
              })}
            </Stack>
          )}

          {/* Scene 03: Spec-Kit SDD & Evidence Quality */}
          {activeSlide.id === 'speckit' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(52, 211, 153, 0.45)' }}>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800 }}>
                  SPEC-KIT CONVERGED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                  {metrics.convergedCount} / {metrics.totalCrs}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248,250,252,0.72)' }}>
                  CRs đạt chuẩn Spec-Driven Development
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(56, 189, 248, 0.45)' }}>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800 }}>
                  ATTACHED FRD DOCS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                  {metrics.totalFrds}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248,250,252,0.72)' }}>
                  Tài liệu đặc tả FRD đính kèm trực tiếp
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(192, 132, 252, 0.45)' }}>
                <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 800 }}>
                  OBSIDIAN WIKILINKS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                  {metrics.totalLinks}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248,250,252,0.72)' }}>
                  Liên kết chéo giữa các CR & Knowledge Hub
                </Typography>
              </Box>
            </Box>
          )}

          {/* Scene 04: Team MVPs & Highlighted CRs */}
          {activeSlide.id === 'spotlight' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, gap: 2 }}>
              <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: themeConfig.accentColor, display: 'block', mb: 1 }}>
                  🏆 TOP CONTRIBUTORS (HANDLE BY)
                </Typography>
                <Stack spacing={0.85}>
                  {metrics.topContributors.map((c, i) => (
                    <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {i + 1}. {c.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${c.crCount} CRs • ${c.points}pt`}
                        sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, color: '#0f172a', bgcolor: themeConfig.accentColor }}
                      />
                    </Box>
                  ))}
                  {metrics.topContributors.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'rgba(248,250,252,0.65)' }}>
                      Chưa phân công Handle by
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box sx={{ p: 1.75, borderRadius: '14px', bgcolor: 'rgba(15, 23, 42, 0.82)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#34d399', display: 'block', mb: 1 }}>
                  🚀 KEY DELIVERABLES
                </Typography>
                <Stack spacing={0.85}>
                  {metrics.highlightedCrs.map((cr) => (
                    <Box key={cr._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        <Box component="span" sx={{ fontFamily: 'monospace', color: themeConfig.accentColor, mr: 0.75 }}>
                          [{cr.crCode}]
                        </Box>
                        {cr.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${cr.progressPercent}%`}
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, color: '#f8fafc', bgcolor: 'rgba(16, 185, 129, 0.28)' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom Navigation Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <Button
            size="small"
            startIcon={<ArrowBackIosNewRoundedIcon fontSize="small" />}
            disabled={sceneIdx === 0}
            onClick={() => {
              setAutoPlay(false)
              setSceneIdx((prev) => Math.max(0, prev - 1))
              playUiChime('sparkle')
            }}
            sx={{ color: 'white', fontWeight: 700 }}
          >
            Previous
          </Button>
          <Typography variant="caption" sx={{ color: 'rgba(248,250,252,0.68)', fontFamily: 'monospace' }}>
            Use ← / → or Space to navigate
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIosRoundedIcon fontSize="small" />}
            disabled={sceneIdx === slides.length - 1}
            onClick={() => {
              setAutoPlay(false)
              setSceneIdx((prev) => Math.min(slides.length - 1, prev + 1))
              playUiChime('sparkle')
            }}
            sx={{ color: themeConfig.accentColor, fontWeight: 800 }}
          >
            Next Scene
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default SprintRecapModal
