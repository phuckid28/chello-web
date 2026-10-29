import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useTranslation } from '~/customHooks/useTranslation'
import {
  BA_STATUS_OPTIONS,
  DEFAULT_SPRINT_CONFIG,
  computeTeamResourcePoints,
  exportSprintCrsToCsv,
  exportSprintCrsToExcel,
  formatDateVN,
  formatShortDueDate,
  getCardDevProgress,
  getCardResourceUsed,
  getDeadlineStatus,
  getStatusOption,
  normalizeCrStatus
} from '~/utils/excelExporter'
import { playUiChime } from '~/utils/soundEffects'

function BoardAnalyticsView({ columns = [], themeConfig }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const board = useSelector(selectCurrentActiveBoard)
  const { tPrimary } = useTranslation()
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

  const teamResourceRows = computeTeamResourcePoints(board)

  const handleOpenCard = (card) => {
    playUiChime('sparkle')
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const glassCardSx = {
    borderRadius: '16px',
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)'),
    backdropFilter: 'blur(18px) saturate(160%)',
    border: `1px solid ${themeConfig.columnBorder}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
    animation: 'chelloFadeSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
  }

  const sprintNumber = sprintConfig.sprintNumber || String(sprintConfig.name || '34').replace(/[^0-9]/g, '') || '34'

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
      {/* Top 3-Block Template Header (Sprint Meta | Status List | Handle by & Resource Point) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Block 1: Sprint Info */}
        <Grid xs={12} md={4}>
          <Card sx={{ ...glassCardSx, height: '100%' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: themeConfig.accentColor, mb: 1.25 }}>
                🗓️ SPRINT METADATA (BOARD = SPRINT)
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 0.75, width: 120 }}>Sprint:</TableCell>
                    <TableCell sx={{ fontWeight: 800, py: 0.75, color: 'primary.main' }}>{sprintNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 0.75 }}>Start date:</TableCell>
                    <TableCell sx={{ py: 0.75 }}>{sprintConfig.startDate || '22/10/2026'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 0.75 }}>End date:</TableCell>
                    <TableCell sx={{ py: 0.75 }}>{sprintConfig.endDate || '05/11/2026'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 0.75 }}>Update till:</TableCell>
                    <TableCell sx={{ py: 0.75 }}>{sprintConfig.updateTill || formatDateVN(new Date())}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 0.75 }}>By:</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 0.75 }}>{sprintConfig.updatedBy || 'Dao Thanh Phuc'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 0.75 }}>Note:</TableCell>
                    <TableCell sx={{ py: 0.75, color: 'text.secondary' }}>{sprintConfig.goal || '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Block 2: Status Distribution */}
        <Grid xs={12} md={3.5}>
          <Card sx={{ ...glassCardSx, height: '100%' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8', mb: 1.25 }}>
                📊 STATUS STANDARD
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 0.6 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, py: 0.6 }}>CR Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {BA_STATUS_OPTIONS.map(st => {
                    const count = allRealCards.filter(c => normalizeCrStatus(c.baStatus) === st.value).length
                    return (
                      <TableRow key={st.value}>
                        <TableCell sx={{ py: 0.65 }}>
                          <Chip
                            label={st.value}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: st.color,
                              bgcolor: `${st.color}22`
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, py: 0.65 }}>
                          {count}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Block 3: Handle by & Resource point */}
        <Grid xs={12} md={4.5}>
          <Card sx={{ ...glassCardSx, height: '100%' }}>
            <CardContent sx={{ p: 2.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34d399', mb: 1.25 }}>
                👥 HANDLE BY & RESOURCE POINT (TEAM ROSTER)
              </Typography>
              <TableContainer sx={{ maxHeight: 225 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, py: 0.6 }}>Handle by</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, py: 0.6 }}>CRs</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, py: 0.6 }}>Resource point</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamResourceRows.map(row => (
                      <TableRow key={row.name} hover>
                        <TableCell sx={{ fontWeight: 700, py: 0.6 }}>{row.name}</TableCell>
                        <TableCell align="center" sx={{ py: 0.6 }}>{row.crCount}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, py: 0.6, color: row.points > 0 ? '#10b981' : 'text.secondary' }}>
                          {row.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section: Exact Sprint CR Tracking Table */}
      <Card sx={{ ...glassCardSx, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {tPrimary('sprintMatrixTitle')} — Sprint {sprintNumber} ({sprintConfig.startDate} – {sprintConfig.endDate})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Update till: {sprintConfig.updateTill || formatDateVN(new Date())} • By: {sprintConfig.updatedBy || 'Dao Thanh Phuc'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="info"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => exportSprintCrsToCsv(board)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px' }}
              >
                {tPrimary('exportCsvBtn')}
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<TableViewRoundedIcon />}
                onClick={() => exportSprintCrsToExcel(board)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px' }}
              >
                {tPrimary('exportExcelBtn')} (.XLS)
              </Button>
            </Stack>
          </Box>

          <TableContainer sx={{ borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.24)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(15, 23, 42, 0.85)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Ticket ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>CR Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Topic (Column)</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Handle by</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Due date for dev</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Dev Progress</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap' }}>Resource used</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 800 }}>Note</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 800 }}>Studio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRealCards.map((card, idx) => {
                  const dl = getDeadlineStatus(card)
                  const stOpt = getStatusOption(card.baStatus)
                  const devProg = getCardDevProgress(card)
                  const resUsed = getCardResourceUsed(card)
                  const shortDue = formatShortDueDate(card.deadline || card.dueDate)
                  return (
                    <TableRow
                      key={card._id}
                      hover
                      onClick={() => handleOpenCard(card)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Chip
                          label={card.crCode || `BNPL-${idx + 1}`}
                          size="small"
                          color="info"
                          sx={{ fontFamily: 'monospace', fontWeight: 800, height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, maxWidth: 320 }}>
                        {card.title}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip label={card.columnTitle} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          label={stOpt.value}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            height: 22,
                            color: stOpt.color,
                            bgcolor: `${stOpt.color}22`
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {card.assignee || '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={shortDue || dl.shortLabel}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            height: 22,
                            color: dl.color,
                            bgcolor: dl.bgColor
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>
                        {devProg}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        {resUsed || ''}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220, fontSize: '0.78rem', color: 'text.secondary' }}>
                        {card.note || ''}
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          startIcon={<PlayCircleFilledWhiteRoundedIcon />}
                          onClick={() => navigate(`/boards/${board._id}/cr/${card._id}`)}
                          sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.7rem', py: 0.3, px: 1, borderRadius: '8px', whiteSpace: 'nowrap' }}
                        >
                          Simulate
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default BoardAnalyticsView
