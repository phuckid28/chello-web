import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { buildHeatmap, HEATMAP_LEVELS } from '~/utils/heatmap'

const CELL_SIZE = 12
const CELL_GAP = 3

const getLevelBg = (level, accentColor, isDark) => {
  if (!level || level <= 0) {
    return isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.22)'
  }
  const opacities = [0, 0.28, 0.5, 0.75, 1]
  return alpha(accentColor || '#38bdf8', opacities[level] || 0.28)
}

const formatMonthShort = (monthIndex, lang) => {
  try {
    return new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' })
      .format(new Date(Date.UTC(2024, monthIndex, 1)))
  } catch {
    return String(monthIndex + 1)
  }
}

function ProfileHeatmap({ heatmap }) {
  const { themeConfig } = usePersonaTheme()
  const { t, formatMessage, lang } = useTranslation()

  const isHidden = !heatmap || heatmap.hidden || !Array.isArray(heatmap.days)
  const grid = useMemo(
    () => (isHidden ? null : buildHeatmap({ days: heatmap.days })),
    [isHidden, heatmap]
  )

  return (
    <Box component='section' sx={{ ...surfaceSx, p: { xs: 2.25, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2
        }}
      >
        <Box>
          <EditorialLabel index={3}>{t('profHeatmapTitle')}</EditorialLabel>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mt: 0.5 }}>
            {grid ? formatMessage('profHeatmapSummary', { total: grid.total }) : t('profHeatmapTitle')}
          </Typography>
        </Box>
        {grid && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ fontFamily: MONO_FONT, fontWeight: 600, alignSelf: 'center' }}
          >
            {formatMessage('profHeatmapStreaks', {
              longest: grid.longestStreak,
              current: grid.currentStreak
            })}
          </Typography>
        )}
      </Box>

      {isHidden ? (
        <Typography variant='body2' color='text.secondary'>
          {t('profHeatmapHidden')}
        </Typography>
      ) : (
        <>
          <Box sx={{ overflowX: 'auto', pb: 1 }}>
            <Box sx={{ minWidth: 53 * (CELL_SIZE + CELL_GAP) }}>
              <Box sx={{ position: 'relative', height: 18, mb: 0.5 }}>
                {grid.monthLabels.map((m) => (
                  <Typography
                    key={`${m.weekIndex}-${m.month}`}
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      position: 'absolute',
                      left: m.weekIndex * (CELL_SIZE + CELL_GAP),
                      fontSize: '0.68rem',
                      fontFamily: MONO_FONT
                    }}
                  >
                    {formatMonthShort(m.month, lang)}
                  </Typography>
                ))}
              </Box>

              <Box
                role='grid'
                aria-label={t('profHeatmapTitle')}
                sx={{ display: 'flex', gap: `${CELL_GAP}px` }}
              >
                {grid.weeks.map((week, wIdx) => (
                  <Box
                    key={wIdx}
                    role='row'
                    sx={{ display: 'flex', flexDirection: 'column', gap: `${CELL_GAP}px` }}
                  >
                    {week.map((cell, dIdx) => {
                      if (!cell) {
                        return (
                          <Box
                            key={dIdx}
                            sx={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: '3px' }}
                          />
                        )
                      }
                      const label = formatMessage('profHeatmapCell', {
                        count: cell.count,
                        date: cell.date
                      })
                      return (
                        <Tooltip key={cell.date} title={label} arrow>
                          <Box
                            role='gridcell'
                            tabIndex={0}
                            aria-label={label}
                            sx={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              borderRadius: '3px',
                              bgcolor: (theme) => getLevelBg(
                                cell.level,
                                themeConfig.accentColor,
                                theme.palette.mode === 'dark'
                              ),
                              outline: 'none',
                              '&:focus-visible': {
                                boxShadow: `0 0 0 2px ${themeConfig.accentColor}`
                              }
                            }}
                          />
                        </Tooltip>
                      )
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mt: 1.5
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              {t('profHeatmapKeyboardHint')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.72rem' }}>
                {t('profHeatmapLess')}
              </Typography>
              {HEATMAP_LEVELS.map((lvl) => (
                <Box
                  key={lvl}
                  sx={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: '3px',
                    bgcolor: (theme) => getLevelBg(
                      lvl,
                      themeConfig.accentColor,
                      theme.palette.mode === 'dark'
                    )
                  }}
                />
              ))}
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.72rem' }}>
                {t('profHeatmapMore')}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export default ProfileHeatmap
