import { useEffect, useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { Tooltip } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import ImportMarkdownModal from '~/components/Modal/ImportMarkdownModal'
import { updateBoardDetailsAPI } from '~/apis'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { ELEMENTAL_LABELS, PRIMARY_THEMES_LIST } from '~/utils/animeTheme'
import {
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  exportSprintCrsToCsv,
  exportSprintCrsToExcel,
  formatDateVN,
  getDeadlineStatus,
  getSavedTeamRoster,
  saveTeamRosterLocal
} from '~/utils/excelExporter'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import {
  getDefaultTrackForTheme,
  isMusicBoxActive,
  playOstTrack,
  playUiChime
} from '~/utils/soundEffects'
import { toast } from 'react-toastify'

const MENU_STYLES = {
  flexShrink: 0,
  whiteSpace: 'nowrap',
  color: 'white',
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  paddingX: '6px',
  borderRadius: '8px',
  fontWeight: 600,
  backdropFilter: 'blur(6px)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.22)',
    transform: 'translateY(-1px)'
  }
}

function BoardBar({
  board,
  cardFilterText = '',
  setCardFilterText,
  boardViewMode = 'kanban',
  setBoardViewMode
}) {
  const dispatch = useDispatch()
  const { personaKey, themeConfig, changePersona } = usePersonaTheme(board?.theme)
  const { tPrimary } = useTranslation()

  // Pomodoro Focus Timer state (25 mins default)
  const [timerAnchor, setTimerAnchor] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  // Popover & Modal states
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [sprintAnchor, setSprintAnchor] = useState(null)
  const [deadlineAnchor, setDeadlineAnchor] = useState(null)
  const [themeAnchor, setThemeAnchor] = useState(null)
  const [openImportMdModal, setOpenImportMdModal] = useState(false)

  const currentSprint = board?.sprintConfig || DEFAULT_SPRINT_CONFIG
  const [sprintNumber, setSprintNumber] = useState(currentSprint.sprintNumber || '34')
  const [sprintStart, setSprintStart] = useState(currentSprint.startDate || '22/10/2026')
  const [sprintEnd, setSprintEnd] = useState(currentSprint.endDate || '05/11/2026')
  const [updateTill, setUpdateTill] = useState(currentSprint.updateTill || formatDateVN(new Date()))
  const [updatedBy, setUpdatedBy] = useState(currentSprint.updatedBy || 'Dao Thanh Phuc')
  const [sprintGoal, setSprintGoal] = useState(currentSprint.goal || '')
  const [teamRoster, setTeamRoster] = useState(() => getSavedTeamRoster(board))
  const [newMemberName, setNewMemberName] = useState('')

  useEffect(() => {
    const cfg = board?.sprintConfig || DEFAULT_SPRINT_CONFIG
    const num = cfg.sprintNumber || String(cfg.name || '34').replace(/[^0-9]/g, '') || '34'
    setSprintNumber(num)
    setSprintStart(cfg.startDate || '22/10/2026')
    setSprintEnd(cfg.endDate || '05/11/2026')
    setUpdateTill(cfg.updateTill || formatDateVN(new Date()))
    setUpdatedBy(cfg.updatedBy || 'Dao Thanh Phuc')
    setSprintGoal(cfg.goal || '')
    setTeamRoster(getSavedTeamRoster(board))
  }, [board])

  // Calculate live board telemetry & deadline warnings
  const boardTelemetry = useMemo(() => {
    let cardsCount = 0
    let totalChecks = 0
    let doneChecks = 0
    const overdueCards = []
    const dueSoonCards = []

    const allItems = collectBoardCardsWithColumn(board)
    allItems.forEach(({ card, columnTitle }) => {
      cardsCount++
      const list = card.checklist || []
      totalChecks += list.length
      doneChecks += list.filter((i) => i.isCompleted).length

      const dl = getDeadlineStatus(card)
      if (dl.code === 'overdue') {
        overdueCards.push({ card, columnTitle, dl })
      } else if (dl.code === 'due-soon') {
        dueSoonCards.push({ card, columnTitle, dl })
      }
    })

    const percent = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0
    return {
      cardsCount,
      totalChecks,
      doneChecks,
      percent,
      overdueCards,
      dueSoonCards,
      alertCount: overdueCards.length + dueSoonCards.length
    }
  }, [board])

  useEffect(() => {
    if (!isRunning) return undefined
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          playUiChime('complete')
          toast.success('Pomodoro Focus Session Completed!')
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTimer = (totalSec) => {
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const onUpdateBoardTitle = (newTitle) => {
    updateBoardDetailsAPI(board._id, { title: newTitle }).then(() => {
      dispatch(updateCurrentActiveBoard({ ...board, title: newTitle }))
    })
  }

  const handleAddMemberToRoster = () => {
    const clean = newMemberName.trim()
    if (!clean) return
    if (!teamRoster.includes(clean)) {
      const next = [...teamRoster, clean]
      setTeamRoster(next)
      saveTeamRosterLocal(next)
    }
    setNewMemberName('')
  }

  const handleRemoveMemberFromRoster = (nameToRemove) => {
    const next = teamRoster.filter(n => n !== nameToRemove)
    setTeamRoster(next)
    saveTeamRosterLocal(next)
  }

  const handleSaveSprintConfig = () => {
    const num = sprintNumber.trim() || '34'
    const nextName = num.toLowerCase().startsWith('sprint') ? num : `Sprint ${num}`
    saveTeamRosterLocal(teamRoster)

    const nextConfig = {
      name: nextName,
      sprintNumber: num.replace(/[^0-9]/g, '') || '34',
      startDate: sprintStart.trim() || '22/10/2026',
      endDate: sprintEnd.trim() || '05/11/2026',
      updateTill: updateTill.trim() || formatDateVN(new Date()),
      updatedBy: updatedBy.trim() || 'Dao Thanh Phuc',
      goal: sprintGoal.trim(),
      teamRoster
    }
    dispatch(updateCurrentActiveBoard({ ...board, sprintConfig: nextConfig }))
    updateBoardDetailsAPI(board._id, {
      sprintConfig: {
        name: nextConfig.name,
        startDate: nextConfig.startDate,
        endDate: nextConfig.endDate,
        goal: nextConfig.goal
      }
    }).then(() => {
      playUiChime('complete')
      toast.success(`Saved ${nextConfig.name} (${nextConfig.startDate} - ${nextConfig.endDate})!`)
      setSprintAnchor(null)
    })
  }

  const handleToggleStarBoard = () => {
    const nextStarred = !board?.isStarred
    playUiChime('sparkle')
    dispatch(updateCurrentActiveBoard({ ...board, isStarred: nextStarred }))
    updateBoardDetailsAPI(board._id, { isStarred: nextStarred })
  }

  const handleToggleBoardType = () => {
    const nextType = board?.type === 'public' ? 'private' : 'public'
    dispatch(updateCurrentActiveBoard({ ...board, type: nextType }))
    updateBoardDetailsAPI(board._id, { type: nextType }).then(() => {
      toast.info(`Board visibility: ${capitalizeFirstLetter(nextType)}`)
    })
  }

  const handleSelectCharacterTheme = (nextThemeKey) => {
    playUiChime('theme')
    changePersona(nextThemeKey)
    dispatch(updateCurrentActiveBoard({ ...board, theme: nextThemeKey }))
    updateBoardDetailsAPI(board._id, { theme: nextThemeKey })
    if (isMusicBoxActive()) {
      playOstTrack(getDefaultTrackForTheme(nextThemeKey))
    }
    setThemeAnchor(null)
  }

  const handleExportExcel = () => {
    playUiChime('complete')
    exportSprintCrsToExcel(board)
    toast.success(`Exported Excel for ${currentSprint.name}!`)
  }

  const handleExportCsv = () => {
    playUiChime('complete')
    exportSprintCrsToCsv(board)
    toast.success(`Exported CSV Template for ${currentSprint.name}!`)
  }

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      paddingX: 2,
      overflowX: 'auto',
      overflowY: 'hidden',
      background: (theme) => (
        theme.palette.mode === 'dark' ? themeConfig.boardBarBgDark : themeConfig.boardBarBgLight
      ),
      backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${themeConfig.columnBorder}`,
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <ImportMarkdownModal
        open={openImportMdModal}
        onClose={() => setOpenImportMdModal(false)}
        accentColor={themeConfig.accentColor}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, flexShrink: 0 }}>
        <Tooltip title={board?.description || 'Sprint Board Title'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 0.5, flexShrink: 0 }}>
            <SoraRibbonIcon sx={{ fontSize: '20px', flexShrink: 0 }} />
            <Box sx={{
              width: '175px',
              flexShrink: 0,
              '& input': { color: 'white !important' },
              '& .MuiOutlinedInput-root.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)'
              }
            }}>
              <ToggleFocusInput
                value={board?.title || ''}
                onChangedValue={onUpdateBoardTitle}
              />
            </Box>
          </Box>
        </Tooltip>

        <Tooltip title={board?.isStarred ? 'Unstar Sprint Board' : 'Star Sprint Board'}>
          <IconButton
            size="small"
            onClick={handleToggleStarBoard}
            sx={{
              flexShrink: 0,
              color: board?.isStarred ? '#fbbf24' : 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
            }}
          >
            {board?.isStarred ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Active Sprint Badge (Default: Sprint 34 • 22/10 - 05/11) */}
        <Tooltip title={tPrimary('configureSprint')}>
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              bgcolor: 'rgba(56, 189, 248, 0.24)',
              borderColor: themeConfig.accentColor
            }}
            icon={<CalendarMonthRoundedIcon fontSize="small" />}
            label={`${currentSprint.name || 'Sprint 34'}: ${(currentSprint.startDate || '22/10').slice(0, 5)}–${(currentSprint.endDate || '05/11').slice(0, 5)}`}
            onClick={(e) => setSprintAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        {/* View Switcher: Kanban | Sprint Matrix | Obsidian Graph */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            p: 0.35,
            borderRadius: '10px',
            bgcolor: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255,255,255,0.22)',
            flexShrink: 0
          }}
        >
          <Chip
            size="small"
            icon={<ViewKanbanOutlinedIcon fontSize="small" />}
            label={tPrimary('viewKanban')}
            onClick={() => { playUiChime('sparkle'); setBoardViewMode('kanban') }}
            clickable
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'white',
              bgcolor: boardViewMode === 'kanban' ? themeConfig.accentColor : 'transparent',
              '.MuiSvgIcon-root': { color: 'white !important' }
            }}
          />
          <Chip
            size="small"
            icon={<InsightsRoundedIcon fontSize="small" />}
            label={tPrimary('viewMatrix')}
            onClick={() => { playUiChime('sparkle'); setBoardViewMode('overview') }}
            clickable
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'white',
              bgcolor: boardViewMode === 'overview' ? '#f472b6' : 'transparent',
              '.MuiSvgIcon-root': { color: 'white !important' }
            }}
          />
          <Chip
            size="small"
            icon={<HubRoundedIcon fontSize="small" />}
            label={tPrimary('viewGraph')}
            onClick={() => { playUiChime('sparkle'); setBoardViewMode('graph') }}
            clickable
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'white',
              bgcolor: boardViewMode === 'graph' ? '#a78bfa' : 'transparent',
              '.MuiSvgIcon-root': { color: 'white !important' }
            }}
          />
        </Box>

        {/* Deadline Alert Badge */}
        <Tooltip title={tPrimary('deadlineCenterTitle')}>
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              bgcolor: boardTelemetry.overdueCards.length > 0
                ? 'rgba(239, 68, 68, 0.38)'
                : boardTelemetry.dueSoonCards.length > 0
                  ? 'rgba(245, 158, 11, 0.34)'
                  : 'rgba(16, 185, 129, 0.24)',
              borderColor: boardTelemetry.overdueCards.length > 0
                ? '#f87171'
                : boardTelemetry.dueSoonCards.length > 0
                  ? '#fbbf24'
                  : '#34d399',
              animation: boardTelemetry.overdueCards.length > 0 ? 'chelloPulseHalo 2.2s infinite' : 'none'
            }}
            icon={boardTelemetry.alertCount > 0 ? <WarningAmberRoundedIcon fontSize="small" /> : <CheckCircleOutlineRoundedIcon fontSize="small" />}
            label={
              boardTelemetry.alertCount > 0
                ? `${boardTelemetry.alertCount} ${tPrimary('deadlineAlerts')}`
                : tPrimary('onTrack')
            }
            onClick={(e) => setDeadlineAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        {/* Import Markdown / CSV Template to CR Ticket */}
        <Tooltip title="Import Markdown (.md) or Sprint CSV (.csv) into CR Tickets">
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              bgcolor: 'rgba(167, 139, 250, 0.26)',
              borderColor: '#a78bfa'
            }}
            icon={<UploadFileRoundedIcon fontSize="small" />}
            label={tPrimary('importMdCsvBtn')}
            onClick={() => {
              playUiChime('sparkle')
              setOpenImportMdModal(true)
            }}
            clickable
          />
        </Tooltip>

        {/* Export Sprint CRs to Excel */}
        <Tooltip title="Export Sprint Report (.XLS) matching the exact Sprint 34 Template">
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              bgcolor: 'rgba(16, 185, 129, 0.28)',
              borderColor: '#34d399'
            }}
            icon={<TableViewRoundedIcon fontSize="small" />}
            label={tPrimary('exportExcelBtn')}
            onClick={handleExportExcel}
            clickable
          />
        </Tooltip>

        <Tooltip title={tPrimary('selectThemeTitle')}>
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              borderColor: themeConfig.accentColor
            }}
            icon={<PaletteOutlinedIcon fontSize="small" />}
            label={themeConfig.name.split('•')[0].trim()}
            onClick={(e) => setThemeAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        <Tooltip title={tPrimary('filterPopoverTitle')}>
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              bgcolor: cardFilterText ? 'rgba(125, 211, 252, 0.35)' : MENU_STYLES.bgcolor
            }}
            icon={<FilterAltIcon fontSize="small" />}
            label={cardFilterText ? `${cardFilterText}` : tPrimary('filterCrBtn')}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            onDelete={cardFilterText ? () => setCardFilterText('') : undefined}
            clickable
          />
        </Tooltip>

        <Tooltip title="Pomodoro Timer">
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              display: { xs: 'none', xl: 'inline-flex' },
              bgcolor: isRunning ? 'rgba(244, 114, 182, 0.35)' : MENU_STYLES.bgcolor
            }}
            icon={<SoraBunnyIcon fontSize="small" />}
            label={isRunning ? formatTimer(secondsLeft) : 'Pomodoro'}
            onClick={(e) => setTimerAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        <Tooltip title="Public / Private">
          <Chip
            size="small"
            sx={{ ...MENU_STYLES, display: { xs: 'none', xl: 'inline-flex' } }}
            icon={<VpnLockIcon fontSize="small" />}
            label={capitalizeFirstLetter(board?.type)}
            onClick={handleToggleBoardType}
            clickable
          />
        </Tooltip>
      </Box>

      {/* Sprint Configuration & Team Roster Popover */}
      <Popover
        open={Boolean(sprintAnchor)}
        anchorEl={sprintAnchor}
        onClose={() => setSprintAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 420, maxWidth: '94vw', maxHeight: 540, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {tPrimary('configureSprint')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {tPrimary('sprintConfigSub')}
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label={tPrimary('sprintNumberLabel')}
              size="small"
              fullWidth
              value={sprintNumber}
              onChange={(e) => setSprintNumber(e.target.value)}
              placeholder="34"
            />
            <TextField
              label={tPrimary('updatedByLabel')}
              size="small"
              fullWidth
              value={updatedBy}
              onChange={(e) => setUpdatedBy(e.target.value)}
              placeholder="Dao Thanh Phuc"
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label={tPrimary('startDateLabel')}
              size="small"
              fullWidth
              value={sprintStart}
              onChange={(e) => setSprintStart(e.target.value)}
              placeholder="22/10/2026"
            />
            <TextField
              label={tPrimary('endDateLabel')}
              size="small"
              fullWidth
              value={sprintEnd}
              onChange={(e) => setSprintEnd(e.target.value)}
              placeholder="05/11/2026"
            />
          </Stack>

          <TextField
            label={tPrimary('updateTillLabel')}
            size="small"
            fullWidth
            value={updateTill}
            onChange={(e) => setUpdateTill(e.target.value)}
            placeholder="26/10/2026"
          />

          <TextField
            label={tPrimary('sprintNoteLabel')}
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
          />

          <Divider />

          <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {tPrimary('teamRosterLabel')} ({teamRoster.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
            {teamRoster.map(member => (
              <Chip
                key={member}
                label={member}
                size="small"
                onDelete={() => handleRemoveMemberFromRoster(member)}
                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
              />
            ))}
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder={tPrimary('addMemberPlaceholder')}
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddMemberToRoster()
                }
              }}
            />
            <Button size="small" variant="outlined" onClick={handleAddMemberToRoster} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {tPrimary('addBtn')}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ pt: 1 }}>
            <Button size="small" variant="outlined" color="success" onClick={handleExportCsv} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {tPrimary('exportCsvBtn')}
            </Button>
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => setSprintAnchor(null)}>{tPrimary('cancelBtn')}</Button>
              <Button size="small" variant="contained" onClick={handleSaveSprintConfig} sx={{ textTransform: 'none', fontWeight: 700 }}>
                {tPrimary('saveSprintBtn')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>

      {/* Deadline Alert Center Popover */}
      <Popover
        open={Boolean(deadlineAnchor)}
        anchorEl={deadlineAnchor}
        onClose={() => setDeadlineAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 390, maxWidth: '94vw', maxHeight: 440, overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            {tPrimary('deadlineCenterTitle')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {tPrimary('deadlineCenterSub')}
          </Typography>

          {boardTelemetry.alertCount === 0 ? (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.12)', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                {tPrimary('allOnTrackMsg')}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {[...boardTelemetry.overdueCards, ...boardTelemetry.dueSoonCards].map(({ card, columnTitle, dl }) => (
                <Box
                  key={card._id}
                  onClick={() => {
                    setDeadlineAnchor(null)
                    dispatch(updateCurrentActiveCard(card))
                    dispatch(showModalActiveCard())
                  }}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: `1px solid ${dl.color}66`,
                    bgcolor: dl.bgColor,
                    '&:hover': { opacity: 0.9 }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Chip
                      label={card.crCode || 'CR'}
                      size="small"
                      sx={{ height: 20, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: dl.color }}>
                      {dl.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    Handle by: {card.assignee || 'Unassigned'} • Topic: {columnTitle}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Popover>

      {/* Theme Selector Popover */}
      <Popover
        open={Boolean(themeAnchor)}
        anchorEl={themeAnchor}
        onClose={() => setThemeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 350, maxWidth: '94vw' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.25 }}>
            🎨 {tPrimary('selectThemeTitle')}
          </Typography>
          <Stack spacing={1}>
            {PRIMARY_THEMES_LIST.map((t) => {
              const active = personaKey === t.id
              return (
                <Box
                  key={t.id}
                  onClick={() => handleSelectCharacterTheme(t.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: 1,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: active ? `2px solid ${t.accentColor}` : '1px solid rgba(148, 163, 184, 0.25)',
                    bgcolor: active ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Avatar src={t.mascotImage} alt={t.name} sx={{ width: 42, height: 42, border: `2px solid ${t.accentColor}` }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {t.jpTitle}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </Popover>

      {/* Pomodoro Popover */}
      <Popover
        open={Boolean(timerAnchor)}
        anchorEl={timerAnchor}
        onClose={() => setTimerAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 325, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={themeConfig.mascotImage} alt={themeConfig.name} sx={{ width: 46, height: 46, border: `2px solid ${themeConfig.accentColor}` }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }} noWrap>
                {themeConfig.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pomodoro Focus Session
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {themeConfig.quote}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', my: 0.5, letterSpacing: 2 }}>
            {formatTimer(secondsLeft)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              color={isRunning ? 'warning' : 'primary'}
              onClick={() => {
                playUiChime('sparkle')
                setIsRunning(!isRunning)
              }}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsRunning(false)
                setSecondsLeft(25 * 60)
              }}
            >
              25m Focus
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsRunning(false)
                setSecondsLeft(5 * 60)
              }}
            >
              5m Break
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Filter Cards Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 330, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {tPrimary('filterPopoverTitle')}
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder={tPrimary('filterPlaceholder')}
            value={cardFilterText}
            onChange={(e) => setCardFilterText(e.target.value)}
            autoFocus
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {ELEMENTAL_LABELS.map(lbl => (
              <Chip
                key={lbl.id}
                label={lbl.title}
                size="small"
                onClick={() => setCardFilterText(cardFilterText === lbl.id ? '' : lbl.id)}
                sx={{
                  bgcolor: lbl.color,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '11px',
                  opacity: cardFilterText && cardFilterText !== lbl.id ? 0.55 : 1
                }}
              />
            ))}
          </Box>
          {cardFilterText && (
            <Button size="small" onClick={() => setCardFilterText('')}>
              {tPrimary('clearFilter')}
            </Button>
          )}
        </Box>
      </Popover>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <InviteBoardUser boardId={board._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>
    </Box>
  )
}

export default BoardBar
