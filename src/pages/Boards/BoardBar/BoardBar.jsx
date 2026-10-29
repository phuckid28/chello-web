import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import ImportMarkdownModal from '~/components/Modal/ImportMarkdownModal'
import SprintReportDialog from '~/components/Modal/SprintReportDialog'
import ViewSwitcher from './parts/ViewSwitcher'
import FilterPopover from './parts/FilterPopover'
import SprintConfigPopover from './parts/SprintConfigPopover'
import DeadlineCenterPopover from './parts/DeadlineCenterPopover'
import ThemePickerPopover from './parts/ThemePickerPopover'
import PomodoroPopover from './parts/PomodoroPopover'
import ToolsMenu from './parts/ToolsMenu'
import { MENU_STYLES, POMODORO_FOCUS_SECONDS } from './parts/boardBarStyles'
import { updateBoardDetailsAPI } from '~/apis'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePomodoro, formatTimer } from '~/customHooks/usePomodoro'
import { countActiveFilters } from '~/utils/crFilters'
import {
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  exportSprintCrsToCsv,
  exportSprintCrsToExcel,
  getDeadlineStatus,
  getSavedTeamRoster
} from '~/utils/excelExporter'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { getDefaultTrackForTheme, isMusicBoxActive, playOstTrack, playUiChime } from '~/utils/soundEffects'
import { OPEN_REPORT_EVENT, consumePendingReport } from '~/utils/boardEvents'

const computeTelemetry = (board) => {
  const overdueCards = []
  const dueSoonCards = []
  collectBoardCardsWithColumn(board).forEach(({ card, columnTitle }) => {
    const dl = getDeadlineStatus(card)
    if (dl.code === 'overdue') overdueCards.push({ card, columnTitle, dl })
    else if (dl.code === 'due-soon') dueSoonCards.push({ card, columnTitle, dl })
  })
  return { overdueCards, dueSoonCards, alertCount: overdueCards.length + dueSoonCards.length }
}

const deadlineChipColors = (telemetry) => {
  if (telemetry.overdueCards.length) return { bg: 'rgba(239, 68, 68, 0.38)', border: '#f87171' }
  if (telemetry.dueSoonCards.length) return { bg: 'rgba(245, 158, 11, 0.34)', border: '#fbbf24' }
  return { bg: 'rgba(16, 185, 129, 0.24)', border: '#34d399' }
}

