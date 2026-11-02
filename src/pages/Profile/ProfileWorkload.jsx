import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import RelativeTime from '~/pages/Settings/components/RelativeTime'
import { formatDate } from '~/pages/Settings/utils/format'

const PRIORITY_KEY_MAP = {
  highest: 'profPriorityHighest',
  high: 'profPriorityHigh',
  medium: 'profPriorityMedium',
  low: 'profPriorityLow',
  lowest: 'profPriorityLowest'
}

const PRIORITY_COLOR_MAP = {
  highest: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
  lowest: 'default'
}

const VERB_KEY_MAP = {
  'card.created': 'profVerbCardCreated',
  card_created: 'profVerbCardCreated',
  cardCreated: 'profVerbCardCreated',
  'card.updated': 'profVerbCardUpdated',
  card_updated: 'profVerbCardUpdated',
  cardUpdated: 'profVerbCardUpdated',
  'card.moved': 'profVerbCardMoved',
  card_moved: 'profVerbCardMoved',
  cardMoved: 'profVerbCardMoved',
  'card.status_changed': 'profVerbCardStatusChanged',
  card_status_changed: 'profVerbCardStatusChanged',
  cardStatusChanged: 'profVerbCardStatusChanged',
  'card.completed': 'profVerbCardCompleted',
  card_completed: 'profVerbCardCompleted',
  cardCompleted: 'profVerbCardCompleted',
  'comment.added': 'profVerbCommentAdded',
  comment_added: 'profVerbCommentAdded',
  commentAdded: 'profVerbCommentAdded',
  'wiki.created': 'profVerbWikiCreated',
  wiki_created: 'profVerbWikiCreated',
  wikiCreated: 'profVerbWikiCreated',
  'wiki.updated': 'profVerbWikiUpdated',
  wiki_updated: 'profVerbWikiUpdated',
  wikiUpdated: 'profVerbWikiUpdated',
  'board.created': 'profVerbBoardCreated',
  board_created: 'profVerbBoardCreated',
  boardCreated: 'profVerbBoardCreated',
  'member.added': 'profVerbMemberAdded',
  member_added: 'profVerbMemberAdded',
  memberAdded: 'profVerbMemberAdded',
  'role.changed': 'profVerbRoleChanged',
  role_changed: 'profVerbRoleChanged',
  roleChanged: 'profVerbRoleChanged'
}

const resolveActivityMessage = (item, formatMessage) => {
  const rawType = item?.type || item?.action || item?.verb || ''
  const verbKey = VERB_KEY_MAP[rawType] || 'profVerbUnknown'
  const meta = item?.meta || {}
  const title = meta.title || item?.title || item?.targetTitle || '—'
  const from = meta.from || item?.from || ''
  const to = meta.to || item?.to || ''
  return formatMessage(verbKey, { title, from, to })
}

