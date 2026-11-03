import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatBytes, getThreatBadgeMeta } from '../adminUtils'

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 300px auto 380px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

const stickyTableWrapperSx = {
  overflowX: 'auto',
  overflowY: 'auto',
  maxInlineSize: '100%',
  maxBlockSize: 'min(440px, 70vh)',
  containerType: 'inline-size'
}

const stickyHeadCellSx = {
  fontWeight: 800,
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  position: 'sticky',
  insetBlockStart: 0,
  zIndex: 1,
  bgcolor: 'background.paper'
}

const nowrapMonoCellSx = {
  fontFamily: MONO_FONT,
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums'
}

const ellipsisCellSx = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}

function AccessDdosTab({ monitoring, onQuickIpAction, busy }) {
  const { tPrimary, lang } = useTranslation()

  const radar = monitoring?.telemetry?.ddosRadar || {}
  const scanners = radar.scanners || {}
  const topIps = monitoring?.telemetry?.topIps || []
  const topRoutes = monitoring?.telemetry?.topRoutes || []
  const devices = monitoring?.telemetry?.deviceBreakdown || { browsers: [], os: [] }
  const threatMeta = getThreatBadgeMeta(radar.threatLevel)

  const scannerCards = [
    { key: 'httpFlood', label: tPrimary('admScannerFlood'), value: scanners.httpFlood || 0, color: 'warning' },
    { key: 'credentialStuffing', label: tPrimary('admScannerBrute'), value: scanners.credentialStuffing || 0, color: 'error' },
    { key: 'pathScanner', label: tPrimary('admScannerProbe'), value: scanners.pathScanner || 0, color: 'warning' },
    { key: 'csrfBlocked', label: tPrimary('admScannerCsrf'), value: scanners.csrfBlocked || 0, color: 'info' },
    { key: 'ipBlocked', label: tPrimary('admScannerWafDrop'), value: scanners.ipBlocked || 0, color: 'secondary' },
    { key: 'autoBanned', label: tPrimary('admScannerAutoBan'), value: scanners.autoBanned || 0, color: 'error' }
  ]

  return (
    <Box>
      {/* 1. EWMA + Z-Score Anomaly & L7 Scanner Radar */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admDdosRadarTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admDdosRadarSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              color={threatMeta.color}
              label={`${tPrimary(threatMeta.labelKey)} • Z = ${Number(radar.zScore || 0).toFixed(2)}`}
              sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}
            />
            <Chip
              variant='outlined'
              size='small'
              label={`${tPrimary('admBaselineRpm')}: ${Number(radar.baselineRpm || 0)} ± ${Number(radar.stdDevRpm || 1)} RPM`}
              sx={{ fontFamily: MONO_FONT }}
            />
            <Chip
              variant='outlined'
              size='small'
              label={`${tPrimary('admActiveBlocks')}: ${Number(radar.activeBlockRulesCount || 0)} (Auto: ${Number(radar.activeAutoBansCount || 0)})`}
              sx={{ fontFamily: MONO_FONT }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.5 }}>
          {scannerCards.map((item, idx) => (
            <Box
              key={item.key}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: item.value > 0 ? `${item.color}.main` : 'divider',
                bgcolor: 'background.default'
              }}
            >
              <EditorialLabel index={idx + 1}>{item.label}</EditorialLabel>
              <Typography variant='h5' sx={{ mt: 0.75, fontFamily: MONO_FONT, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                {Number(item.value).toLocaleString(lang)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 2. Top Client IPs Access Monitor with Fixed Column Widths & No-Wrap Tabular Numbers */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admTopIpsTitle')}</Typography>
          <Typography variant='caption' color='text.secondary'>{tPrimary('admTopIpsSub')}</Typography>
        </Box>

        <TableContainer tabIndex={0} role='region' aria-label={tPrimary('admTopIpsTitle')} sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 1080 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...stickyHeadCellSx, width: 145 }}>{tPrimary('admColIp')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 130 }}>{tPrimary('admColReq1m15m')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 120 }}>{tPrimary('admColErrors429')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 165 }}>{tPrimary('admColBandwidth')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 145 }}>{tPrimary('admColDevice')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 175 }}>{tPrimary('admColLastRoute')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 95 }}>{tPrimary('admColWafState')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 165 }}>{tPrimary('admColActions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topIps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 3, color: 'text.secondary' }}>—</TableCell>
                </TableRow>
              ) : (
                topIps.map((row) => {
                  const isBlocked = row.firewallStatus === 'block'
                  const isAllowed = row.firewallStatus === 'allow'
                  const deviceLabel = row.deviceName || `${row.browser} / ${row.os}`
                  return (
                    <TableRow key={row.ip} hover>
                      <TableCell component='th' scope='row' sx={{ ...nowrapMonoCellSx, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.ip}
                      </TableCell>
                      <TableCell align='right' sx={nowrapMonoCellSx}>
                        {`${row.requests1m || 0} / ${row.requests15m || 0}`}
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          ...nowrapMonoCellSx,
                          color: (row.errors4xx || row.rateLimited) ? 'warning.main' : 'text.primary'
                        }}
                      >
                        {`${row.errors4xx || 0} / ${row.rateLimited || 0}`}
                      </TableCell>
                      <TableCell align='right' sx={{ ...nowrapMonoCellSx, fontSize: '0.75rem' }}>
                        {`↓${formatBytes(row.bytesIn)} ↑${formatBytes(row.bytesOut)}`}
                      </TableCell>
                      <TableCell sx={{ ...ellipsisCellSx, fontSize: '0.78rem' }}>
                        <Tooltip title={deviceLabel} placement='top'>
                          <span>{deviceLabel}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ ...nowrapMonoCellSx, ...ellipsisCellSx, fontSize: '0.75rem' }}>
                        <Tooltip title={row.lastPath || ''} placement='top'>
                          <span>{row.lastPath}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          size='small'
                          color={isBlocked ? 'error' : isAllowed ? 'success' : 'default'}
                          label={isBlocked ? 'BLOCKED' : isAllowed ? 'ALLOW' : 'NORMAL'}
                          sx={{ fontFamily: MONO_FONT, fontWeight: 700, height: 22 }}
                        />
                      </TableCell>
                      <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75, flexWrap: 'nowrap' }}>
                          {isBlocked ? (
                            <Button
                              size='small'
                              variant='outlined'
                              color='success'
                              disabled={busy}
                              onClick={() => onQuickIpAction({ type: 'unblock', ip: row.ip, ruleId: row.ruleId })}
                              sx={{ fontSize: '0.7rem', py: 0.25, whiteSpace: 'nowrap' }}
                            >
                              {tPrimary('admUnblockIp')}
                            </Button>
                          ) : (
                            <>
                              <Button
                                size='small'
                                variant='outlined'
                                color='error'
                                disabled={busy || row.ip === '127.0.0.1'}
                                onClick={() => onQuickIpAction({ type: 'block', ip: row.ip, durationMinutes: 60 })}
                                sx={{ fontSize: '0.7rem', py: 0.25, whiteSpace: 'nowrap' }}
                              >
                                {tPrimary('admBlockIpNow')}
                              </Button>
                              {!isAllowed && (
                                <Button
                                  size='small'
                                  variant='text'
                                  disabled={busy}
                                  onClick={() => onQuickIpAction({ type: 'allow', ip: row.ip })}
                                  sx={{ fontSize: '0.7rem', py: 0.25, whiteSpace: 'nowrap' }}
                                >
                                  {tPrimary('admWhitelistIp')}
                                </Button>
                              )}
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 3. Top API Endpoints & Device Breakdown */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Box sx={{ ...containmentPanelSx, mb: 0 }}>
          <Typography variant='subtitle1' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admTopRoutesTitle')}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>{tPrimary('admTopRoutesSub')}</Typography>
          <TableContainer tabIndex={0} role='region' aria-label={tPrimary('admTopRoutesTitle')} sx={stickyTableWrapperSx}>
            <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 680 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...stickyHeadCellSx, width: 220 }}>{tPrimary('admColRoute')}</TableCell>
                  <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 95 }}>{tPrimary('admColRequests')}</TableCell>
                  <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 105 }}>{tPrimary('admColErrRate')}</TableCell>
                  <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 115 }}>{tPrimary('admColLatencyP95')}</TableCell>
                  <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 155 }}>{tPrimary('admColBandwidth')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topRoutes.map((r) => (
                  <TableRow key={r.route} hover>
                    <TableCell component='th' scope='row' sx={{ ...nowrapMonoCellSx, ...ellipsisCellSx, fontSize: '0.78rem', fontWeight: 700 }}>
                      <Tooltip title={r.route} placement='top'>
                        <span>{r.route}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align='right' sx={nowrapMonoCellSx}>{r.requests}</TableCell>
                    <TableCell align='right' sx={{ ...nowrapMonoCellSx, color: r.errorRatePct > 5 ? 'error.main' : 'text.primary' }}>
                      {`${r.errorRatePct}%`}
                    </TableCell>
                    <TableCell align='right' sx={nowrapMonoCellSx}>{`${r.avgMs} / ${r.p95Ms}`}</TableCell>
                    <TableCell align='right' sx={{ ...nowrapMonoCellSx, fontSize: '0.75rem' }}>
                      {`↓${formatBytes(r.bytesIn)} ↑${formatBytes(r.bytesOut)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ ...containmentPanelSx, mb: 0 }}>
          <Typography variant='subtitle1' component='h2' sx={{ fontWeight: 800, mb: 1.5 }}>{tPrimary('admDeviceBreakdownTitle')}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Browsers</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {(devices.browsers || []).map((b) => (
              <Chip key={b.name} size='small' label={`${b.name}: ${b.count}`} sx={{ fontFamily: MONO_FONT }} />
            ))}
          </Box>
          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Operating Systems</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(devices.os || []).map((o) => (
              <Chip key={o.name} size='small' variant='outlined' label={`${o.name}: ${o.count}`} sx={{ fontFamily: MONO_FONT }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default AccessDdosTab
