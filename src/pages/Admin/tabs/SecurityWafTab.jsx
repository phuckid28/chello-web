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
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded'
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

function SecurityWafTab({
  securityData,
  filters,
  onChangeFilters,
  onCreateIpRule,
  onDeleteIpRule,
  onVerifyAuditChain,
  onRunWafSimulator,
  auditChainResult,
  wafSimResult,
  busy
}) {
  const { tPrimary, lang } = useTranslation()

  const [ipInput, setIpInput] = useState('')
  const [modeInput, setModeInput] = useState('block')
  const [durationInput, setDurationInput] = useState(60)
  const [reasonInput, setReasonInput] = useState('')

  const posture = securityData?.posture || { score: 100, grade: 'A+', checks: [] }
  const ipRules = securityData?.ipRules || []
  const events = securityData?.events || []
  const auditIntegrity = auditChainResult || securityData?.auditIntegrity || null

  const handleAddRule = async (e) => {
    e.preventDefault()
    if (!ipInput.trim()) return
    await onCreateIpRule({
      ip: ipInput.trim(),
      mode: modeInput,
      durationMinutes: durationInput === 0 ? null : Number(durationInput),
      reason: reasonInput.trim()
    })
    setIpInput('')
    setReasonInput('')
  }

  const formatTime = (ts) => {
    if (!ts) return tPrimary('admIpDurationPerm')
    const d = new Date(ts)
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(lang)
  }

  const severityColor = (sev) => {
    if (sev === 'critical') return 'error'
    if (sev === 'high') return 'warning'
    if (sev === 'warn') return 'info'
    return 'default'
  }

  return (
    <Box>
      {/* 1. Security Posture Score, Audit Hash Chain Verification & WAF Self-Test */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admPostureTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admPostureSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size='small'
              variant='outlined'
              color='secondary'
              startIcon={<BugReportRoundedIcon />}
              disabled={busy}
              onClick={onRunWafSimulator}
              sx={{ fontWeight: 800 }}
            >
              Chạy WAF Self-Test
            </Button>
            <Button
              size='small'
              variant='outlined'
              color='info'
              startIcon={<VerifiedRoundedIcon />}
              disabled={busy}
              onClick={onVerifyAuditChain}
              sx={{ fontWeight: 800 }}
            >
              Xác thực Chuỗi Hash Audit (SHA-256)
            </Button>
            <Chip
              color={posture.score >= 85 ? 'success' : posture.score >= 70 ? 'warning' : 'error'}
              label={`SCORE: ${posture.score} / 100 (${posture.grade})`}
              sx={{ fontFamily: MONO_FONT, fontWeight: 800, fontSize: '0.85rem' }}
            />
          </Box>
        </Box>

        {auditIntegrity && (
          <Alert severity={auditIntegrity.valid ? 'success' : 'error'} sx={{ mb: 2, fontFamily: MONO_FONT, fontSize: '0.78rem' }}>
            {auditIntegrity.valid
              ? `SHA-256 Audit Chain VALID — Đã đối chiếu ${auditIntegrity.checkedCount} sự kiện bảo mật, không phát hiện chỉnh sửa trái phép.`
              : `CẢNH BÁO: Phát hiện sai lệch chuỗi băm tại sự kiện ${auditIntegrity.brokenAtId}!`}
          </Alert>
        )}

        {wafSimResult && (
          <Alert severity={wafSimResult.passed === wafSimResult.totalScenarios ? 'success' : 'warning'} sx={{ mb: 2, fontFamily: MONO_FONT, fontSize: '0.78rem' }}>
            WAF Self-Test: Vượt qua {wafSimResult.passed}/{wafSimResult.totalScenarios} kịch bản tấn công (Path Probe /.env, SQLi Union, Brute-Force, Volumetric Flood).
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {(posture.checks || []).map((chk, idx) => (
            <Box
              key={chk.id}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: chk.status === 'pass' ? 'success.main' : chk.status === 'warn' ? 'warning.main' : 'error.main',
                bgcolor: 'background.default'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <EditorialLabel index={idx + 1}>{chk.id.replace(/_/g, ' ').toUpperCase()}</EditorialLabel>
                <Chip
                  size='small'
                  color={chk.status === 'pass' ? 'success' : chk.status === 'warn' ? 'warning' : 'error'}
                  label={`${chk.earned}/${chk.weight}`}
                  sx={{ fontFamily: MONO_FONT, fontWeight: 700, height: 20 }}
                />
              </Box>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{chk.detail}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 2. Dynamic IP Firewall (Blocklist & Whitelist) */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admWafTitle')}</Typography>
          <Typography variant='caption' color='text.secondary'>{tPrimary('admWafSub')}</Typography>
        </Box>

        <Box
          component='form'
          onSubmit={handleAddRule}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr 1.2fr 1.2fr 2fr auto' }, gap: 1.5, mb: 2, alignItems: 'center' }}
        >
          <TextField
            size='small'
            required
            label={tPrimary('admIpInputLabel')}
            placeholder='203.0.113.42 or 203.0.113.0/24'
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
          />
          <FormControl size='small'>
            <InputLabel>Mode</InputLabel>
            <Select label='Mode' value={modeInput} onChange={(e) => setModeInput(e.target.value)}>
              <MenuItem value='block'>{tPrimary('admIpModeBlock')}</MenuItem>
              <MenuItem value='allow'>{tPrimary('admIpModeAllow')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small'>
            <InputLabel>{tPrimary('admColExpires')}</InputLabel>
            <Select label={tPrimary('admColExpires')} value={durationInput} onChange={(e) => setDurationInput(Number(e.target.value))}>
              <MenuItem value={15}>{tPrimary('admIpDuration15m')}</MenuItem>
              <MenuItem value={60}>{tPrimary('admIpDuration1h')}</MenuItem>
              <MenuItem value={1440}>{tPrimary('admIpDuration24h')}</MenuItem>
              <MenuItem value={0}>{tPrimary('admIpDurationPerm')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size='small'
            label={tPrimary('admIpReasonLabel')}
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
          />
          <Button type='submit' variant='contained' disabled={busy || !ipInput.trim()} sx={{ fontWeight: 800, height: 40 }}>
            {tPrimary('admAddIpRule')}
          </Button>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label={tPrimary('admWafTitle')} sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 840 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 155 }}>{tPrimary('admColIp')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 95 }}>Mode</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 135 }}>{tPrimary('admColRuleSource')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admIpReasonLabel')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 95 }}>{tPrimary('admColHits')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 160 }}>{tPrimary('admColExpires')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 100 }}>{tPrimary('admColActions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ipRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 3, color: 'text.secondary' }}>—</TableCell>
                </TableRow>
              ) : (
                ipRules.map((rule) => (
                  <TableRow key={rule._id || rule.ip} hover>
                    <TableCell component='th' scope='row' sx={{ fontFamily: MONO_FONT, fontWeight: 700, whiteSpace: 'nowrap' }}>{rule.ip}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size='small'
                        color={rule.mode === 'block' ? 'error' : 'success'}
                        label={rule.mode === 'block' ? 'BLOCK' : 'ALLOW'}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {rule.source === 'auto_ban' ? `AUTO (${rule.category || 'ddos'})` : 'MANUAL'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rule.reason || '—'}</TableCell>
                    <TableCell align='right' sx={{ fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{Number(rule.blockedHits || 0)}</TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{formatTime(rule.expiresAtMs || rule.expiresAt)}</TableCell>
                    <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                      <Button
                        size='small'
                        color='error'
                        disabled={busy}
                        onClick={() => onDeleteIpRule(rule._id || rule.ip)}
                        sx={{ fontWeight: 700 }}
                      >
                        {tPrimary('admUnblockIp')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 3. Unified Security & Audit Event Stream (SIEM) */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admSecEventsTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admSecEventsSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size='small' sx={{ minWidth: 130 }}>
              <InputLabel>{tPrimary('admFilterSeverity')}</InputLabel>
              <Select
                label={tPrimary('admFilterSeverity')}
                value={filters.severity}
                onChange={(e) => onChangeFilters({ ...filters, severity: e.target.value })}
              >
                <MenuItem value=''>{tPrimary('admFilterAll')}</MenuItem>
                <MenuItem value='critical'>CRITICAL</MenuItem>
                <MenuItem value='high'>HIGH</MenuItem>
                <MenuItem value='warn'>WARN</MenuItem>
                <MenuItem value='info'>INFO</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 130 }}>
              <InputLabel>{tPrimary('admFilterCategory')}</InputLabel>
              <Select
                label={tPrimary('admFilterCategory')}
                value={filters.category}
                onChange={(e) => onChangeFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value=''>{tPrimary('admFilterAll')}</MenuItem>
                <MenuItem value='ddos'>DDoS / Flood</MenuItem>
                <MenuItem value='scanner'>Scanner / Probe</MenuItem>
                <MenuItem value='waf'>IP Firewall</MenuItem>
                <MenuItem value='auth'>Auth / Audit</MenuItem>
                <MenuItem value='emergency'>Emergency</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label={tPrimary('admSecEventsTitle')} sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 860 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 165 }}>{tPrimary('admColTime')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 100 }}>{tPrimary('admColSeverity')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 190 }}>{tPrimary('admColEvent')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 135 }}>{tPrimary('admColIp')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColMessage')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 3, color: 'text.secondary' }}>—</TableCell>
                </TableRow>
              ) : (
                events.map((ev) => (
                  <TableRow key={ev._id} hover>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(ev.createdAt)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        size='small'
                        color={severityColor(ev.severity)}
                        label={String(ev.severity || 'info').toUpperCase()}
                        sx={{ fontFamily: MONO_FONT, fontWeight: 700, height: 20 }}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row' sx={{ fontFamily: MONO_FONT, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.event}
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{ev.ip || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ev.message}>
                      {ev.message}
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

export default SecurityWafTab
