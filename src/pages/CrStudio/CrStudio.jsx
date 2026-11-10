import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import LinearProgress from '@mui/material/LinearProgress'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import FrdVisualDocument from '~/components/Modal/ActiveCard/FrdVisualDocument'
import { exportFrdAsPrintablePdf } from '~/utils/frdPdfExporter'
import {
  fetchBoardDetailsAPI,
  selectCurrentActiveBoard,
  updateCardInBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { updateCardDetailsAPI } from '~/apis'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import {
  BA_STATUS_OPTIONS,
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  downloadAttachedFrdFile,
  exportCardAsFrdMarkdown,
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  normalizeCrStatus,
  parseAssigneeList
} from '~/utils/excelExporter'
import { snapProgress, formatProgress, progressToPercent } from '~/utils/progress'
import ProgressSelect from '~/components/Modal/ProgressSelect'
import LoadingButton from '~/components/Loading/LoadingButton'
import { fxCelebrate } from '~/fx/fxEvents'
import { setBoardThemeOverride } from '~/fx/fxThemeStore'
import { playUiChime } from '~/utils/soundEffects'
import { toast } from 'react-toastify'
import {
  SIMULATION_PRESETS,
  detectSimulationPreset,
  getSimulationPresetMeta,
  buildSimulationModel
} from './simulationPresets'

function CrStudio() {
  const { boardId, cardId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const { themeConfig } = usePersonaTheme(board?.theme)
  const { t, tPrimary, formatMessage } = useTranslation()

  const [scenario, setScenario] = useState('happy') // 'happy' | 'edge' | 'error'
  const [presetOverride, setPresetOverride] = useState(null)
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Editable quick fields
  const [statusVal, setStatusVal] = useState('Ready for deploy')
  const [handleByVal, setHandleByVal] = useState('')
  const [dueDateVal, setDueDateVal] = useState('')
  const [devProgressVal, setDevProgressVal] = useState(1)
  const [resourceUsedVal, setResourceUsedVal] = useState(0)
  const [noteVal, setNoteVal] = useState('')
  const [savingCr, setSavingCr] = useState(false)

  useEffect(() => {
    setBoardThemeOverride(board?.theme || null)
    return () => setBoardThemeOverride(null)
  }, [board?.theme])

  useEffect(() => {
    if (!board || board._id !== boardId) {
      dispatch(fetchBoardDetailsAPI(boardId))
    }
  }, [dispatch, board, boardId])

  const allBoardItems = useMemo(() => collectBoardCardsWithColumn(board), [board])
  const currentEntry = useMemo(
    () => allBoardItems.find(item => item.card._id === cardId) || allBoardItems[0],
    [allBoardItems, cardId]
  )

  const card = currentEntry?.card
  const columnTitle = currentEntry?.columnTitle || 'CR Topic'
  const sprintConfig = board?.sprintConfig || DEFAULT_SPRINT_CONFIG

  useEffect(() => {
    if (card) {
      setStatusVal(normalizeCrStatus(card.baStatus))
      setHandleByVal(card.assignee || '')
      setDueDateVal(card.deadline || '')
      setDevProgressVal(getCardDevProgress(card))
      setResourceUsedVal(getCardResourceUsed(card))
      setNoteVal(card.note || '')
      setPresetOverride(null)
      setActiveStepIdx(0)
    }
  }, [card])

  const activePresetId = useMemo(
    () => presetOverride || detectSimulationPreset(card, columnTitle),
    [presetOverride, card, columnTitle]
  )
  const activePresetMeta = useMemo(
    () => getSimulationPresetMeta(activePresetId),
    [activePresetId]
  )

  const simulationSteps = useMemo(
    () => buildSimulationModel(card, columnTitle, activePresetId),
    [card, columnTitle, activePresetId]
  )

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = setInterval(() => {
      setActiveStepIdx(prev => {
        if (prev >= simulationSteps.length - 1) {
          setIsPlaying(false)
          playUiChime('complete')
          return prev
        }
        playUiChime('sparkle')
        return prev + 1
      })
    }, 1500)
    return () => clearInterval(timer)
  }, [isPlaying, simulationSteps.length])

  if (!board) {
    return <PageLoadingSpinner caption={tPrimary('loadingWorkspace')} />
  }

  if (!card) {
    return (
      <Container disableGutters maxWidth={false} sx={{ minHeight: '100vh', bgcolor: '#0b1020', color: 'white' }}>
        <AppBar boardTheme={board?.theme} />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            {t('crNotFoundOnBoard')}
          </Typography>
          <Button variant="contained" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(`/boards/${boardId}`)}>
            {t('backToSprintBoard')}
          </Button>
        </Box>
      </Container>
    )
  }

  const currentStep = simulationSteps[activeStepIdx] || simulationSteps[0]
  const activeStepData = currentStep[scenario] || currentStep.happy
  const dlInfo = getDeadlineStatus({ ...card, baStatus: statusVal, deadline: dueDateVal })
  const assignees = parseAssigneeList(handleByVal)

  // Find connected CRs (linkedCardIds + same Topic column CRs)
  const linkedCrs = allBoardItems.filter(
    item => item.card._id !== card._id && (
      (card.linkedCardIds || []).includes(item.card._id) ||
      item.columnTitle === columnTitle
    )
  )

  const handleSaveCrMetadata = async (event) => {
    const targetEl = event?.currentTarget
    const nextProgress = snapProgress(devProgressVal)
    const isDone = nextProgress >= 1 || statusVal === 'Deployed' || statusVal === 'Done testing'
    setSavingCr(true)
    try {
      const updated = await updateCardDetailsAPI(card._id, {
        baStatus: statusVal,
        assignee: handleByVal.trim(),
        deadline: dueDateVal.trim() || null,
        devProgress: nextProgress,
        resourceUsed: Number(resourceUsedVal),
        note: noteVal.trim(),
        isCompleted: statusVal === 'Deployed' || statusVal === 'Done testing'
      })
      dispatch(updateCardInBoard(updated))
      playUiChime('complete')
      if (isDone) fxCelebrate(targetEl)
      toast.success(tPrimary('savedCrAndSyncedToast'))
    } finally {
      setSavingCr(false)
    }
  }

  const glassCardSx = {
    borderRadius: '16px',
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)'),
    backdropFilter: 'blur(18px)',
    border: `1px solid ${themeConfig.columnBorder}`,
    boxShadow: '0 14px 36px rgba(0, 0, 0, 0.25)'
  }

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        backgroundImage: `${themeConfig.boardOverlayDark}, url(${themeConfig.heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        pb: 6
      }}
    >
      <AppBar boardTheme={board?.theme} />

      {/* Studio Top Bar */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.75,
          background: themeConfig.boardBarBgDark,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${themeConfig.columnBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(`/boards/${boardId}`)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          >
            {sprintConfig.name}
          </Button>

          <Chip
            label={card.crCode || 'BNPL-945'}
            color="info"
            size="small"
            sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '0.82rem' }}
          />

          <Chip
            label={`Topic: ${columnTitle}`}
            size="small"
            sx={{ color: 'white', bgcolor: 'rgba(129, 140, 248, 0.28)', border: '1px solid #818cf8', fontWeight: 700 }}
          />

          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            {card.title}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <TextField
            select
            size="small"
            value={card._id}
            onChange={(e) => navigate(`/boards/${boardId}/cr/${e.target.value}`)}
            sx={{
              minWidth: 190,
              bgcolor: 'rgba(15, 23, 42, 0.65)',
              borderRadius: '8px',
              '& .MuiSelect-select': { color: 'white', py: 0.65, fontSize: '0.78rem', fontWeight: 700 },
              '& .MuiSvgIcon-root': { color: 'white' }
            }}
          >
            {allBoardItems.map(item => (
              <MenuItem key={item.card._id} value={item.card._id}>
                [{item.card.crCode || 'CR'}] {item.card.title.slice(0, 36)}
              </MenuItem>
            ))}
          </TextField>

          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={() => exportFrdAsPrintablePdf(card, card.description, sprintConfig.sprintNumber || '34')}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            Export PDF
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => exportCardAsFrdMarkdown(card, sprintConfig.name)}
            sx={{ color: 'white', borderColor: themeConfig.accentColor, textTransform: 'none', fontWeight: 700 }}
          >
            Export .MD
          </Button>
        </Stack>
      </Box>

      {/* Main Studio Content */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3 }}>
        {/* Section 1: Interactive Architecture & Sequence Flow Simulator */}
        <Card sx={{ ...glassCardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoFixHighRoundedIcon sx={{ color: themeConfig.accentColor }} />
                  {t('simulatorTitle')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('simulatorSub')} [{card.crCode || 'CR'}]
                </Typography>
              </Box>

              {/* Scenario Selector */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<CheckCircleRoundedIcon />}
                  label="1. Happy Path (200 OK)"
                  onClick={() => { setScenario('happy'); playUiChime('sparkle') }}
                  color={scenario === 'happy' ? 'success' : 'default'}
                  variant={scenario === 'happy' ? 'filled' : 'outlined'}
                  clickable
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  icon={<WarningAmberRoundedIcon />}
                  label="2. Quota / Rule Block (409/429)"
                  onClick={() => { setScenario('edge'); playUiChime('sparkle') }}
                  color={scenario === 'edge' ? 'warning' : 'default'}
                  variant={scenario === 'edge' ? 'filled' : 'outlined'}
                  clickable
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  icon={<ErrorOutlineRoundedIcon />}
                  label="3. Race / Breaker / DLQ (503)"
                  onClick={() => { setScenario('error'); playUiChime('sparkle') }}
                  color={scenario === 'error' ? 'error' : 'default'}
                  variant={scenario === 'error' ? 'filled' : 'outlined'}
                  clickable
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Box>

            {/* ByteByteGo System-Design-101 Pattern Preset Selector */}
            <Box
              sx={{
                p: 1.35,
                mb: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(15, 23, 42, 0.62)',
                border: `1px solid ${themeConfig.columnBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label="SYSTEM DESIGN 101"
                    sx={{
                      height: 20,
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      color: '#0f172a',
                      bgcolor: themeConfig.accentColor
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#f8fafc', fontWeight: 800 }}>
                    {activePresetMeta.patternName}
                  </Typography>
                  <Chip
                    size="small"
                    label={activePresetMeta.badge}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.64rem', fontWeight: 700, color: '#bae6fd', borderColor: 'rgba(56, 189, 248, 0.45)' }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.75)' }}>
                  {activePresetMeta.description}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {SIMULATION_PRESETS.map((preset) => {
                  const selected = preset.id === activePresetId
                  return (
                    <Chip
                      key={preset.id}
                      size="small"
                      label={preset.label}
                      clickable
                      onClick={() => {
                        playUiChime('sparkle')
                        setIsPlaying(false)
                        setPresetOverride(preset.id)
                        setActiveStepIdx(0)
                      }}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        color: selected ? '#0f172a' : '#e2e8f0',
                        bgcolor: selected ? themeConfig.accentColor : 'rgba(255, 255, 255, 0.08)',
                        border: `1px solid ${selected ? themeConfig.accentColor : 'rgba(148, 163, 184, 0.28)'}`,
                        '&:hover': {
                          bgcolor: selected ? themeConfig.accentColor : 'rgba(255, 255, 255, 0.16)'
                        }
                      }}
                    />
                  )
                })}
              </Stack>
            </Box>

            {/*Playback Bar */}
            <Box
              sx={{
                p: 1.5,
                mb: 2.5,
                borderRadius: '12px',
                bgcolor: 'rgba(15, 23, 42, 0.78)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color={isPlaying ? 'warning' : 'info'}
                  startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  onClick={() => {
                    if (!isPlaying && activeStepIdx >= simulationSteps.length - 1) {
                      setActiveStepIdx(0)
                    }
                    setIsPlaying(!isPlaying)
                  }}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                >
                  {isPlaying ? t('pauseSimulationBtn') : t('playSimulationBtn')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SkipNextRoundedIcon />}
                  onClick={() => {
                    setIsPlaying(false)
                    setActiveStepIdx((prev) => (prev + 1) % simulationSteps.length)
                    playUiChime('sparkle')
                  }}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none', fontWeight: 700 }}
                >
                  {t('nextStepBtn')} ({activeStepIdx + 1}/{simulationSteps.length})
                </Button>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ReplayRoundedIcon />}
                  onClick={() => {
                    setIsPlaying(false)
                    setActiveStepIdx(0)
                  }}
                  sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'none', fontWeight: 700 }}
                >
                  Reset
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800 }}>
                {formatMessage('observingStageLabel', { step: activeStepIdx + 1, total: simulationSteps.length })} {currentStep.stage} — {currentStep.actor}
              </Typography>
            </Box>

            {/* Visual 5-Stage Pipeline Nodes */}
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              {simulationSteps.map((step, idx) => {
                const stepOutcome = step[scenario] || step.happy
                const isCurrent = idx === activeStepIdx
                const isPassed = idx < activeStepIdx
                let borderCol = 'rgba(148, 163, 184, 0.28)'
                if (isCurrent) {
                  borderCol = stepOutcome.status === 'PASS'
                    ? '#10b981'
                    : stepOutcome.status === 'BLOCKED' || stepOutcome.status === 'WARN'
                      ? '#f59e0b'
                      : '#ef4444'
                } else if (isPassed) {
                  borderCol = 'rgba(56, 189, 248, 0.55)'
                }

                return (
                  <Grid xs={12} sm={6} md={2.4} key={step.id}>
                    <Box
                      onClick={() => {
                        setIsPlaying(false)
                        setActiveStepIdx(idx)
                        playUiChime('sparkle')
                      }}
                      sx={{
                        p: 1.75,
                        height: '100%',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        border: isCurrent ? `2.5px solid ${borderCol}` : `1px solid ${borderCol}`,
                        bgcolor: isCurrent ? 'rgba(56, 189, 248, 0.12)' : 'background.paper',
                        boxShadow: isCurrent ? `0 0 24px ${borderCol}44` : 'none',
                        transition: 'all 0.22s ease',
                        '&:hover': { transform: 'translateY(-3px)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {step.stage}
                        </Typography>
                        <Chip
                          label={stepOutcome.status}
                          size="small"
                          color={
                            stepOutcome.status === 'PASS'
                              ? 'success'
                              : stepOutcome.status === 'BLOCKED' || stepOutcome.status === 'WARN'
                                ? 'warning'
                                : 'error'
                          }
                          sx={{ height: 18, fontSize: '0.62rem', fontWeight: 900 }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {step.actor}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.35 }}>
                        {step.summary}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>

            {/* Live Step State & Payload Inspector */}
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#090d16',
                    color: '#e2e8f0',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    fontFamily: 'monospace',
                    height: '100%'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, display: 'block', mb: 1 }}>
                    📥 INPUT PAYLOAD & STATE AT [{currentStep.stage.toUpperCase()}]
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#f8fafc', mb: 1.5, wordBreak: 'break-word' }}>
                    {activeStepData.input}
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)', my: 1 }} />
                  <Typography variant="caption" sx={{ color: '#f5d061', fontWeight: 800, display: 'block', mb: 0.5 }}>
                    ⚖️ BUSINESS RULE EVALUATED:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#fde68a' }}>
                    {activeStepData.rule}
                  </Typography>
                </Box>
              </Grid>

              <Grid xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#090d16',
                    color: '#e2e8f0',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    fontFamily: 'monospace',
                    height: '100%'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 800, display: 'block', mb: 1 }}>
                    🔄 SYSTEM STATE MUTATION:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#f8fafc', mb: 1.5 }}>
                    {activeStepData.mutation}
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)', my: 1 }} />
                  <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 800, display: 'block', mb: 0.5 }}>
                    📤 STEP OUTPUT / NEXT TRANSITION:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#c4b5fd' }}>
                    {activeStepData.output}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Split Workspace — CR Excel Metadata & FRD Note (Left) + Obsidian Local Connections (Right) */}
        <Grid container spacing={2.5}>
          <Grid xs={12} md={7.5}>
            <Card sx={glassCardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {t('crTemplateInfoTitle')} (Sprint {sprintConfig.sprintNumber || '34'})
                  </Typography>
                  <LoadingButton
                    variant="contained"
                    size="small"
                    loading={savingCr}
                    startIcon={<SaveRoundedIcon />}
                    onClick={handleSaveCrMetadata}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                  >
                    {t('saveCrUpdateBtn')}
                  </LoadingButton>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid xs={12} sm={3.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Status"
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                    >
                      {BA_STATUS_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid xs={12} sm={8.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label={tPrimary('handleByInputLabel')}
                      value={handleByVal}
                      onChange={(e) => setHandleByVal(e.target.value)}
                      placeholder="Ho Thao Dieu, Hoang Vinh Son"
                    />
                  </Grid>
                  <Grid xs={12} sm={4.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Due date for dev"
                      value={dueDateVal}
                      onChange={(e) => setDueDateVal(e.target.value)}
                      placeholder="2026-11-05 / 5/11"
                    />
                  </Grid>
                  <Grid xs={7} sm={4.5}>
                    <ProgressSelect value={devProgressVal} onChange={setDevProgressVal} />
                  </Grid>
                  <Grid xs={5} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ step: '0.5', min: '0' }}
                      label="Story Point"
                      value={resourceUsedVal}
                      onChange={(e) => setResourceUsedVal(e.target.value)}
                    />
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      label="Note"
                      value={noteVal}
                      onChange={(e) => setNoteVal(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  {t('frdMarkdownContentTitle')}
                </Typography>
                <FrdVisualDocument
                  card={card}
                  markdownText={card.description}
                  sprintNumber={sprintConfig.sprintNumber || '34'}
                  emptyPlaceholder={tPrimary('noFrdContentYet')}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} md={4.5}>
            <Card sx={glassCardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <HubRoundedIcon sx={{ color: themeConfig.accentColor }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Obsidian Knowledge Connections
                  </Typography>
                </Box>

                {/* Assignees (Handle by) */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                  {t('responsibleHandleByTitle')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  {assignees.length > 0 ? assignees.map(person => (
                    <Chip
                      key={person}
                      label={person}
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 700 }}
                    />
                  )) : (
                    <Typography variant="caption" color="text.secondary">{t('noAssigneeYet')}</Typography>
                  )}
                </Box>

                {/* Progress & Due Date Telemetry */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {t('devProgressDueDateTitle')}
                </Typography>
                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'action.hover', mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Dev Progress: {formatProgress(devProgressVal)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: dlInfo.color }}>
                      {dlInfo.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressToPercent(devProgressVal)}
                    sx={{ height: 7, borderRadius: 4 }}
                  />
                </Box>

                {/* Attached FRDs */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                  {formatMessage('attachedFrdDocsTitle', { count: (card.frdDocuments || []).length })}
                </Typography>
                <Stack spacing={0.75} sx={{ mb: 2 }}>
                  {(card.frdDocuments || []).map(doc => (
                    <Box
                      key={doc.id}
                      onClick={() => downloadAttachedFrdFile(doc)}
                      sx={{
                        p: 1,
                        borderRadius: '8px',
                        border: '1px solid rgba(148,163,184,0.25)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }} noWrap>
                        📎 {doc.name}
                      </Typography>
                      <DownloadRoundedIcon fontSize="small" color="primary" />
                    </Box>
                  ))}
                  {(!card.frdDocuments || card.frdDocuments.length === 0) && (
                    <Typography variant="caption" color="text.secondary">{t('noAttachedFiles')}</Typography>
                  )}
                </Stack>

                {/* Connected CRs in same Topic or WikiLinked */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                  {formatMessage('relatedCrsInSystemTitle', { count: linkedCrs.length })}
                </Typography>
                <Stack spacing={0.75}>
                  {linkedCrs.map(({ card: lc, columnTitle: lcCol }) => (
                    <Box
                      key={lc._id}
                      onClick={() => {
                        playUiChime('sparkle')
                        navigate(`/boards/${boardId}/cr/${lc._id}`)
                      }}
                      sx={{
                        p: 1.1,
                        borderRadius: '10px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
                        <Chip label={lc.crCode || 'CR'} size="small" color="info" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                        <Typography variant="caption" color="text.secondary">{lcCol}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {lc.title}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default CrStudio
