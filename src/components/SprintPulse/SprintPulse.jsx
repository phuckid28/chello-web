import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatMessage } from '~/utils/i18nV5'
import { HEALTH_LEVELS, computeSprintHealth } from '~/utils/sprintHealth'
import { getProgressColor } from '~/utils/progress'

const LEVEL_STYLE = {
  [HEALTH_LEVELS.ON_TRACK]: { key: 'pulseLevelOnTrack', color: '#10b981', icon: '🟢' },
  [HEALTH_LEVELS.AT_RISK]: { key: 'pulseLevelAtRisk', color: '#f59e0b', icon: '🟡' },
  [HEALTH_LEVELS.BEHIND]: { key: 'pulseLevelBehind', color: '#ef4444', icon: '🔴' },
  [HEALTH_LEVELS.NOT_STARTED]: { key: 'pulseLevelNotStarted', color: '#94a3b8', icon: '⚪' },
  [HEALTH_LEVELS.COMPLETED]: { key: 'pulseLevelCompleted', color: '#38bdf8', icon: '🏁' },
  [HEALTH_LEVELS.NO_DATA]: { key: 'pulseLevelNoData', color: '#94a3b8', icon: '📭' }
}

const BAR_MAX_HEIGHT = 54
const toPercent = (ratio) => Math.round(ratio * 100)

function Stat({ label, value, color }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }} noWrap>{label}</Typography>
      <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: color || 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
    </Box>
  )
}

function DueLoadBars({ dueLoad, accent, t }) {
  const peak = Math.max(1, ...dueLoad.map(d => d.count))
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: BAR_MAX_HEIGHT + 22 }}>
      {dueLoad.map((d, idx) => {
        const height = d.count === 0 ? 3 : Math.max(8, (d.count / peak) * BAR_MAX_HEIGHT)
        const doneHeight = d.count === 0 ? 0 : (d.done / d.count) * height
        const label = formatMessage(t('pulseDueCount'), { count: d.count, done: d.done })
        return (
          <Tooltip key={d.ts} title={`${d.day}/${new Date(d.ts).getMonth() + 1} • ${label}`} arrow>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 0.35 }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 22,
                  height,
                  borderRadius: '5px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  bgcolor: d.count === 0 ? 'action.hover' : `${accent}55`,
                  outline: d.isToday ? `2px solid ${accent}` : 'none',
                  boxShadow: d.isToday ? `0 0 12px ${accent}` : 'none',
                  transformOrigin: 'bottom',
                  animation: `fxBarGrow 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.025}s backwards`,
                  transition: 'transform 0.18s ease',
                  '&:hover': { transform: 'scaleY(1.08)' }
                }}
              >
                <Box sx={{ height: doneHeight, bgcolor: '#10b981' }} />
              </Box>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: d.isToday ? 900 : 600, color: d.isToday ? accent : 'text.secondary', lineHeight: 1 }}>
                {d.day}
              </Typography>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}

function SprintPulse({ columns = [], sprintConfig, themeConfig, sx }) {
  const { t } = useTranslation()
  const health = useMemo(() => {
    const cards = columns.flatMap(col => (col.cards || []).filter(card => !card.FE_PlaceholderCard))
    return computeSprintHealth({ cards, sprintConfig })
  }, [columns, sprintConfig])

  const style = LEVEL_STYLE[health.level] || LEVEL_STYLE[HEALTH_LEVELS.NO_DATA]
  const actual = toPercent(health.actualRatio)
  const expected = toPercent(health.elapsedRatio)
  const accent = themeConfig?.accentColor || '#38bdf8'

  return (
    <Card
      sx={{
        borderRadius: '16px',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)'),
        backdropFilter: 'blur(18px) saturate(160%)',
        border: `1px solid ${themeConfig?.columnBorder || 'rgba(148,163,184,0.3)'}`,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
        animation: 'chelloFadeSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        ...sx
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonitorHeartRoundedIcon sx={{ color: accent }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{t('pulseTitle')}</Typography>
              <Typography variant="caption" color="text.secondary">{t('pulseSub')}</Typography>
            </Box>
          </Box>
          <Chip
            label={`${style.icon} ${t(style.key)}`}
            size="small"
            sx={{ fontWeight: 800, color: style.color, bgcolor: `${style.color}1f`, border: `1px solid ${style.color}66` }}
          />
        </Box>

        <Box sx={{ position: 'relative', height: 14, borderRadius: 7, bgcolor: 'action.hover', mb: 0.75 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: `${actual}%`,
              borderRadius: 7,
              background: `linear-gradient(90deg, ${getProgressColor(0.3)}, ${getProgressColor(actual / 100)})`,
              transformOrigin: 'left',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
          {health.dayCount > 0 && (
            <Tooltip title={`${t('pulseExpected')}: ${expected}%`} arrow>
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  bottom: -4,
                  left: `calc(${expected}% - 1px)`,
                  width: 3,
                  borderRadius: 2,
                  bgcolor: accent,
                  boxShadow: `0 0 8px ${accent}`,
                  transition: 'left 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 1.5, mb: 2 }}>
          <Stat label={t('pulseActual')} value={`${actual}%`} color={getProgressColor(actual / 100)} />
          <Stat label={t('pulseExpected')} value={`${expected}%`} color={accent} />
          {health.daysLeft !== null && (
            <Stat label={health.dayIndex > 0 ? formatMessage(t('pulseDayOf'), { day: health.dayIndex, total: health.dayCount }) : t('pulseLevelNotStarted')} value={formatMessage(t('pulseDaysLeft'), { n: health.daysLeft })} />
          )}
          <Stat
            label="CR"
            value={health.overdueCount > 0 ? formatMessage(t('pulseOverdue'), { n: health.overdueCount }) : t('pulseNoOverdue')}
            color={health.overdueCount > 0 ? '#ef4444' : '#10b981'}
          />
        </Box>

        {health.dueLoad.length > 0 && (
          <>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.75 }}>
              {t('pulseDeadlineLoad')}
            </Typography>
            <DueLoadBars dueLoad={health.dueLoad} accent={accent} t={t} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default SprintPulse
