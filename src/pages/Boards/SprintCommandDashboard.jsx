import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import ViewTimelineRoundedIcon from '@mui/icons-material/ViewTimelineRounded'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  DEFAULT_SPRINT_CONFIG,
  collectBoardCardsWithColumn,
  exportSprintCrsToExcel,
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  getStatusOption
} from '~/utils/excelExporter'
import { getProgressColor } from '~/utils/progress'
import { DEFAULT_PRIORITY, getPriorityOption } from '~/utils/crMeta'
import { persistBoardView } from '~/utils/boardEvents'
import { extractSprintNumberOnly } from '~/utils/frdPdfExporter'
import { playUiChime } from '~/utils/soundEffects'

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

// Parse DD/MM/YYYY or YYYY-MM-DD into a local Date (midnight)
const parseFlexibleDate = (raw) => {
  if (!raw) return null
  if (typeof raw === 'number') {
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }
  const str = String(raw).trim()
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))
  }
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  }
  const parsed = new Date(str)
  return Number.isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

const formatDateKey = (date) => {
  if (!date) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const formatDisplayDmy = (date) => {
  if (!date) return '—'
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function SprintCommandDashboard({
  boards,
  activeBoardId,
  onSelectActiveBoardId,
  activeBoardDetails,
  loadingDetails,
  themeConfig
}) {
  const navigate = useNavigate()
  const [workFilter, setWorkFilter] = useState('in-progress') // 'in-progress' | 'all' | 'alerts'
  const [scheduleMode, setScheduleMode] = useState('calendar') // 'calendar' | 'timeline'
  const [selectedDateKey, setSelectedDateKey] = useState(null)

  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const [calendarMonth, setCalendarMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const sprintCfg = useMemo(() => ({
    ...DEFAULT_SPRINT_CONFIG,
    ...(activeBoardDetails?.sprintConfig || {})
  }), [activeBoardDetails])

  const sprintNumberDisplay = useMemo(
    () => extractSprintNumberOnly(sprintCfg.sprintNumber || sprintCfg.name) || '34',
    [sprintCfg.sprintNumber, sprintCfg.name]
  )

  const sprintStartDate = useMemo(() => parseFlexibleDate(sprintCfg.startDate), [sprintCfg.startDate])
  const sprintEndDate = useMemo(() => parseFlexibleDate(sprintCfg.endDate), [sprintCfg.endDate])

  useEffect(() => {
    setSelectedDateKey(null)
    if (sprintEndDate) {
      setCalendarMonth(new Date(sprintEndDate.getFullYear(), sprintEndDate.getMonth(), 1))
    }
  }, [activeBoardId, sprintEndDate])

  const allCardItems = useMemo(() => {
    if (!activeBoardDetails) return []
    return collectBoardCardsWithColumn(activeBoardDetails).map(({ card, columnTitle }) => {
      const devProg = getCardDevProgress(card)
      const devPct = Math.min(100, Math.round(devProg * 100))
      const resourcePt = getCardResourceUsed(card)
      const dlInfo = getDeadlineStatus(card)
      const statusOpt = getStatusOption(card?.baStatus)
      const priorityOpt = getPriorityOption(card?.priority || DEFAULT_PRIORITY)
      const dueDateObj = parseFlexibleDate(card?.deadline || card?.dueDate) || sprintEndDate
      const startDateObj = parseFlexibleDate(card?.startDate) || sprintStartDate || today
      const dateKey = formatDateKey(dueDateObj)
      const isDone = devPct >= 100 || card?.isCompleted || String(card?.baStatus || '').toLowerCase() === 'done'
      return {
        card,
        columnTitle,
        devProg,
        devPct,
        resourcePt,
        dlInfo,
        statusOpt,
        priorityOpt,
        dueDateObj,
        startDateObj,
        dateKey,
        isDone
      }
    })
  }, [activeBoardDetails, sprintEndDate, sprintStartDate, today])

  const metrics = useMemo(() => {
    const total = allCardItems.length
    const inProgress = allCardItems.filter(item => !item.isDone)
    const completed = allCardItems.filter(item => item.isDone)
    const alerts = allCardItems.filter(item => item.dlInfo.code === 'overdue' || item.dlInfo.code === 'due-soon')
    const avgPct = total > 0
      ? Math.round(allCardItems.reduce((sum, item) => sum + item.devPct, 0) / total)
      : 0
    const totalResource = allCardItems.reduce((sum, item) => sum + item.resourcePt, 0)
    return {
      total,
      inProgressCount: inProgress.length,
      completedCount: completed.length,
      alertCount: alerts.length,
      avgPct,
      totalResource
    }
  }, [allCardItems])

  const displayedCards = useMemo(() => {
    let list = allCardItems
    if (selectedDateKey) {
      return list.filter(item => item.dateKey === selectedDateKey)
    }
    if (workFilter === 'in-progress') {
      const activeList = list.filter(item => !item.isDone)
      return activeList.length > 0 ? activeList : list
    }
    if (workFilter === 'alerts') {
      return list.filter(item => item.dlInfo.code === 'overdue' || item.dlInfo.code === 'due-soon')
    }
    return list
  }, [allCardItems, workFilter, selectedDateKey])

  // Map dateKey -> array of card items due on that date
  const cardsByDateKey = useMemo(() => {
    const map = new Map()
    allCardItems.forEach((item) => {
      if (!item.dateKey) return
      const existing = map.get(item.dateKey) || []
      existing.push(item)
      map.set(item.dateKey, existing)
    })
    return map
  }, [allCardItems])

  // Build 42-cell (6-week) calendar grid starting on Monday
  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7 // Monday = 0 ... Sunday = 6
    const startCellDate = new Date(year, month, 1 - dayOfWeek)
    const cells = []
    for (let i = 0; i < 35; i += 1) {
      const cellDate = new Date(startCellDate.getFullYear(), startCellDate.getMonth(), startCellDate.getDate() + i)
      const key = formatDateKey(cellDate)
      const isCurrentMonth = cellDate.getMonth() === month
      const isToday = key === formatDateKey(today)
      const isInSprintRange = sprintStartDate && sprintEndDate
        ? cellDate >= sprintStartDate && cellDate <= sprintEndDate
        : false
      const dueItems = cardsByDateKey.get(key) || []
      cells.push({
        date: cellDate,
        key,
        dayNumber: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        isInSprintRange,
        dueItems
      })
    }
    return cells
  }, [calendarMonth, today, sprintStartDate, sprintEndDate, cardsByDateKey])

  const openBoardWithView = (viewMode) => {
    if (!activeBoardDetails?._id) return
    playUiChime('sparkle')
    persistBoardView(viewMode)
    navigate(`/boards/${activeBoardDetails._id}`)
  }

  const handleExportActiveSprint = () => {
    if (!activeBoardDetails) return
    playUiChime('complete')
    exportSprintCrsToExcel(activeBoardDetails)
    toast.success(`Đã xuất báo cáo Excel cho Sprint ${sprintNumberDisplay}!`)
  }

  if (!boards || boards.length === 0) return null

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header: Current Active Sprint Selector & Quick View Bar */}
      <Card
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: '18px',
          bgcolor: (theme) => (theme.palette.mode === 'dark'
            ? 'var(--chella-raised-dark, #131c31)'
            : 'var(--chella-raised-light, #ffffff)'),
          border: `1px solid ${themeConfig.columnBorder}`,
          boxShadow: (theme) => (theme.palette.mode === 'dark'
            ? '0 14px 36px rgba(0, 0, 0, 0.32)'
            : '0 8px 24px rgba(15, 23, 42, 0.06)')
        }}
      >
        {/* Top Row: Current Sprint Selector + Quick Launch Tools */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            pb: 2,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}>
            <Chip
              label={`SPRINT HIỆN TẠI • #${sprintNumberDisplay}`}
              size="small"
              sx={{
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontWeight: 800,
                fontSize: '0.72rem',
                color: '#0f172a',
                bgcolor: themeConfig.accentColor
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }} noWrap>
              {activeBoardDetails?.title || 'Đang tải thông tin Sprint...'}
            </Typography>
            <Chip
              icon={<CalendarMonthRoundedIcon fontSize="small" />}
              label={`${sprintCfg.startDate} → ${sprintCfg.endDate}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '0.72rem' }}
            />
          </Box>

          {/* Switch Active Sprint Board Pills + Direct View Launchers */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {boards.length > 1 && boards.slice(0, 4).map((b, idx) => {
              const isSelected = b._id === activeBoardId
              const num = extractSprintNumberOnly(b?.sprintConfig?.sprintNumber || b?.title) || String(idx + 1)
              return (
                <Chip
                  key={b._id}
                  size="small"
                  label={`Sprint ${num}`}
                  onClick={() => onSelectActiveBoardId(b._id)}
                  clickable
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    color: isSelected ? '#0f172a' : 'text.primary',
                    bgcolor: isSelected ? themeConfig.accentColor : 'action.hover',
                    border: isSelected ? `1px solid ${themeConfig.accentColor}` : '1px solid transparent'
                  }}
                />
              )
            })}

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

            <Tooltip title="Mở bảng ở chế độ Sprint Matrix">
              <Button
                size="small"
                variant="contained"
                startIcon={<TableChartRoundedIcon fontSize="small" />}
                onClick={() => openBoardWithView('overview')}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '8px',
                  color: '#0f172a',
                  bgcolor: themeConfig.accentColor,
                  '&:hover': { bgcolor: themeConfig.accentColor, opacity: 0.92 }
                }}
              >
                Sprint Matrix
              </Button>
            </Tooltip>

            <Tooltip title="Mở bảng ở chế độ Kanban">
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewKanbanRoundedIcon fontSize="small" />}
                onClick={() => openBoardWithView('kanban')}
                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
              >
                Kanban
              </Button>
            </Tooltip>

            <Tooltip title="Mở Timeline Gantt">
              <IconButton size="small" onClick={() => openBoardWithView('timeline')} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <ViewTimelineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Mở Sơ đồ tri thức Obsidian Graph">
              <IconButton size="small" onClick={() => openBoardWithView('graph')} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <HubRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Mở Knowledge Hub (Wiki)">
              <IconButton
                size="small"
                onClick={() => activeBoardDetails?._id && navigate(`/boards/${activeBoardDetails._id}/wiki`)}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <MenuBookRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Xuất báo cáo Excel (.xls) kỳ Sprint hiện tại">
              <IconButton size="small" onClick={handleExportActiveSprint} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <FileDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 4 Telemetry Summary Strips for Current Sprint */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1.5,
            my: 2
          }}
        >
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              TIẾN ĐỘ TRUNG BÌNH SPRINT #{sprintNumberDisplay}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: themeConfig.accentColor, fontVariantNumeric: 'tabular-nums' }}>
                {metrics.avgPct}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {metrics.completedCount}/{metrics.total} CR hoàn tất
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.avgPct}
              sx={{
                mt: 0.75,
                height: 5,
                borderRadius: 3,
                '& .MuiLinearProgress-bar': { bgcolor: themeConfig.accentColor }
              }}
            />
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              CÔNG VIỆC ĐANG THỰC HIỆN (ACTIVE CRS)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {metrics.inProgressCount}
              </Typography>
              <Chip label={`Tổng ${metrics.total} CR`} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} noWrap>
              Processing • In testing • Ready for deploy
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              TỔNG STORY POINT / RESOURCE USED
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                {metrics.totalResource} pt
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {activeBoardDetails?.columns?.length || 0} Chủ đề CR
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} noWrap>
              Cập nhật bởi: {sprintCfg.updatedBy || 'Dao Thanh Phuc'}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              THEO DÕI DEADLINE & DUE DATE
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography
                sx={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: metrics.alertCount > 0 ? '#f59e0b' : '#10b981',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {metrics.alertCount > 0 ? `${metrics.alertCount} lưu ý` : 'Đúng hạn'}
              </Typography>
              {metrics.alertCount > 0 ? (
                <WarningAmberRoundedIcon sx={{ color: '#f59e0b' }} />
              ) : (
                <CheckCircleOutlineRoundedIcon sx={{ color: '#10b981' }} />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} noWrap>
              Hạn kết thúc Sprint: {sprintCfg.endDate}
            </Typography>
          </Box>
        </Box>

        {loadingDetails ? (
          <Box sx={{ py: 5, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {/* Left 7 Cols: Live In-Progress Work & CR Progress Tracker */}
            <Grid xs={12} lg={7}>
              <Box
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                      <TrendingUpRoundedIcon fontSize="small" sx={{ color: themeConfig.accentColor }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Tiến Độ Công Việc Đang Thực Hiện ({displayedCards.length})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                      {selectedDateKey && (
                        <Chip
                          size="small"
                          color="info"
                          label={`Ngày: ${selectedDateKey.split('-').reverse().join('/')} (✕)`}
                          onClick={() => setSelectedDateKey(null)}
                          sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      )}
                      <Chip
                        size="small"
                        label={`Đang chạy (${metrics.inProgressCount})`}
                        onClick={() => {
                          setSelectedDateKey(null)
                          setWorkFilter('in-progress')
                        }}
                        clickable
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: !selectedDateKey && workFilter === 'in-progress' ? themeConfig.accentColor : 'action.selected',
                          color: !selectedDateKey && workFilter === 'in-progress' ? '#0f172a' : 'text.primary'
                        }}
                      />
                      <Chip
                        size="small"
                        label={`Tất cả (${metrics.total})`}
                        onClick={() => {
                          setSelectedDateKey(null)
                          setWorkFilter('all')
                        }}
                        clickable
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: !selectedDateKey && workFilter === 'all' ? themeConfig.accentColor : 'action.selected',
                          color: !selectedDateKey && workFilter === 'all' ? '#0f172a' : 'text.primary'
                        }}
                      />
                      {metrics.alertCount > 0 && (
                        <Chip
                          size="small"
                          label={`Cần chú ý (${metrics.alertCount})`}
                          onClick={() => {
                            setSelectedDateKey(null)
                            setWorkFilter('alerts')
                          }}
                          clickable
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: !selectedDateKey && workFilter === 'alerts' ? '#f59e0b' : 'action.selected',
                            color: !selectedDateKey && workFilter === 'alerts' ? '#0f172a' : 'text.primary'
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {displayedCards.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Không có công việc CR nào khớp với bộ lọc hiện tại.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.15} sx={{ maxHeight: 370, overflowY: 'auto', pr: 0.5 }}>
                      {displayedCards.map((item) => {
                        const { card, columnTitle, devProg, devPct, resourcePt, dlInfo, statusOpt, priorityOpt, dueDateObj } = item
                        return (
                          <Box
                            key={card._id}
                            sx={{
                              p: 1.4,
                              borderRadius: '11px',
                              border: '1px solid',
                              borderColor: dlInfo.code === 'overdue' ? 'rgba(239, 68, 68, 0.5)' : 'divider',
                              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.55)' : '#f8fafc'),
                              transition: 'border-color 0.18s ease, transform 0.18s ease',
                              '&:hover': {
                                borderColor: themeConfig.accentColor,
                                transform: 'translateX(2px)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 0.6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flexWrap: 'wrap' }}>
                                {card.crCode && (
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      px: 0.75,
                                      py: 0.15,
                                      borderRadius: '5px',
                                      color: themeConfig.accentColor,
                                      bgcolor: 'rgba(15, 23, 42, 0.82)'
                                    }}
                                  >
                                    {card.crCode}
                                  </Typography>
                                )}
                                <Chip
                                  size="small"
                                  label={statusOpt.value}
                                  sx={{
                                    height: 20,
                                    fontSize: '0.66rem',
                                    fontWeight: 800,
                                    color: statusOpt.color,
                                    bgcolor: `${statusOpt.color}18`
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
                                  {priorityOpt.icon} {columnTitle.split('•')[0].trim()}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                {dueDateObj && (
                                  <Chip
                                    icon={<AccessTimeRoundedIcon sx={{ fontSize: '12px !important' }} />}
                                    label={dlInfo.shortLabel || formatDisplayDmy(dueDateObj)}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      color: dlInfo.code !== 'none' ? dlInfo.color : 'text.secondary',
                                      bgcolor: dlInfo.code !== 'none' ? dlInfo.bgColor : 'action.hover'
                                    }}
                                  />
                                )}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  endIcon={<NorthEastRoundedIcon sx={{ fontSize: 12 }} />}
                                  onClick={() => navigate(`/boards/${activeBoardDetails._id}/cr/${card._id}`)}
                                  sx={{
                                    minWidth: 'unset',
                                    px: 0.85,
                                    py: 0.15,
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    borderRadius: '6px'
                                  }}
                                >
                                  CR Studio
                                </Button>
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              onClick={() => openBoardWithView('overview')}
                              sx={{
                                fontWeight: 700,
                                cursor: 'pointer',
                                mb: 0.75,
                                '&:hover': { color: 'primary.main' }
                              }}
                            >
                              {card.title}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
                                Handle by: <b>{card.assignee || 'Chưa gán'}</b>
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                                    fontWeight: 800,
                                    color: '#10b981',
                                    fontVariantNumeric: 'tabular-nums'
                                  }}
                                >
                                  {resourcePt} pt
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                                    fontWeight: 800,
                                    fontVariantNumeric: 'tabular-nums'
                                  }}
                                >
                                  {devPct}%
                                </Typography>
                              </Box>
                            </Box>

                            <LinearProgress
                              variant="determinate"
                              value={devPct}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  bgcolor: getProgressColor(devProg)
                                }
                              }}
                            />
                          </Box>
                        )
                      })}
                    </Stack>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Right 5 Cols: Interactive Monthly Calendar + Deadlines & Mini-Timeline */}
            <Grid xs={12} lg={5}>
              <Box
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  {/* Calendar vs Timeline Switcher Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CalendarMonthRoundedIcon fontSize="small" sx={{ color: themeConfig.accentColor }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Lịch Ngày & Deadline / Timeline
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip
                        size="small"
                        label="📅 Lịch & Deadline"
                        onClick={() => setScheduleMode('calendar')}
                        clickable
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          bgcolor: scheduleMode === 'calendar' ? themeConfig.accentColor : 'action.selected',
                          color: scheduleMode === 'calendar' ? '#0f172a' : 'text.primary'
                        }}
                      />
                      <Chip
                        size="small"
                        label="📊 Timeline"
                        onClick={() => setScheduleMode('timeline')}
                        clickable
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          bgcolor: scheduleMode === 'timeline' ? themeConfig.accentColor : 'action.selected',
                          color: scheduleMode === 'timeline' ? '#0f172a' : 'text.primary'
                        }}
                      />
                    </Box>
                  </Box>

                  {scheduleMode === 'calendar' ? (
                    <Box>
                      {/* Month Navigation Bar */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: '"JetBrains Mono", Consolas, monospace' }}>
                          Tháng {String(calendarMonth.getMonth() + 1).padStart(2, '0')} / {calendarMonth.getFullYear()}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                          >
                            <ChevronLeftRoundedIcon fontSize="small" />
                          </IconButton>
                          <Chip
                            size="small"
                            label="Hôm nay"
                            onClick={() => {
                              setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1))
                              setSelectedDateKey(formatDateKey(today))
                            }}
                            clickable
                            sx={{ height: 22, fontSize: '0.66rem', fontWeight: 700 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                          >
                            <ChevronRightRoundedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* 7-Column Calendar Grid */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1.5 }}>
                        {WEEKDAYS_VI.map((dayLabel) => (
                          <Box key={dayLabel} sx={{ textAlign: 'center', py: 0.4 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.66rem', color: 'text.secondary' }}>
                              {dayLabel}
                            </Typography>
                          </Box>
                        ))}
                        {calendarCells.map((cell) => {
                          const hasDeadlines = cell.dueItems.length > 0
                          const isSelected = selectedDateKey === cell.key
                          return (
                            <Tooltip
                              key={cell.key}
                              title={
                                hasDeadlines
                                  ? `${formatDisplayDmy(cell.date)}: ${cell.dueItems.map(i => i.card.crCode || i.card.title).join(', ')}`
                                  : formatDisplayDmy(cell.date)
                              }
                            >
                              <Box
                                onClick={() => setSelectedDateKey(isSelected ? null : cell.key)}
                                sx={{
                                  py: 0.65,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'grid',
                                  placeItems: 'center',
                                  position: 'relative',
                                  opacity: cell.isCurrentMonth ? 1 : 0.38,
                                  bgcolor: isSelected
                                    ? themeConfig.accentColor
                                    : cell.isInSprintRange
                                      ? 'rgba(56, 189, 248, 0.12)'
                                      : 'transparent',
                                  color: isSelected ? '#0f172a' : 'text.primary',
                                  border: cell.isToday
                                    ? `1.5px solid ${themeConfig.accentColor}`
                                    : hasDeadlines
                                      ? '1px solid rgba(245, 158, 11, 0.55)'
                                      : '1px solid transparent',
                                  '&:hover': {
                                    bgcolor: isSelected ? themeConfig.accentColor : 'action.hover'
                                  }
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '0.74rem',
                                    fontWeight: cell.isToday || hasDeadlines || isSelected ? 800 : 600,
                                    fontVariantNumeric: 'tabular-nums',
                                    lineHeight: 1.15
                                  }}
                                >
                                  {cell.dayNumber}
                                </Typography>
                                {hasDeadlines && (
                                  <Box sx={{ display: 'flex', gap: 0.3, mt: 0.25 }}>
                                    {cell.dueItems.slice(0, 3).map((dItem) => (
                                      <Box
                                        key={dItem.card._id}
                                        sx={{
                                          width: 5,
                                          height: 5,
                                          borderRadius: '50%',
                                          bgcolor: isSelected ? '#0f172a' : dItem.statusOpt.color
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            </Tooltip>
                          )
                        })}
                      </Box>

                      {/* Upcoming Deadlines List */}
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                        ⏰ MỐC DEADLINE TRONG KỲ SPRINT ({sprintCfg.startDate} – {sprintCfg.endDate})
                      </Typography>
                      <Stack spacing={0.75} sx={{ maxHeight: 135, overflowY: 'auto', pr: 0.5 }}>
                        {allCardItems.map((item) => (
                          <Box
                            key={`dl-${item.card._id}`}
                            onClick={() => navigate(`/boards/${activeBoardDetails._id}/cr/${item.card._id}`)}
                            sx={{
                              px: 1.15,
                              py: 0.75,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              bgcolor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }} noWrap>
                                {item.card.crCode ? `[${item.card.crCode}] ` : ''}{item.card.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem' }} noWrap>
                                Handle by: {item.card.assignee || 'Chưa gán'}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={formatDisplayDmy(item.dueDateObj)}
                              sx={{
                                height: 20,
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                fontFamily: '"JetBrains Mono", Consolas, monospace',
                                color: item.dlInfo.code !== 'none' ? item.dlInfo.color : 'text.primary',
                                bgcolor: item.dlInfo.code !== 'none' ? item.dlInfo.bgColor : 'background.paper'
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    /* Mini-Timeline Gantt View */
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          Start: {sprintCfg.startDate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          Due: {sprintCfg.endDate}
                        </Typography>
                      </Box>

                      <Stack spacing={1.15} sx={{ maxHeight: 310, overflowY: 'auto', pr: 0.5 }}>
                        {allCardItems.map((item, idx) => {
                          const offsetLeft = Math.min(35, idx * 10)
                          const barWidth = Math.max(45, 100 - offsetLeft)
                          return (
                            <Box
                              key={`tl-${item.card._id}`}
                              onClick={() => openBoardWithView('timeline')}
                              sx={{
                                p: 1.15,
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: 'divider',
                                cursor: 'pointer',
                                '&:hover': { borderColor: themeConfig.accentColor }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800 }} noWrap>
                                  {item.card.crCode ? `${item.card.crCode} • ` : ''}{item.card.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                                    fontWeight: 800,
                                    fontSize: '0.66rem',
                                    color: item.statusOpt.color,
                                    flexShrink: 0,
                                    ml: 1
                                  }}
                                >
                                  {formatDisplayDmy(item.dueDateObj)} ({item.devPct}%)
                                </Typography>
                              </Box>

                              <Box sx={{ position: 'relative', height: 12, borderRadius: 6, bgcolor: 'action.hover', overflow: 'hidden' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: `${offsetLeft}%`,
                                    width: `${barWidth}%`,
                                    borderRadius: 6,
                                    bgcolor: `${item.statusOpt.color}33`,
                                    border: `1px solid ${item.statusOpt.color}`
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: '100%',
                                      width: `${item.devPct}%`,
                                      borderRadius: 6,
                                      bgcolor: item.statusOpt.color
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          )
                        })}
                      </Stack>

                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<ViewTimelineRoundedIcon fontSize="small" />}
                        onClick={() => openBoardWithView('timeline')}
                        sx={{ mt: 1.5, fontWeight: 800, textTransform: 'none', borderRadius: '8px' }}
                      >
                        Mở toàn màn hình Timeline Gantt
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Card>
    </Box>
  )
}

export default SprintCommandDashboard