function BoardBar({ board, filters, setFilters, filterStats, boardViewMode = 'kanban', setBoardViewMode }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { personaKey, themeConfig, changePersona } = usePersonaTheme(board?.theme)
  const { tPrimary } = useTranslation()
  const pomodoro = usePomodoro(POMODORO_FOCUS_SECONDS)

  const [anchors, setAnchors] = useState({})
  const [openImportMdModal, setOpenImportMdModal] = useState(false)
  const [openReport, setOpenReport] = useState(false)

  const openAnchor = (key) => (e) => setAnchors(prev => ({ ...prev, [key]: e.currentTarget }))
  const closeAnchor = (key) => () => setAnchors(prev => ({ ...prev, [key]: null }))

  const currentSprint = { ...DEFAULT_SPRINT_CONFIG, ...(board?.sprintConfig || {}) }
  const telemetry = useMemo(() => computeTelemetry(board), [board])
  const roster = useMemo(() => getSavedTeamRoster(board), [board])
  const activeFilterCount = countActiveFilters(filters)
  const deadlineColors = deadlineChipColors(telemetry)

  useEffect(() => {
    if (consumePendingReport()) setOpenReport(true)
    const handleOpenReport = () => {
      consumePendingReport()
      setOpenReport(true)
    }
    window.addEventListener(OPEN_REPORT_EVENT, handleOpenReport)
    return () => window.removeEventListener(OPEN_REPORT_EVENT, handleOpenReport)
  }, [])

  const onUpdateBoardTitle = (newTitle) => {
    updateBoardDetailsAPI(board._id, { title: newTitle }).then(() => {
      dispatch(updateCurrentActiveBoard({ ...board, title: newTitle }))
    })
  }

  // Optimistic update with rollback when the server rejects it (e.g. 403 on a read-only public board)
  const optimisticBoardUpdate = (patch) => {
    const previous = board
    dispatch(updateCurrentActiveBoard({ ...board, ...patch }))
    return updateBoardDetailsAPI(board._id, patch).catch((error) => {
      dispatch(updateCurrentActiveBoard(previous))
      throw error
    })
  }

  const handleToggleStarBoard = () => {
    playUiChime('sparkle')
    optimisticBoardUpdate({ isStarred: !board?.isStarred }).catch(() => {})
  }

  const handleToggleBoardType = () => {
    const nextType = board?.type === 'public' ? 'private' : 'public'
    optimisticBoardUpdate({ type: nextType })
      .then(() => toast.info(`Board visibility: ${capitalizeFirstLetter(nextType)}`))
      .catch(() => {})
  }

  const handleSelectTheme = (nextThemeKey) => {
    playUiChime('theme')
    changePersona(nextThemeKey)
    optimisticBoardUpdate({ theme: nextThemeKey }).catch(() => {})
    if (isMusicBoxActive()) playOstTrack(getDefaultTrackForTheme(nextThemeKey))
    setAnchors(prev => ({ ...prev, theme: null }))
  }

  const handleExport = (exporter, label) => () => {
    playUiChime('complete')
    exporter(board)
    toast.success(`${label} • ${currentSprint.name} ✓`)
  }

  const openKnowledgeHub = () => {
    playUiChime('sparkle')
    navigate(`/boards/${board._id}/wiki`)
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
      background: (theme) => (theme.palette.mode === 'dark' ? themeConfig.boardBarBgDark : themeConfig.boardBarBgLight),
      backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${themeConfig.columnBorder}`,
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <ImportMarkdownModal open={openImportMdModal} onClose={() => setOpenImportMdModal(false)} accentColor={themeConfig.accentColor} />
      <SprintReportDialog open={openReport} onClose={() => setOpenReport(false)} board={board} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, flexShrink: 0 }}>
        <Tooltip title={board?.description || ''}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 0.5, flexShrink: 0 }}>
            <SoraRibbonIcon sx={{ fontSize: '20px', flexShrink: 0 }} />
            <Box sx={{
              width: '175px',
              flexShrink: 0,
              '& input': { color: 'white !important' },
              '& .MuiOutlinedInput-root.Mui-focused': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
            }}>
              <ToggleFocusInput value={board?.title || ''} onChangedValue={onUpdateBoardTitle} />
            </Box>
          </Box>
        </Tooltip>

        <Tooltip title={board?.isStarred ? 'Unstar' : 'Star'}>
          <IconButton
            size="small"
            onClick={handleToggleStarBoard}
            sx={{
              flexShrink: 0,
              color: board?.isStarred ? '#fbbf24' : 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.1)',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)', transform: 'rotate(-12deg) scale(1.1)' }
            }}
          >
            {board?.isStarred ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title={tPrimary('configureSprint')}>
          <Chip
            size="small"
            sx={{ ...MENU_STYLES, bgcolor: 'rgba(56, 189, 248, 0.24)', borderColor: themeConfig.accentColor }}
            icon={<CalendarMonthRoundedIcon fontSize="small" />}
            label={`${currentSprint.name}: ${String(currentSprint.startDate).slice(0, 5)}–${String(currentSprint.endDate).slice(0, 5)}`}
            onClick={openAnchor('sprint')}
            clickable
          />
        </Tooltip>

        <ViewSwitcher value={boardViewMode} onChange={setBoardViewMode} accentColor={themeConfig.accentColor} />

        <Tooltip title={tPrimary('deadlineCenterTitle')}>
          <Chip
            size="small"
            sx={{
              ...MENU_STYLES,
              bgcolor: deadlineColors.bg,
              borderColor: deadlineColors.border,
              animation: telemetry.overdueCards.length > 0 ? 'chelloPulseHalo 2.2s infinite' : 'none'
            }}
            icon={telemetry.alertCount > 0 ? <WarningAmberRoundedIcon fontSize="small" /> : <CheckCircleOutlineRoundedIcon fontSize="small" />}
            label={telemetry.alertCount > 0 ? `${telemetry.alertCount} ${tPrimary('deadlineAlerts')}` : tPrimary('onTrack')}
            onClick={openAnchor('deadline')}
            clickable
          />
        </Tooltip>

        <Tooltip title={tPrimary('filterPopoverTitle')}>
          <Badge color="secondary" badgeContent={activeFilterCount} invisible={activeFilterCount === 0} overlap="rectangular">
            <Chip
              size="small"
              sx={{ ...MENU_STYLES, bgcolor: activeFilterCount ? 'rgba(125, 211, 252, 0.35)' : MENU_STYLES.bgcolor }}
              icon={<FilterAltIcon fontSize="small" />}
              label={activeFilterCount ? `${filterStats.shown}/${filterStats.total} CR` : tPrimary('filterCrBtn')}
              onClick={openAnchor('filter')}
              clickable
            />
          </Badge>
        </Tooltip>

        <Chip
          size="small"
          sx={{ ...MENU_STYLES, bgcolor: 'rgba(167, 139, 250, 0.30)', borderColor: '#a78bfa' }}
          icon={<MenuBookRoundedIcon fontSize="small" />}
          label={tPrimary('knowledgeHubBtn')}
          onClick={openKnowledgeHub}
          clickable
        />

        <Chip
          size="small"
          sx={{ ...MENU_STYLES, bgcolor: 'rgba(16, 185, 129, 0.24)', borderColor: '#34d399' }}
          icon={<HandymanRoundedIcon fontSize="small" />}
          label={tPrimary('toolsMenu')}
          onClick={openAnchor('tools')}
          clickable
        />

        <Tooltip title={tPrimary('selectThemeTitle')}>
          <Chip
            size="small"
            sx={{ ...MENU_STYLES, borderColor: themeConfig.accentColor }}
            icon={<PaletteOutlinedIcon fontSize="small" />}
            label={themeConfig.name.split('•')[0].trim()}
            onClick={openAnchor('theme')}
            clickable
          />
        </Tooltip>

        <Chip
          size="small"
          sx={{ ...MENU_STYLES, display: { xs: 'none', xl: 'inline-flex' }, bgcolor: pomodoro.isRunning ? 'rgba(244, 114, 182, 0.35)' : MENU_STYLES.bgcolor }}
          icon={<SoraBunnyIcon fontSize="small" />}
          label={pomodoro.isRunning ? formatTimer(pomodoro.secondsLeft) : 'Pomodoro'}
          onClick={openAnchor('timer')}
          clickable
        />

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

      <SprintConfigPopover anchorEl={anchors.sprint} onClose={closeAnchor('sprint')} board={board} />
      <DeadlineCenterPopover anchorEl={anchors.deadline} onClose={closeAnchor('deadline')} telemetry={telemetry} />
      <ThemePickerPopover anchorEl={anchors.theme} onClose={closeAnchor('theme')} personaKey={personaKey} onSelect={handleSelectTheme} />
      <PomodoroPopover anchorEl={anchors.timer} onClose={closeAnchor('timer')} themeConfig={themeConfig} pomodoro={pomodoro} />
      <FilterPopover
        anchorEl={anchors.filter}
        onClose={closeAnchor('filter')}
        filters={filters}
        onChange={setFilters}
        roster={roster}
        stats={filterStats}
      />
      <ToolsMenu
        anchorEl={anchors.tools}
        onClose={closeAnchor('tools')}
        onOpenHub={openKnowledgeHub}
        onReport={() => setOpenReport(true)}
        onImport={() => setOpenImportMdModal(true)}
        onExportExcel={handleExport(exportSprintCrsToExcel, 'Excel')}
        onExportCsv={handleExport(exportSprintCrsToCsv, 'CSV')}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <InviteBoardUser boardId={board._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>
    </Box>
  )
}

export default BoardBar
