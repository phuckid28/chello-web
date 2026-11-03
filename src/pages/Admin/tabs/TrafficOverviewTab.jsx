import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import {
  formatBytes,
  buildDualLineChart,
  buildStackedStatusChart,
  buildSignupChart
} from '../adminUtils'

const CHART_OPTS = { width: 720, height: 190, padding: { top: 16, right: 16, bottom: 28, left: 48 } }
const SR_ONLY = { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 300px auto 320px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

function TrafficOverviewTab({ stats, monitoring }) {
  const { tPrimary, formatMessage, lang } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const summary = monitoring?.telemetry?.summary || {}
  const trafficSeries = monitoring?.telemetry?.trafficSeries || []
  const latency = summary.latency || {}

  const inOutChart = buildDualLineChart(trafficSeries, {
    ...CHART_OPTS,
    keyA: 'bytesIn',
    keyB: 'bytesOut'
  })
  const statusChart = buildStackedStatusChart(trafficSeries, CHART_OPTS)
  const latencyChart = buildDualLineChart(trafficSeries, {
    ...CHART_OPTS,
    keyA: 'p50',
    keyB: 'p95'
  })
  const signupChart = buildSignupChart(stats?.signups, CHART_OPTS)
  const totalSignups = signupChart.bars.reduce((sum, b) => sum + b.count, 0)

  const kpiCards = [
    {
      key: 'rpm',
      label: tPrimary('admKpiRpm'),
      value: `${Number(summary.rpm || 0).toLocaleString(lang)} RPM`,
      sub: `${Number(summary.rps || 0)} req/s • 60m: ${Number(summary.totalRequests60m || 0).toLocaleString(lang)}`
    },
    {
      key: 'bandwidth',
      label: tPrimary('admKpiBandwidth'),
      value: `↓ ${formatBytes(summary.bytesInPerSec || 0)}/s • ↑ ${formatBytes(summary.bytesOutPerSec || 0)}/s`,
      sub: `60m In: ${formatBytes(summary.totalBytesIn60m || 0)} • Out: ${formatBytes(summary.totalBytesOut60m || 0)}`
    },
    {
      key: 'errRate',
      label: tPrimary('admKpiErrorRate'),
      value: `${Number(summary.errorRatePct || 0)}%`,
      sub: `429 Drops (60m): ${Number(summary.rateLimited60m || 0)}`
    },
    {
      key: 'latency',
      label: tPrimary('admKpiLatency'),
      value: `${Number(latency.p95 || 0)} ms`,
      sub: `p50: ${Number(latency.p50 || 0)} ms • p99: ${Number(latency.p99 || 0)} ms`
    },
    {
      key: 'users',
      label: tPrimary('admStatUsers'),
      value: Number(stats?.users ?? 0).toLocaleString(lang),
      sub: `${tPrimary('admStatActive7d')}: ${Number(stats?.activeUsers7d ?? 0).toLocaleString(lang)}`
    },
    {
      key: 'workspaces',
      label: tPrimary('admStatWorkspaces'),
      value: Number(stats?.workspaces ?? 0).toLocaleString(lang),
      sub: `${tPrimary('admStatBoards')}: ${Number(stats?.boards ?? 0).toLocaleString(lang)}`
    }
  ]

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {kpiCards.map((item, idx) => (
          <Box key={item.key} sx={surfaceSx}>
            <EditorialLabel index={idx + 1}>{item.label}</EditorialLabel>
            <Typography variant='h5' sx={{ mt: 1, fontFamily: MONO_FONT, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {item.value}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
              {item.sub}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 1. Dual-Series Bytes In vs Bytes Out SVG Chart */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admChartInOutTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admChartInOutSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size='small' label={`↓ ${tPrimary('admBytesIn')}: ${formatBytes(summary.totalBytesIn60m || 0)}`} sx={{ fontFamily: MONO_FONT, fontWeight: 700, borderColor: '#06b6d4', color: '#06b6d4' }} variant='outlined' />
            <Chip size='small' label={`↑ ${tPrimary('admBytesOut')}: ${formatBytes(summary.totalBytesOut60m || 0)}`} sx={{ fontFamily: MONO_FONT, fontWeight: 700, borderColor: themeConfig.accentColor, color: themeConfig.accentColor }} variant='outlined' />
          </Box>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box
            component='svg'
            role='img'
            aria-label={tPrimary('admChartInOutTitle')}
            viewBox={`0 0 ${CHART_OPTS.width} ${CHART_OPTS.height}`}
            sx={{ width: '100%', height: 'auto', maxHeight: 210, display: 'block' }}
          >
            {inOutChart.tickLines.map((tick) => (
              <g key={tick.value}>
                <line x1={CHART_OPTS.padding.left} x2={CHART_OPTS.width - CHART_OPTS.padding.right} y1={tick.y} y2={tick.y} stroke='currentColor' strokeOpacity={0.14} strokeDasharray='3 3' />
                <text x={CHART_OPTS.padding.left - 6} y={tick.y + 4} textAnchor='end' fontSize='9' fill='currentColor' opacity={0.65}>
                  {formatBytes(tick.value)}
                </text>
              </g>
            ))}
            {inOutChart.areaB && <path d={inOutChart.areaB} fill={themeConfig.accentColor} fillOpacity={0.14} />}
            {inOutChart.areaA && <path d={inOutChart.areaA} fill='#06b6d4' fillOpacity={0.18} />}
            {inOutChart.pathB && <path d={inOutChart.pathB} fill='none' stroke={themeConfig.accentColor} strokeWidth={2} />}
            {inOutChart.pathA && <path d={inOutChart.pathA} fill='none' stroke='#06b6d4' strokeWidth={2} />}
            {inOutChart.points.map((pt) => (
              pt.showLabel && (
                <text key={pt.label} x={pt.x} y={CHART_OPTS.height - 8} textAnchor='middle' fontSize='9' fill='currentColor' opacity={0.7}>
                  {pt.label}
                </text>
              )
            ))}
          </Box>
        </Box>
      </Box>

      {/* 2. Stacked HTTP Status Breakdown SVG Chart */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admChartStatusTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admChartStatusSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {statusChart.legend.map((lg) => (
              <Box key={lg.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: lg.color }} />
                <Typography variant='caption' sx={{ fontFamily: MONO_FONT, fontSize: '0.7rem' }}>{lg.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box
            component='svg'
            role='img'
            aria-label={tPrimary('admChartStatusTitle')}
            viewBox={`0 0 ${CHART_OPTS.width} ${CHART_OPTS.height}`}
            sx={{ width: '100%', height: 'auto', maxHeight: 210, display: 'block' }}
          >
            {statusChart.tickLines.map((tick) => (
              <g key={tick.value}>
                <line x1={CHART_OPTS.padding.left} x2={CHART_OPTS.width - CHART_OPTS.padding.right} y1={tick.y} y2={tick.y} stroke='currentColor' strokeOpacity={0.14} strokeDasharray='3 3' />
                <text x={CHART_OPTS.padding.left - 6} y={tick.y + 4} textAnchor='end' fontSize='9' fill='currentColor' opacity={0.65}>{tick.value}</text>
              </g>
            ))}
            {statusChart.columns.map((col) => (
              <g key={col.label}>
                {col.segments.map((seg) => (
                  <rect key={seg.key} x={seg.x} y={seg.y} width={seg.width} height={Math.max(0, seg.height)} fill={seg.color}>
                    <title>{`${col.label} — ${seg.label}: ${seg.count}`}</title>
                  </rect>
                ))}
                {col.showLabel && (
                  <text x={col.x + col.width / 2} y={CHART_OPTS.height - 8} textAnchor='middle' fontSize='9' fill='currentColor' opacity={0.7}>
                    {col.label}
                  </text>
                )}
              </g>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 3. Response Latency Percentiles (p50 vs p95) & 14-Day Signups */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        <Box sx={{ ...containmentPanelSx, mb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            <Box>
              <Typography variant='subtitle1' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admChartLatencyTitle')}</Typography>
              <Typography variant='caption' color='text.secondary'>{tPrimary('admChartLatencySub')}</Typography>
            </Box>
            <Chip size='small' label={`p50: ${latency.p50 || 0}ms / p95: ${latency.p95 || 0}ms`} sx={{ fontFamily: MONO_FONT, fontWeight: 700 }} />
          </Box>
          <Box
            component='svg'
            role='img'
            aria-label={tPrimary('admChartLatencyTitle')}
            viewBox={`0 0 ${CHART_OPTS.width} ${CHART_OPTS.height}`}
            sx={{ width: '100%', height: 'auto', maxHeight: 190, display: 'block' }}
          >
            {latencyChart.tickLines.map((tick) => (
              <g key={tick.value}>
                <line x1={CHART_OPTS.padding.left} x2={CHART_OPTS.width - CHART_OPTS.padding.right} y1={tick.y} y2={tick.y} stroke='currentColor' strokeOpacity={0.14} strokeDasharray='3 3' />
                <text x={CHART_OPTS.padding.left - 6} y={tick.y + 4} textAnchor='end' fontSize='9' fill='currentColor' opacity={0.65}>{`${tick.value}ms`}</text>
              </g>
            ))}
            {latencyChart.pathB && <path d={latencyChart.pathB} fill='none' stroke='#f59e0b' strokeWidth={2} />}
            {latencyChart.pathA && <path d={latencyChart.pathA} fill='none' stroke='#10b981' strokeWidth={2} />}
          </Box>
        </Box>

        <Box sx={{ ...containmentPanelSx, mb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
            <Box>
              <Typography variant='subtitle1' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admSignupsTitle')}</Typography>
              <Typography variant='caption' color='text.secondary'>{tPrimary('admSignupsSub')}</Typography>
            </Box>
            <Chip size='small' label={formatMessage('admSignupsTotal', { count: totalSignups })} sx={{ fontFamily: MONO_FONT, fontWeight: 700 }} />
          </Box>
          {signupChart.bars.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>{tPrimary('admSignupsEmpty')}</Typography>
          ) : (
            <Box>
              <Box
                component='svg'
                role='img'
                aria-label={tPrimary('admChartLabel')}
                viewBox={`0 0 ${CHART_OPTS.width} ${CHART_OPTS.height}`}
                sx={{ width: '100%', height: 'auto', maxHeight: 190, display: 'block' }}
              >
                {signupChart.tickLines.map((tick) => (
                  <g key={tick.value}>
                    <line x1={CHART_OPTS.padding.left} x2={CHART_OPTS.width - CHART_OPTS.padding.right} y1={tick.y} y2={tick.y} stroke='currentColor' strokeOpacity={0.14} strokeDasharray='3 3' />
                    <text x={CHART_OPTS.padding.left - 6} y={tick.y + 4} textAnchor='end' fontSize='9' fill='currentColor' opacity={0.65}>{tick.value}</text>
                  </g>
                ))}
                {signupChart.bars.map((bar) => (
                  <g key={bar.date}>
                    <rect x={bar.x} y={bar.y} width={Math.max(2, bar.width)} height={Math.max(0, bar.height)} rx={3} fill={themeConfig.accentColor}>
                      <title>{formatMessage('admSignupsTooltip', { date: bar.date, count: bar.count })}</title>
                    </rect>
                    {bar.showLabel && (
                      <text x={bar.x + bar.width / 2} y={CHART_OPTS.height - 8} textAnchor='middle' fontSize='9' fill='currentColor' opacity={0.7}>
                        {bar.date.slice(5)}
                      </text>
                    )}
                  </g>
                ))}
              </Box>
              <Box component='table' sx={SR_ONLY}>
                <caption>{tPrimary('admChartLabel')}</caption>
                <thead>
                  <tr><th scope='col'>{tPrimary('admColDate')}</th><th scope='col'>{tPrimary('admColCount')}</th></tr>
                </thead>
                <tbody>
                  {signupChart.bars.map((bar) => (
                    <tr key={bar.date}><td>{bar.date}</td><td>{bar.count}</td></tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default TrafficOverviewTab