function ProfileWorkload({
  workload,
  activityItems,
  activityHidden,
  nextCursor,
  loadingMore,
  onLoadMore
}) {
  const { t, tPrimary, formatMessage, lang } = useTranslation()

  const workloadHidden = !workload || workload.hidden
  const activeCrs = Array.isArray(workload?.active)
    ? workload.active
    : (Array.isArray(workload?.activeCrs) ? workload.activeCrs : [])
  const sprints = Array.isArray(workload?.bySprint)
    ? workload.bySprint
    : (Array.isArray(workload?.sprints) ? workload.sprints : [])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box component='section' sx={{ ...surfaceSx, p: { xs: 2.25, md: 3 }, height: '100%' }}>
          <EditorialLabel index={4}>{t('profWorkloadTitle')}</EditorialLabel>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mt: 0.5, mb: 2 }}>
            {t('profWorkloadTitle')}
          </Typography>

          {workloadHidden ? (
            <Typography variant='body2' color='text.secondary'>
              {t('profWorkloadHidden')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 1.25 }}>
                  {t('profWorkloadActive')}
                </Typography>
                {activeCrs.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    {t('profWorkloadEmpty')}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    {activeCrs.map((item, idx) => {
                      const cardId = item.cardId || item._id
                      const crPath = item.boardId && cardId
                        ? `/boards/${item.boardId}/cr/${cardId}`
                        : (item.boardId ? `/boards/${item.boardId}` : null)
                      const code = item.ticketId || item.crCode || item.code
                      const priorityKey = PRIORITY_KEY_MAP[String(item.priority || '').toLowerCase()]
                      const priorityColor = PRIORITY_COLOR_MAP[String(item.priority || '').toLowerCase()] || 'default'
                      const progress = typeof item.progress === 'number'
                        ? Math.max(0, Math.min(100, Math.round(item.progress)))
                        : null

                      return (
                        <Box
                          key={cardId || idx}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                              {code && (
                                <Typography
                                  variant='caption'
                                  sx={{ fontFamily: MONO_FONT, fontWeight: 700, color: 'text.secondary' }}
                                >
                                  {code}
                                </Typography>
                              )}
                              <Typography
                                variant='body2'
                                component={crPath ? RouterLink : 'span'}
                                to={crPath || undefined}
                                noWrap
                                sx={{
                                  fontWeight: 700,
                                  color: 'text.primary',
                                  textDecoration: 'none',
                                  '&:hover': crPath ? { textDecoration: 'underline' } : undefined
                                }}
                              >
                                {item.title || '—'}
                              </Typography>
                            </Box>
                            {priorityKey && (
                              <Chip
                                size='small'
                                color={priorityColor}
                                variant='outlined'
                                label={tPrimary(priorityKey)}
                                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {item.boardTitle || ''}
                            </Typography>
                            {item.dueDate && (
                              <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
                                {formatMessage('profWorkloadDue', { date: formatDate(item.dueDate, lang) || item.dueDate })}
                              </Typography>
                            )}
                          </Box>

                          {progress !== null && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <LinearProgress
                                variant='determinate'
                                value={progress}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant='caption' sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}>
                                {progress}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 1.25 }}>
                  {t('profWorkloadSprints')}
                </Typography>
                {sprints.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    {t('profWorkloadSprintsEmpty')}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {sprints.map((sp, idx) => {
                      const points = Number(sp.storyPoints ?? sp.points ?? 0)
                      const capacity = Number(sp.capacity ?? 0)
                      const hasCap = Number.isFinite(capacity) && capacity > 0
                      const overCap = hasCap && points > capacity
                      const pct = hasCap ? Math.min(100, Math.round((points / capacity) * 100)) : 0

                      return (
                        <Box key={sp.sprintId || sp.boardId || idx}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                            <Typography variant='body2' sx={{ fontWeight: 700 }} noWrap>
                              {sp.sprintName || sp.boardTitle || sp.title || `Sprint ${idx + 1}`}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant='caption' sx={{ fontFamily: MONO_FONT, fontWeight: 700 }}>
                                {hasCap
                                  ? formatMessage('profWorkloadCapacity', { points, capacity })
                                  : formatMessage('profWorkloadNoCapacity', { points })}
                              </Typography>
                              {overCap && (
                                <Chip
                                  size='small'
                                  color='warning'
                                  label={tPrimary('profWorkloadOver')}
                                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                />
                              )}
                            </Box>
                          </Box>
                          {hasCap && (
                            <LinearProgress
                              variant='determinate'
                              color={overCap ? 'warning' : 'primary'}
                              value={pct}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box component='section' sx={{ ...surfaceSx, p: { xs: 2.25, md: 3 }, height: '100%' }}>
          <EditorialLabel index={5}>{t('profActivityTitle')}</EditorialLabel>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mt: 0.5, mb: 2 }}>
            {t('profActivityTitle')}
          </Typography>

          {activityHidden ? (
            <Typography variant='body2' color='text.secondary'>
              {t('profActivityHidden')}
            </Typography>
          ) : (!activityItems || activityItems.length === 0) ? (
            <Typography variant='body2' color='text.secondary'>
              {t('profActivityEmpty')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {activityItems.map((item, idx) => {
                const timestamp = item.createdAt || item.timestamp
                return (
                  <Box
                    key={item._id || item.id || idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      pb: 1.25,
                      borderBottom: (theme) => (
                        idx < activityItems.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                      )
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {resolveActivityMessage(item, formatMessage)}
                    </Typography>
                    {timestamp && (
                      <RelativeTime
                        value={timestamp}
                        sx={{
                          fontFamily: MONO_FONT,
                          fontSize: '0.72rem',
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      />
                    )}
                  </Box>
                )
              })}

              <Box sx={{ pt: 1, display: 'flex', justifyContent: 'center' }}>
                {nextCursor ? (
                  <Button
                    variant='outlined'
                    size='small'
                    disabled={loadingMore}
                    onClick={onLoadMore}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {loadingMore ? t('v7Loading') : t('v7LoadMore')}
                  </Button>
                ) : (
                  <Typography variant='caption' color='text.secondary'>
                    {t('profActivityEnd')}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}

export default ProfileWorkload
