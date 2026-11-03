import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { toast } from 'react-toastify'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatBytes } from '../adminUtils'

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
  maxBlockSize: 'min(520px, 72vh)',
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

const statusChipColor = (code) => {
  const n = Number(code) || 0
  if (n >= 500) return 'error'
  if (n === 429) return 'secondary'
  if (n >= 400) return 'warning'
  if (n >= 300) return 'info'
  return 'success'
}

const methodChipColor = (method) => {
  const m = String(method || '').toUpperCase()
  if (m === 'DELETE') return 'error'
  if (m === 'POST') return 'primary'
  if (m === 'PUT' || m === 'PATCH') return 'warning'
  return 'default'
}

function ApiLogsTab({
  apiLogsData,
  filters,
  onChangeFilters,
  onUpdateConfig,
  onClearLogs,
  busy
}) {
  const { lang } = useTranslation()
  const [selectedLog, setSelectedLog] = useState(null)

  const items = Array.isArray(apiLogsData?.items) ? apiLogsData.items : []
  const rawSummary = apiLogsData?.summary || {}
  const config = apiLogsData?.config || rawSummary || { captureMode: 'errors_and_mutations', maxDbLogs: 2000 }
  const maxDbLogs = Number(config.maxDbLogs || rawSummary.maxDbLogs || 2000)
  const totalCaptured = Number(rawSummary.totalCaptured ?? rawSummary.bufferedCount ?? items.length)
  const count2xx = Number(rawSummary.count2xx ?? items.filter(i => i.statusCode >= 200 && i.statusCode < 300).length)
  const count4xx = Number(rawSummary.count4xx ?? items.filter(i => i.statusCode >= 400 && i.statusCode < 500 && i.statusCode !== 429).length)
  const count429 = Number(rawSummary.count429 ?? items.filter(i => i.statusCode === 429).length)
  const count5xx = Number(rawSummary.count5xx ?? items.filter(i => i.statusCode >= 500).length)
  const slowCount = Number(rawSummary.slowCount ?? items.filter(i => Number(i.durationMs) >= 800).length)
  const dbCount = Number(apiLogsData?.dbCount ?? totalCaptured)

  const formatTime = (ts) => {
    if (!ts) return '—'
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString(lang, { hour12: false })
  }

  const handleCopyCurl = async (curlStr) => {
    try {
      await navigator.clipboard.writeText(curlStr || '')
      toast.success('Đã sao chép lệnh cURL vào clipboard!')
    } catch {
      toast.error('Không thể sao chép cURL')
    }
  }

  const selectedCurl = selectedLog?.curl || selectedLog?.curlSnippet || ''

  return (
    <Box>
      {/* 1. Capture Policy & FIFO Rotation Cap */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>
              Giám sát API Logs Thời gian thực & Tự động Xoay vòng FIFO
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Tự động che giấu thông tin nhạy cảm (PII / Password / Token Scrubber) và tự động xóa bản ghi cũ nhất khi chạm ngưỡng tối đa.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              color={dbCount >= maxDbLogs * 0.9 ? 'warning' : 'info'}
              label={`FIFO CAP: ${dbCount} / ${maxDbLogs} logs`}
              sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}
            />
            <Button
              size='small'
              color='error'
              variant='outlined'
              startIcon={<DeleteSweepRoundedIcon />}
              disabled={busy}
              onClick={onClearLogs}
              sx={{ fontWeight: 700 }}
            >
              Xóa toàn bộ Logs
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
          <FormControl size='small' fullWidth>
            <InputLabel>Chế độ thu thập (Capture Mode)</InputLabel>
            <Select
              label='Chế độ thu thập (Capture Mode)'
              value={config.captureMode || 'errors_and_mutations'}
              disabled={busy}
              onChange={(e) => onUpdateConfig({ captureMode: e.target.value })}
            >
              <MenuItem value='errors_and_mutations'>Lỗi (&gt;=400), Chậm & Thao tác ghi (Khuyên dùng)</MenuItem>
              <MenuItem value='all'>Toàn bộ Request (All Traffic)</MenuItem>
              <MenuItem value='errors_only'>Chỉ Request Lỗi (&gt;=400) & Chậm</MenuItem>
              <MenuItem value='paused'>Tạm dừng ghi (Paused)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' fullWidth>
            <InputLabel>Giới hạn Lưu trữ Tối đa (FIFO Cap)</InputLabel>
            <Select
              label='Giới hạn Lưu trữ Tối đa (FIFO Cap)'
              value={maxDbLogs}
              disabled={busy}
              onChange={(e) => onUpdateConfig({ maxDbLogs: Number(e.target.value) })}
            >
              <MenuItem value={500}>Tối đa 500 logs (Tự xóa cũ)</MenuItem>
              <MenuItem value={1000}>Tối đa 1.000 logs (Tự xóa cũ)</MenuItem>
              <MenuItem value={2000}>Tối đa 2.000 logs (Mặc định)</MenuItem>
              <MenuItem value={5000}>Tối đa 5.000 logs (Tự xóa cũ)</MenuItem>
              <MenuItem value={10000}>Tối đa 10.000 logs (Tự xóa cũ)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Summary Counters */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.5 }}>
          {[
            { label: 'BẢN GHI HIỆN TẠI', val: totalCaptured, color: 'text.primary' },
            { label: '2XX THÀNH CÔNG', val: count2xx, color: 'success.main' },
            { label: '4XX LỖI CLIENT', val: count4xx, color: 'warning.main' },
            { label: '429 RATE LIMIT', val: count429, color: 'secondary.main' },
            { label: '5XX LỖI SERVER', val: count5xx, color: 'error.main' },
            { label: 'CHẬM (>=800ms)', val: slowCount, color: 'info.main' }
          ].map((stat, idx) => (
            <Box key={stat.label} sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <EditorialLabel index={idx + 1}>{stat.label}</EditorialLabel>
              <Typography variant='h6' sx={{ fontFamily: MONO_FONT, fontWeight: 800, color: stat.color, mt: 0.25, fontVariantNumeric: 'tabular-nums' }}>
                {Number(stat.val || 0)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 2. Filter Bar & Live API Logs Table */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '1.2fr 1.2fr 1.2fr 2.4fr' }, gap: 1.5, mb: 2 }}>
          <FormControl size='small'>
            <InputLabel>HTTP Method</InputLabel>
            <Select
              label='HTTP Method'
              value={filters.method || ''}
              onChange={(e) => onChangeFilters({ ...filters, method: e.target.value })}
            >
              <MenuItem value=''>Tất cả Method</MenuItem>
              <MenuItem value='GET'>GET</MenuItem>
              <MenuItem value='POST'>POST</MenuItem>
              <MenuItem value='PUT'>PUT</MenuItem>
              <MenuItem value='PATCH'>PATCH</MenuItem>
              <MenuItem value='DELETE'>DELETE</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small'>
            <InputLabel>Mã trạng thái</InputLabel>
            <Select
              label='Mã trạng thái'
              value={filters.statusGroup || ''}
              onChange={(e) => onChangeFilters({ ...filters, statusGroup: e.target.value })}
            >
              <MenuItem value=''>Tất cả Status</MenuItem>
              <MenuItem value='2xx'>2xx Success</MenuItem>
              <MenuItem value='4xx'>4xx Client Error</MenuItem>
              <MenuItem value='429'>429 Rate Limited</MenuItem>
              <MenuItem value='5xx'>5xx Server Error</MenuItem>
              <MenuItem value='error'>Mọi lỗi (&gt;=400)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small'>
            <InputLabel>Độ trễ tối thiểu</InputLabel>
            <Select
              label='Độ trễ tối thiểu'
              value={filters.minDurationMs || 0}
              onChange={(e) => onChangeFilters({ ...filters, minDurationMs: Number(e.target.value) })}
            >
              <MenuItem value={0}>Mọi độ trễ</MenuItem>
              <MenuItem value={100}>&gt;= 100 ms</MenuItem>
              <MenuItem value={500}>&gt;= 500 ms</MenuItem>
              <MenuItem value={1000}>&gt;= 1000 ms</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size='small'
            type='search'
            label='Tìm theo Path, IP, Email, Request ID…'
            value={filters.q || ''}
            onChange={(e) => onChangeFilters({ ...filters, q: e.target.value })}
          />
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label='API Request Logs' sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 980 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 92 }}>Thời gian</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 86 }}>Method</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 82 }}>Status</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 250 }}>Endpoint Path</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 96 }}>Độ trễ</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 136 }}>In / Out</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 130 }}>Client IP</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 108 }}>Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                    Chưa có bản ghi API Log nào khớp bộ lọc.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((log) => (
                  <TableRow key={log.requestId || log._id} hover>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(log.timestamp || log.createdAt)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size='small'
                        color={methodChipColor(log.method)}
                        label={log.method}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size='small'
                        color={statusChipColor(log.statusCode)}
                        label={log.statusCode}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20, fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: MONO_FONT,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={log.path}
                    >
                      {log.path}
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        fontFamily: MONO_FONT,
                        fontSize: '0.76rem',
                        fontWeight: Number(log.durationMs) >= 800 ? 800 : 500,
                        color: Number(log.durationMs) >= 800 ? 'warning.main' : 'text.primary',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {Number(log.durationMs || 0).toFixed(1)} ms
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        fontFamily: MONO_FONT,
                        fontSize: '0.73rem',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {formatBytes(log.bytesIn)} / {formatBytes(log.bytesOut)}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: MONO_FONT,
                        fontSize: '0.74rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={log.userEmail || log.ip}
                    >
                      {log.ip}
                    </TableCell>
                    <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<VisibilityRoundedIcon fontSize='small' />}
                        onClick={() => setSelectedLog(log)}
                        sx={{ fontWeight: 700, fontSize: '0.7rem', py: 0.25 }}
                      >
                        Trace
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Request Trace & Scrubbed Payload Inspector Dialog */}
      <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, fontWeight: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip size='small' color={methodChipColor(selectedLog?.method)} label={selectedLog?.method} sx={{ fontFamily: MONO_FONT, fontWeight: 800 }} />
            <Chip size='small' color={statusChipColor(selectedLog?.statusCode)} label={selectedLog?.statusCode} sx={{ fontFamily: MONO_FONT, fontWeight: 800 }} />
            <Typography variant='subtitle1' sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}>{selectedLog?.path}</Typography>
          </Box>
          {selectedCurl && (
            <Button
              size='small'
              variant='contained'
              startIcon={<ContentCopyRoundedIcon fontSize='small' />}
              onClick={() => handleCopyCurl(selectedCurl)}
              sx={{ fontWeight: 800 }}
            >
              Copy cURL
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            <Box>
              <Typography variant='caption' color='text.secondary'>Request ID (X-Request-Id)</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}>{selectedLog?.requestId}</Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Client IP & User</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}>
                {selectedLog?.ip} {selectedLog?.userEmail ? `(${selectedLog.userEmail})` : ''}
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Latency & Bandwidth</Typography>
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}>
                {selectedLog?.durationMs} ms • In {formatBytes(selectedLog?.bytesIn)} / Out {formatBytes(selectedLog?.bytesOut)}
              </Typography>
            </Box>
          </Box>

          {selectedLog?.errorMessage && (
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'error.main', color: 'error.contrastText', fontFamily: MONO_FONT, fontSize: '0.78rem' }}>
              Error: {selectedLog.errorMessage}
            </Box>
          )}

          <Box>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              Request Headers (Đã lọc PII / Cookie / Authorization)
            </Typography>
            <Box component='pre' sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', fontFamily: MONO_FONT, fontSize: '0.75rem', overflow: 'auto', m: 0 }}>
              {JSON.stringify(selectedLog?.reqHeaders || selectedLog?.headers || {}, null, 2)}
            </Box>
          </Box>

          <Box>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              Query & Request Body (Đã tự động che giấu mật khẩu & khóa bí mật)
            </Typography>
            <Box component='pre' sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', fontFamily: MONO_FONT, fontSize: '0.75rem', overflow: 'auto', m: 0 }}>
              {JSON.stringify({ query: selectedLog?.reqQuery || selectedLog?.query || {}, body: selectedLog?.reqBody || selectedLog?.body || null }, null, 2)}
            </Box>
          </Box>

          {selectedCurl && (
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
                Lệnh cURL tái hiện Request
              </Typography>
              <Box component='pre' sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', fontFamily: MONO_FONT, fontSize: '0.75rem', overflow: 'auto', m: 0 }}>
                {selectedCurl}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)} sx={{ fontWeight: 700 }}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ApiLogsTab
