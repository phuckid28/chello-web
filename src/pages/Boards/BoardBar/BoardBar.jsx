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
import { ELEMENTAL_LABELS, PRIMARY_THEMES_LIST } from '~/utils/animeTheme'
import {
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  exportSprintCrsToExcel,
  getDeadlineStatus
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
  const [sprintName, setSprintName] = useState(currentSprint.name)
  const [sprintStart, setSprintStart] = useState(currentSprint.startDate)
  const [sprintEnd, setSprintEnd] = useState(currentSprint.endDate)
  const [sprintGoal, setSprintGoal] = useState(currentSprint.goal || '')

  useEffect(() => {
    const cfg = board?.sprintConfig || DEFAULT_SPRINT_CONFIG
    setSprintName(cfg.name || 'Sprint 34')
    setSprintStart(cfg.startDate || '22/10/2026')
    setSprintEnd(cfg.endDate || '05/11/2026')
    setSprintGoal(cfg.goal || '')
  }, [board?.sprintConfig])

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
          toast.success(`${themeConfig.characterName}: Đã hoàn thành phiên tập trung! Hãy nghỉ ngơi đôi chút nhé!`)
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, themeConfig.characterName])

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

  const handleSaveSprintConfig = () => {
    const nextConfig = {
      name: sprintName.trim() || 'Sprint 34',
      startDate: sprintStart.trim() || '22/10/2026',
      endDate: sprintEnd.trim() || '05/11/2026',
      goal: sprintGoal.trim()
    }
    dispatch(updateCurrentActiveBoard({ ...board, sprintConfig: nextConfig }))
    updateBoardDetailsAPI(board._id, { sprintConfig: nextConfig }).then(() => {
      playUiChime('complete')
      toast.success(`Đã cập nhật kỳ ${nextConfig.name} (${nextConfig.startDate} - ${nextConfig.endDate})!`)
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
      toast.info(`Đã chuyển chế độ bảng sang ${capitalizeFirstLetter(nextType)}`)
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

  const handleToggleViewMode = () => {
    if (!setBoardViewMode) return
    playUiChime('sparkle')
    setBoardViewMode(boardViewMode === 'kanban' ? 'overview' : 'kanban')
  }

  const handleExportExcel = () => {
    playUiChime('complete')
    exportSprintCrsToExcel(board)
    toast.success(`Đã xuất báo cáo Excel CR cho ${currentSprint.name} (${currentSprint.startDate} - ${currentSprint.endDate})!`)
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={board?.description || 'Nhấn để đổi tên bảng'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 0.5 }}>
            <SoraRibbonIcon sx={{ fontSize: '22px' }} />
            <Box sx={{
              minWidth: '120px',
              maxWidth: '220px',
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

        <Tooltip title={board?.isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao bảng này'}>
          <IconButton
            size="small"
            onClick={handleToggleStarBoard}
            sx={{
              color: board?.isStarred ? '#fbbf24' : 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
            }}
          >
            {board?.isStarred ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Active Sprint Badge (Default: Sprint 34 • 22/10 - 05/11) */}
        <Tooltip title="Chu kỳ Sprint hiện tại (Nhấn để cấu hình kỳ Sprint & thời gian 2 tuần)">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: 'rgba(56, 189, 248, 0.24)',
              borderColor: themeConfig.accentColor
            }}
            icon={<CalendarMonthRoundedIcon />}
            label={`${currentSprint.name}: ${currentSprint.startDate.slice(0, 5)} - ${currentSprint.endDate.slice(0, 5)}`}
            onClick={(e) => setSprintAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        {/* Deadline Alert Badge */}
        <Tooltip title="Trung tâm cảnh báo hạn hoàn thành CR (Overdue / Sắp đến hạn ≤ 2 ngày)">
          <Chip
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
            icon={boardTelemetry.alertCount > 0 ? <WarningAmberRoundedIcon /> : <CheckCircleOutlineRoundedIcon />}
            label={
              boardTelemetry.alertCount > 0
                ? `${boardTelemetry.alertCount} Cảnh báo hạn`
                : 'Đúng tiến độ'
            }
            onClick={(e) => setDeadlineAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        {/* Import Markdown to CR Ticket */}
        <Tooltip title="Import file Markdown (.md) hoặc đặc tả Antigravity thành CR Ticket kèm FRD">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: 'rgba(167, 139, 250, 0.26)',
              borderColor: '#a78bfa'
            }}
            icon={<UploadFileRoundedIcon />}
            label="Import MD → CR"
            onClick={() => {
              playUiChime('sparkle')
              setOpenImportMdModal(true)
            }}
            clickable
          />
        </Tooltip>

        {/* Export Sprint CRs to Excel */}
        <Tooltip title="Xuất báo cáo Excel (.xls) các CR trong kỳ Sprint (Kỳ Sprint, Bắt đầu, Kết thúc, Ngày cập nhật, Mã CR, Tên CR, PIC, Status, Deadline, Note)">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: 'rgba(16, 185, 129, 0.28)',
              borderColor: '#34d399'
            }}
            icon={<TableViewRoundedIcon />}
            label="Xuất Excel Sprint"
            onClick={handleExportExcel}
            clickable
          />
        </Tooltip>

        <Tooltip title="Chuyển đổi giữa Bảng Kanban và Tổng quan BA Matrix & Analytics">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: boardViewMode === 'overview' ? 'rgba(244, 114, 182, 0.32)' : MENU_STYLES.bgcolor,
              borderColor: boardViewMode === 'overview' ? '#f472b6' : 'rgba(255,255,255,0.24)'
            }}
            icon={boardViewMode === 'overview' ? <ViewKanbanOutlinedIcon /> : <InsightsRoundedIcon />}
            label={boardViewMode === 'overview' ? 'Kanban' : 'BA Matrix & Overview'}
            onClick={handleToggleViewMode}
            clickable
          />
        </Tooltip>

        <Tooltip title="Chọn chủ đề Nhân vật (Sora Kasugano / Furina / Nahida)">
          <Chip
            sx={{
              ...MENU_STYLES,
              borderColor: themeConfig.accentColor
            }}
            icon={<PaletteOutlinedIcon />}
            label={themeConfig.name.split('•')[0].trim()}
            onClick={(e) => setThemeAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        <Tooltip title="Bộ lọc nhanh theo Mã CR (VD: BNPL-1), Tên CR hoặc Nhãn">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: cardFilterText ? 'rgba(125, 211, 252, 0.35)' : MENU_STYLES.bgcolor
            }}
            icon={<FilterAltIcon />}
            label={cardFilterText ? `Lọc: ${cardFilterText}` : 'Lọc CR'}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            onDelete={cardFilterText ? () => setCardFilterText('') : undefined}
            clickable
          />
        </Tooltip>

        <Tooltip title="Đồng hồ tập trung Pomodoro">
          <Chip
            sx={{
              ...MENU_STYLES,
              display: { xs: 'none', xl: 'inline-flex' },
              bgcolor: isRunning ? 'rgba(244, 114, 182, 0.35)' : MENU_STYLES.bgcolor
            }}
            icon={<SoraBunnyIcon />}
            label={isRunning ? formatTimer(secondsLeft) : 'Pomodoro'}
            onClick={(e) => setTimerAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        <Tooltip title="Chuyển đổi Public / Private">
          <Chip
            sx={{ ...MENU_STYLES, display: { xs: 'none', xl: 'inline-flex' } }}
            icon={<VpnLockIcon />}
            label={capitalizeFirstLetter(board?.type)}
            onClick={handleToggleBoardType}
            clickable
          />
        </Tooltip>
      </Box>

      {/* Sprint Configuration Popover */}
      <Popover
        open={Boolean(sprintAnchor)}
        anchorEl={sprintAnchor}
        onClose={() => setSprintAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 360, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
            🗓️ Cấu hình Chu kỳ Sprint (2 Tuần)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Thông tin này sẽ hiển thị trên Board và tự động điền vào báo cáo Xuất Excel CR.
          </Typography>
          <TextField
            label="Tên kỳ Sprint"
            size="small"
            fullWidth
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            placeholder="Sprint 34"
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Ngày bắt đầu"
              size="small"
              fullWidth
              value={sprintStart}
              onChange={(e) => setSprintStart(e.target.value)}
              placeholder="22/10/2026"
            />
            <TextField
              label="Ngày kết thúc"
              size="small"
              fullWidth
              value={sprintEnd}
              onChange={(e) => setSprintEnd(e.target.value)}
              placeholder="05/11/2026"
            />
          </Stack>
          <TextField
            label="Mục tiêu Sprint (Sprint Goal)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={() => setSprintAnchor(null)}>Hủy</Button>
            <Button size="small" variant="contained" onClick={handleSaveSprintConfig}>
              Lưu kỳ Sprint
            </Button>
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
        <Box sx={{ p: 2.5, width: 390, maxHeight: 440, overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            ⏰ Theo dõi Tiến độ & Cảnh báo Deadline ({currentSprint.name})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Nhấn vào bất kỳ CR nào bên dưới để mở chi tiết và cập nhật tiến độ:
          </Typography>

          {boardTelemetry.alertCount === 0 ? (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.12)', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                ✅ Tất cả các CR trong {currentSprint.name} đều đang đúng tiến độ!
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
                  <Typography variant="caption" color="text.secondary">
                    PIC: {card.assignee || 'Chưa phân công'} • Cột: {columnTitle}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Popover>

      {/* Character Theme Selector Popover (Sora / Furina / Nahida) */}
      <Popover
        open={Boolean(themeAnchor)}
        anchorEl={themeAnchor}
        onClose={() => setThemeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 350 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.25 }}>
            🎨 Chọn Chủ đề Nhân vật (Sora • Furina • Nahida)
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
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {themeConfig.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đồng hồ tập trung phân tích BA & FRD
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
              {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
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
              5m Nghỉ
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
        <Box sx={{ p: 2, width: 320, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            🔍 Tìm kiếm & Lọc CR / Nhãn
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Nhập Mã CR (VD: BNPL-1), tên CR hoặc PIC..."
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
              Xóa bộ lọc
            </Button>
          )}
        </Box>
      </Popover>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <InviteBoardUser boardId={board._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>
    </Box>
  )
}

export default BoardBar
