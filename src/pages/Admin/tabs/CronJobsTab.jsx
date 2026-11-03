import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 300px auto 360px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

const stickyTableWrapperSx = {
  overflow: 'auto',
  maxInlineSize: '100%',
  maxBlockSize: 'min(420px, 68vh)',
  containerType: 'inline-size'
}

const stickyHeadCellSx = {
  fontWeight: 800,
  position: 'sticky',
  insetBlockStart: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
  whiteSpace: 'nowrap'
}

const INTERVAL_OPTIONS = [
  { value: 1, label: 'Mỗi 1 phút' },
  { value: 5, label: 'Mỗi 5 phút' },
  { value: 15, label: 'Mỗi 15 phút' },
  { value: 30, label: 'Mỗi 30 phút' },
  { value: 60, label: 'Mỗi 1 giờ (60p)' },
  { value: 180, label: 'Mỗi 3 giờ (180p)' },
  { value: 360, label: 'Mỗi 6 giờ (360p)' },
  { value: 720, label: 'Mỗi 12 giờ (720p)' },
  { value: 1440, label: 'Mỗi 24 giờ (1 ngày)' }
]

function CronJobsTab({
  cronData,
  onUpdateJob,
  onTriggerJob,
  busy
}) {
  const { lang } = useTranslation()
  const jobs = cronData?.jobs || []
  const recentRuns = cronData?.recentRuns || []

  const formatTime = (ts) => {
    if (!ts) return '—'
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(lang)
  }

  return (
    <Box>
      {/* 1. Scheduled Background Jobs Control Plane */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
            Trung tâm Điều phối Tác vụ Định kỳ (Cron Job Control Plane)
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Bật/tắt tiến trình nền, tùy chỉnh chu kỳ chạy, kích hoạt thủ công (Run Now) và cơ chế tự ngắt an toàn sau 3 lần lỗi liên tiếp.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {jobs.map((job, idx) => {
            const statusColor = job.isRunning
              ? 'info'
              : job.circuitOpen
                ? 'error'
                : job.enabled
                  ? 'success'
                  : 'default'

            return (
              <Box
                key={job.jobId}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: job.circuitOpen ? 'error.main' : job.enabled ? 'divider' : 'action.disabledBackground',
                  bgcolor: 'background.default',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1.5
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EditorialLabel index={idx + 1}>{job.category?.toUpperCase() || 'CRON'}</EditorialLabel>
                      <Chip
                        size='small'
                        color={statusColor}
                        label={job.isRunning ? 'RUNNING' : job.circuitOpen ? 'CIRCUIT TRIPPED' : job.enabled ? 'ENABLED' : 'PAUSED'}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20 }}
                      />
                    </Box>
                    <Switch
                      color='success'
                      checked={Boolean(job.enabled)}
                      disabled={busy}
                      onChange={(e) => onUpdateJob(job.jobId, { enabled: e.target.checked })}
                      inputProps={{ 'aria-label': job.name }}
                    />
                  </Box>

                  <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                    {job.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                    {job.description}
                  </Typography>
                  <Typography variant='caption' sx={{ fontFamily: MONO_FONT, display: 'block', color: 'text.secondary' }}>
                    ID: {job.jobId} • Lần chạy cuối: {formatTime(job.lastRunAt)} ({job.lastStatus || 'idle'})
                  </Typography>
                  {job.lastResultSummary && (
                    <Typography variant='caption' sx={{ fontFamily: MONO_FONT, display: 'block', color: 'primary.main', mt: 0.5 }}>
                      Kết quả: {job.lastResultSummary}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                  <FormControl size='small' sx={{ minWidth: 165 }}>
                    <InputLabel>Chu kỳ lặp lại</InputLabel>
                    <Select
                      label='Chu kỳ lặp lại'
                      value={Number(job.intervalMinutes || 60)}
                      disabled={busy}
                      onChange={(e) => onUpdateJob(job.jobId, { intervalMinutes: Number(e.target.value) })}
                    >
                      {INTERVAL_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    size='small'
                    variant='contained'
                    startIcon={<PlayArrowRoundedIcon />}
                    disabled={busy || job.isRunning}
                    onClick={() => onTriggerJob(job.jobId)}
                    sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                  >
                    Chạy ngay (Run Now)
                  </Button>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* 2. Execution History Table */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
            Lịch sử Thực thi Cron Job (Execution History)
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Ghi nhận thời gian bắt đầu, thời lượng xử lý, số bản ghi bị tác động và nguyên nhân kích hoạt (Tự động hoặc Thủ công bởi Admin).
          </Typography>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label='Cron Job Execution History' sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 165 }}>Thời gian</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 210 }}>Cron Job ID</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 110 }}>Kích hoạt</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 100 }}>Trạng thái</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 95 }}>Thời lượng</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 95 }}>Tác động</TableCell>
                <TableCell sx={stickyHeadCellSx}>Kết quả chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                    Chưa có lịch sử chạy Cron Job nào. Hãy bấm &ldquo;Chạy ngay (Run Now)&rdquo; ở trên để kiểm thử.
                  </TableCell>
                </TableRow>
              ) : (
                recentRuns.map((run) => (
                  <TableRow key={run._id || `${run.jobId}-${run.startedAt}`} hover>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(run.startedAt)}
                    </TableCell>
                    <TableCell component='th' scope='row' sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {run.jobId}
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                      {run.trigger === 'manual' ? 'MANUAL' : 'SCHEDULE'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size='small'
                        color={run.status === 'success' ? 'success' : 'error'}
                        label={String(run.status || 'success').toUpperCase()}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20 }}
                      />
                    </TableCell>
                    <TableCell align='right' sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(run.durationMs || 0)} ms
                    </TableCell>
                    <TableCell align='right' sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(run.affectedCount || 0)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={run.summary}>
                      {run.summary || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default CronJobsTab
