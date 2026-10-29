import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useDispatch, useSelector } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import {
  DEFAULT_SPRINT_CONFIG,
  downloadAttachedFrdFile,
  exportSprintCrsToExcel,
  formatDateVN,
  getDeadlineStatus
} from '~/utils/excelExporter'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'

function BoardAnalyticsView({ columns = [], themeConfig }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const sprintConfig = board?.sprintConfig || DEFAULT_SPRINT_CONFIG

  const allRealCards = []
  columns.forEach((col) => {
    (col.cards || []).forEach((card) => {
      if (!card.FE_PlaceholderCard) {
        allRealCards.push({
          ...card,
          columnTitle: col.title
        })
      }
    })
  })

  let totalChecklistItems = 0
  let completedChecklistItems = 0
  let totalFrdDocs = 0
  let overdueOrSoonCount = 0

  allRealCards.forEach((card) => {
    const list = card.checklist || []
    totalChecklistItems += list.length
    completedChecklistItems += list.filter((i) => i.isCompleted).length
    totalFrdDocs += (card.frdDocuments || []).length
    const dl = getDeadlineStatus(card)
    if (dl.code === 'overdue' || dl.code === 'due-soon') {
      overdueOrSoonCount++
    }
  })

  const checklistPercent = totalChecklistItems > 0
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
    : 0

  const handleOpenCard = (card) => {
    playUiChime('sparkle')
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const glassCardSx = {
    borderRadius: '16px',
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)'),
    backdropFilter: 'blur(18px) saturate(160%)',
    border: `1px solid ${themeConfig.columnBorder}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
    animation: 'chelloFadeSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        px: { xs: 2, md: 4 },
        py: 2
      }}
    >
      {/* Top Bento KPI Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                  TỔNG SỐ CR ({sprintConfig.name.toUpperCase()})
                </Typography>
                <SoraBunnyIcon fontSize="small" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: themeConfig.accentColor }}>
                {allRealCards.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Chu kỳ: {sprintConfig.startDate} – {sprintConfig.endDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                  TIẾN ĐỘ SUBTASKS & UAT
                </Typography>
                <SoraRibbonIcon fontSize="small" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#f472b6' }}>
                {checklistPercent}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={checklistPercent}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                  TÀI LIỆU FRD ĐÍNH KÈM
                </Typography>
                <SoraBunnyIcon fontSize="small" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {totalFrdDocs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đặc tả .MD / .PDF liên kết trực tiếp
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={themeConfig.mascotImage}
                alt={themeConfig.name}
                sx={{ width: 56, height: 56, border: `2px solid ${themeConfig.accentColor}` }}
              />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>
                  CẢNH BÁO DEADLINE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: overdueOrSoonCount > 0 ? '#f59e0b' : '#10b981' }}>
                  {overdueOrSoonCount} CR
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quá hạn hoặc còn ≤ 2 ngày
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* BA Sprint CR Tracking Matrix Table (Matches Excel Export Schema) */}
      <Card sx={{ ...glassCardSx, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                📋 Bảng Theo Dõi Change Request (CR) & FRD — {sprintConfig.name} ({sprintConfig.startDate} - {sprintConfig.endDate})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cập nhật tới ngày: {formatDateVN(new Date())} • Nhấn vào dòng bất kỳ để mở đặc tả FRD & chỉnh sửa CR
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="success"
              startIcon={<TableViewRoundedIcon />}
              onClick={() => exportSprintCrsToExcel(board)}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px' }}
            >
              Xuất File Excel ({sprintConfig.name})
            </Button>
          </Box>

          <TableContainer sx={{ borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.24)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(15, 23, 42, 0.75)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Kỳ Sprint</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Bắt đầu - Kết thúc</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Mã CR</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Tên CR</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Người phụ trách</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Trạng thái (Status)</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Deadline</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>FRD</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Note cần thiết</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRealCards.map((card, idx) => {
                  const dl = getDeadlineStatus(card)
                  const frdList = card.frdDocuments || []
                  return (
                    <TableRow
                      key={card._id}
                      hover
                      onClick={() => handleOpenCard(card)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontWeight: 700 }}>
                        {card.sprint || sprintConfig.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                        {sprintConfig.startDate} – {sprintConfig.endDate}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.crCode || `CR-${idx + 1}`}
                          size="small"
                          color="info"
                          sx={{ fontFamily: 'monospace', fontWeight: 800, height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 260 }}>
                        {card.title}
                      </TableCell>
                      <TableCell>
                        {card.assignee || board?.owners?.[0]?.displayName || 'Chưa phân công'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.baStatus ? `${card.baStatus} (${card.columnTitle})` : card.columnTitle}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dl.shortLabel}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            height: 22,
                            color: dl.color,
                            bgcolor: dl.bgColor,
                            border: `1px solid ${dl.color}55`
                          }}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {frdList.length > 0 ? (
                          <Chip
                            icon={<DownloadRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label={`${frdList.length} file`}
                            size="small"
                            color="secondary"
                            onClick={() => downloadAttachedFrdFile(frdList[0])}
                            clickable
                            sx={{ height: 22, fontWeight: 700 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240, fontSize: '0.78rem', color: 'text.secondary' }}>
                        {card.note || '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Stage Distribution Card */}
      <Grid container spacing={2.5}>
        <Grid xs={12}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SoraRibbonIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Phân bổ CR theo Cột Trạng thái (Workflow Distribution)
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                {columns.map((col) => {
                  const realCount = (col.cards || []).filter((c) => !c.FE_PlaceholderCard).length
                  const ratio = allRealCards.length > 0 ? Math.round((realCount / allRealCards.length) * 100) : 0
                  return (
                    <Box key={col._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {col.title}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {realCount} CR ({ratio}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={ratio}
                        sx={{ height: 7, borderRadius: 4 }}
                      />
                    </Box>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default BoardAnalyticsView
