import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useDispatch, useSelector } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatWeekdayShort } from '~/utils/i18nV5'
import { buildTimelineModel } from '~/utils/timeline'
import { getCardDevProgress, getStatusOption, parseAssigneeList } from '~/utils/excelExporter'
import { getPriorityOption } from '~/utils/crMeta'
import { playUiChime } from '~/utils/soundEffects'

const LABEL_COLUMN_WIDTH = 290
const DAY_MIN_WIDTH = 44
const ROW_HEIGHT = 46

const flattenItems = (columns, groupBy, unassignedLabel) => columns.flatMap(col =>
  (col.cards || [])
    .filter(card => !card.FE_PlaceholderCard)
    .flatMap(card => {
      if (groupBy !== 'owner') return [{ card, columnTitle: col.title }]
      const owners = parseAssigneeList(card.assignee)
      return (owners.length ? owners : [unassignedLabel]).map(owner => ({ card, columnTitle: owner }))
    })
)

function TimelineBar({ row, onOpen, todayLabel }) {
  const { card, bar, deadline } = row
  const status = getStatusOption(card.baStatus)
  const progress = Math.round(getCardDevProgress(card) * 100)
  const isOverdue = deadline.code === 'overdue'

  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
            {card.crCode || 'CR'} • {card.title}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {status.label} • {progress}% • {card.assignee || '—'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: deadline.color }}>
            {deadline.label || todayLabel}
          </Typography>
        </Box>
      }
    >
      <Box
        onClick={() => onOpen(card)}
        sx={{
          position: 'absolute',
          top: 9,
          left: `${bar.startPct}%`,
          width: `${bar.widthPct}%`,
          height: ROW_HEIGHT - 18,
          borderRadius: bar.clippedStart ? '0 999px 999px 0' : '999px',
          cursor: 'pointer',
          overflow: 'hidden',
          bgcolor: `${status.color}38`,
          border: `1.5px ${bar.hasDeadline ? 'solid' : 'dashed'} ${isOverdue ? '#ef4444' : status.color}`,
          boxShadow: isOverdue ? '0 0 0 3px rgba(239, 68, 68, 0.18)' : `0 4px 14px ${status.color}33`,
          transformOrigin: 'left center',
          animation: 'chelloTimelineGrow 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 22px ${status.color}55` }
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, width: `${progress}%`, bgcolor: `${status.color}66`, transition: 'width 0.4s ease' }} />
        <Typography
          variant="caption"
          noWrap
          sx={{ position: 'relative', px: 1.25, lineHeight: `${ROW_HEIGHT - 21}px`, fontWeight: 800, fontSize: '0.7rem', color: 'text.primary', display: 'block' }}
        >
          {progress}%{deadline.shortDate ? ` • ${deadline.shortDate}` : ''}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function TimelineView({ columns = [], themeConfig }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const { tPrimary, lang } = useTranslation()
  const [groupBy, setGroupBy] = useState('topic')

  const model = useMemo(() => buildTimelineModel({
    sprintConfig: board?.sprintConfig,
    items: flattenItems(columns, groupBy, tPrimary('filterUnassigned'))
  }), [board?.sprintConfig, columns, groupBy, tPrimary])

  const handleOpen = (card) => {
    playUiChime('sparkle')
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const gridMinWidth = model.days.length * DAY_MIN_WIDTH

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      mx: 2,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '18px',
      overflow: 'hidden',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.94)'),
      backdropFilter: 'blur(18px) saturate(160%)',
      border: `1px solid ${themeConfig.columnBorder}`,
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
      animation: 'chelloFadeSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5, flexWrap: 'wrap', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {tPrimary('timelineTitle')} — {board?.sprintConfig?.name || 'Sprint'} ({board?.sprintConfig?.startDate} – {board?.sprintConfig?.endDate})
          </Typography>
          <Typography variant="caption" color="text.secondary">{tPrimary('timelineSub')}</Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={groupBy}
          onChange={(e, next) => next && setGroupBy(next)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, px: 1.5, py: 0.4 } }}
        >
          <ToggleButton value="topic">{tPrimary('timelineGroupTopic')}</ToggleButton>
          <ToggleButton value="owner">{tPrimary('timelineGroupOwner')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {model.groups.length === 0 ? (
        <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', p: 4 }}>
          <Typography color="text.secondary" sx={{ fontWeight: 700 }}>{tPrimary('timelineEmpty')}</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `${LABEL_COLUMN_WIDTH}px minmax(${gridMinWidth}px, 1fr)`, minWidth: LABEL_COLUMN_WIDTH + gridMinWidth }}>
            {/* Sticky day header */}
            <Box sx={{ position: 'sticky', top: 0, left: 0, zIndex: 4, bgcolor: 'background.paper', borderBottom: (theme) => `1px solid ${theme.palette.divider}`, px: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>CR</Typography>
            </Box>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 3, display: 'flex', bgcolor: 'background.paper', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
              {model.days.map(d => (
                <Box key={d.ts} sx={{
                  flex: 1,
                  minWidth: DAY_MIN_WIDTH,
                  py: 0.75,
                  textAlign: 'center',
                  bgcolor: d.isToday ? `${themeConfig.accentColor}33` : (d.isWeekend ? 'action.hover' : 'transparent')
                }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: d.isToday ? 900 : 700, lineHeight: 1.1, color: d.isToday ? 'secondary.main' : 'text.primary' }}>
                    {d.day}/{d.month}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary' }}>
                    {d.isToday ? tPrimary('timelineToday') : formatWeekdayShort(d.ts, lang)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {model.groups.map(group => (
              <Box key={group.title} sx={{ display: 'contents' }}>
                <Box sx={{ gridColumn: '1 / -1', position: 'sticky', left: 0, px: 2, py: 0.6, bgcolor: 'action.selected', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.3 }} noWrap>{group.title}</Typography>
                  <Chip size="small" label={group.rows.length} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                </Box>
                {group.rows.map(row => {
                  const priority = getPriorityOption(row.card.priority)
                  return (
                    <Box key={`${group.title}-${row.card._id}`} sx={{ display: 'contents' }}>
                      <Box
                        onClick={() => handleOpen(row.card)}
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          height: ROW_HEIGHT,
                          px: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          cursor: 'pointer',
                          bgcolor: 'background.paper',
                          borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
                          '&:hover .cr-title': { color: 'primary.main' }
                        }}
                      >
                        <Tooltip title={`Priority: ${priority.label}`}><span style={{ fontSize: 13 }}>{priority.icon}</span></Tooltip>
                        <Chip label={row.card.crCode || 'CR'} size="small" sx={{ height: 20, fontFamily: 'monospace', fontWeight: 800, fontSize: '0.68rem', flexShrink: 0 }} />
                        <Typography className="cr-title" variant="body2" noWrap sx={{ fontWeight: 700, minWidth: 0, transition: 'color 0.15s' }}>
                          {row.card.title}
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative', height: ROW_HEIGHT, borderBottom: (theme) => `1px dashed ${theme.palette.divider}` }}>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
                          {model.days.map(d => (
                            <Box key={d.ts} sx={{ flex: 1, minWidth: DAY_MIN_WIDTH, bgcolor: d.isWeekend ? 'action.hover' : 'transparent', borderRight: (theme) => `1px solid ${theme.palette.divider}33` }} />
                          ))}
                        </Box>
                        {model.todayPct !== null && (
                          <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: `${model.todayPct}%`, width: 2, bgcolor: 'secondary.main', opacity: 0.85, zIndex: 1, pointerEvents: 'none' }} />
                        )}
                        <TimelineBar row={row} onOpen={handleOpen} todayLabel={tPrimary('timelineNoDeadline')} />
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default TimelineView
