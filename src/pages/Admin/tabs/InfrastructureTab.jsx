import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatUptime } from '../adminUtils'

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 300px auto 280px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

function InfrastructureTab({ monitoring }) {
  const { tPrimary, lang } = useTranslation()

  const runtime = monitoring?.infrastructure?.runtime || {}
  const memory = runtime.memory || {}
  const eventLoop = runtime.eventLoop || {}
  const proc = runtime.process || {}
  const database = monitoring?.infrastructure?.database || {}
  const collections = database.collections || {}
  const integrations = monitoring?.infrastructure?.integrations || {}

  const resourceGauges = [
    {
      key: 'cpu',
      label: tPrimary('admCpuUsage'),
      value: `${Number(runtime.cpuPercent || 0)}%`,
      pct: Math.min(100, Number(runtime.cpuPercent || 0)),
      sub: `Cores: ${runtime.cpuCores || 1} • LoadAvg: ${(runtime.loadAvg || [0, 0, 0]).join(' / ')}`
    },
    {
      key: 'heap',
      label: tPrimary('admMemoryHeap'),
      value: `${memory.heapUsedMB || 0} / ${memory.heapTotalMB || 0} MB`,
      pct: Math.min(100, Number(memory.heapUsedPct || 0)),
      sub: `Heap Used: ${memory.heapUsedPct || 0}% • External: ${memory.externalMB || 0} MB`
    },
    {
      key: 'rss',
      label: tPrimary('admMemoryRss'),
      value: `${memory.rssMB || 0} MB`,
      pct: Math.min(100, Number(memory.systemMemoryUsedPct || 0)),
      sub: `OS Free: ${memory.systemFreeMB || 0} / ${memory.systemTotalMB || 0} MB (${memory.systemMemoryUsedPct || 0}%)`
    },
    {
      key: 'eventLoop',
      label: tPrimary('admEventLoopP99'),
      value: `${eventLoop.delayP99Ms || 0} ms`,
      pct: Math.min(100, Number(eventLoop.utilizationPct || 0)),
      sub: `p50: ${eventLoop.delayP50Ms || 0}ms • p95: ${eventLoop.delayP95Ms || 0}ms • ELU: ${eventLoop.utilizationPct || 0}%`
    }
  ]

  const integrationItems = [
    {
      key: 'gemini',
      name: 'Google Gemini AI',
      configured: Boolean(integrations.gemini?.configured),
      detail: integrations.gemini?.defaultModel || 'gemini-3.5-flash-lite'
    },
    {
      key: 'drive',
      name: 'Google Drive Vault Bridge',
      configured: Boolean(integrations.googleDrive?.configured),
      detail: 'Apps Script WebApp Bridge'
    },
    {
      key: 'telegram',
      name: 'Telegram Bot Channel',
      configured: Boolean(integrations.telegram?.configured),
      detail: 'Webhook Notification Bridge'
    }
  ]

  return (
    <Box>
      {/* 1. Node.js Runtime & OS Telemetry (USE Metrics) */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admInfraRuntimeTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admInfraRuntimeSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size='small' label={`Uptime: ${formatUptime(proc.uptimeSeconds || 0)}`} sx={{ fontFamily: MONO_FONT, fontWeight: 700 }} />
            <Chip size='small' variant='outlined' label={`Node ${proc.nodeVersion || ''} • PID ${proc.pid || ''}`} sx={{ fontFamily: MONO_FONT }} />
            <Chip size='small' variant='outlined' label={proc.platform || 'Server'} sx={{ fontFamily: MONO_FONT }} />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
          {resourceGauges.map((g, idx) => (
            <Box key={g.key} sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <EditorialLabel index={idx + 1}>{g.label}</EditorialLabel>
                <Typography variant='h6' sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}>{g.value}</Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={g.pct}
                color={g.pct > 85 ? 'error' : g.pct > 65 ? 'warning' : 'primary'}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>{g.sub}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 2. MongoDB Atlas Health & Collection Stats */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admInfraDbTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admInfraDbSub')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              size='small'
              color={database.status === 'healthy' ? 'success' : 'error'}
              label={String(database.status || 'healthy').toUpperCase()}
              sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}
            />
            <Chip
              size='small'
              variant='outlined'
              label={`${tPrimary('admDbPing')}: ${database.pingMs || 0} ms`}
              sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
          {Object.entries(collections).map(([colName, count], idx) => (
            <Box key={colName} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <EditorialLabel index={idx + 1}>{colName}</EditorialLabel>
              <Typography variant='h5' sx={{ mt: 0.75, fontFamily: MONO_FONT, fontWeight: 800 }}>
                {Number(count || 0).toLocaleString(lang)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 3. External Integrations Health */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mb: 2 }}>{tPrimary('admInfraIntegrationsTitle')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {integrationItems.map((item, idx) => (
            <Box key={item.key} sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <EditorialLabel index={idx + 1}>{item.name}</EditorialLabel>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5, fontFamily: MONO_FONT }}>
                  {item.detail}
                </Typography>
              </Box>
              <Chip
                size='small'
                color={item.configured ? 'success' : 'default'}
                label={item.configured ? 'READY' : 'UNCONFIGURED'}
                sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default InfrastructureTab
