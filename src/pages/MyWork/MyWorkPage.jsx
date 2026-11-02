import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded'
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded'
import { useDispatch, useSelector } from 'react-redux'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import { fetchProfileWorkloadAPI } from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchInboxTab, selectInboxTab } from '~/redux/inbox/inboxSlice'
import { isUnread, resolveNotificationPath } from '~/redux/inbox/inboxHelpers'
import { formatRelativeTime } from '~/components/Activity/activityHelpers'
import {
  cardPath,
  groupByBoard,
  groupByDueBucket,
  upcomingByDay
} from './myWorkHelpers'
import { useTranslation } from '~/customHooks/useTranslation'

const BUCKET_LABEL_KEYS = {
  overdue: 'myWorkBucketOverdue',
  today: 'myWorkBucketToday',
  week: 'myWorkBucketWeek',
  later: 'myWorkBucketLater',
  none: 'myWorkBucketNoDue'
}

const BUCKET_COLORS = {
  overdue: 'error',
  today: 'warning',
  week: 'info',
  later: 'default',
  none: 'default'
}

function MyWorkPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const currentUser = useSelector(selectCurrentUser)
  const mentionTab = useSelector(selectInboxTab('mention'))
  const [groupMode, setGroupMode] = useState('due')
  const [workload, setWorkload] = useState({ active: [], completed30dCount: 0, overdueCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dispatch(fetchInboxTab({ tab: 'mention' }))
  }, [dispatch])

  useEffect(() => {
    if (!currentUser?.username) {
      setLoading(false)
      return
    }
    let mounted = true
    setLoading(true)
    fetchProfileWorkloadAPI(currentUser.username)
      .then((res) => {
        if (mounted && res) {
          setWorkload({
            active: res.active || [],
            completed30dCount: res.completed30dCount || 0,
            overdueCount: res.overdueCount || 0
          })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [currentUser?.username])

  const activeItems = useMemo(() => workload.active || [], [workload.active])
  const groupedItems = useMemo(
    () => (groupMode === 'due' ? groupByDueBucket(activeItems) : groupByBoard(activeItems)),
    [activeItems, groupMode]
  )
  const upcomingDays = useMemo(() => upcomingByDay(activeItems), [activeItems])
  const unreadMentions = useMemo(
    () => (mentionTab?.items || []).filter(m => isUnread(m)).slice(0, 6),
    [mentionTab?.items]
  )

  return (
    <PageShell
      index={2}
      eyebrow={t('myWorkEyebrow')}
      title={t('myWorkTitle')}
      subtitle={t('myWorkSubtitle')}
      actions={
        <ButtonGroup size="small" variant="outlined">
          <Button
            variant={groupMode === 'due' ? 'contained' : 'outlined'}
            onClick={() => setGroupMode('due')}
          >
            {t('myWorkGroupByDue')}
          </Button>
          <Button
            variant={groupMode === 'board' ? 'contained' : 'outlined'}
            onClick={() => setGroupMode('board')}
          >
            {t('myWorkGroupByBoard')}
          </Button>
        </ButtonGroup>
      }
    >
      {loading ? (
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid xs={12} md={7.5}>
            <Paper sx={{ ...surfaceSx, p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIndRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {t('myWorkAssignedSection')}
                  </Typography>
                </Box>
                <Chip size="small" label={activeItems.length} color="primary" variant="outlined" />
              </Box>

              {groupedItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  {t('myWorkEmptyAssigned')}
                </Typography>
              ) : (
                <Stack spacing={2.5}>
                  {groupedItems.map((group) => (
                    <Box key={group.key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          size="small"
                          color={groupMode === 'due' ? BUCKET_COLORS[group.key] : 'primary'}
                          label={groupMode === 'due' ? t(BUCKET_LABEL_KEYS[group.key]) : (group.title || group.key)}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({group.items.length})
                        </Typography>
                      </Box>
                      <Stack divider={<Divider />} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        {group.items.map((item) => (
                          <Box
                            key={item.cardId}
                            component={RouterLink}
                            to={cardPath(item)}
                            sx={{
                              px: 2,
                              py: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1.5,
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                                {item.crCode ? `[${item.crCode}] ` : ''}{item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.boardTitle}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                              {item.baStatus && (
                                <Chip size="small" label={item.baStatus} variant="outlined" sx={{ height: 22 }} />
                              )}
                              {item.dueDate && (
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(item.dueDate).toLocaleDateString(lang)}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid xs={12} md={4.5}>
            <Stack spacing={3}>
              <Paper sx={{ ...surfaceSx, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EventAvailableRoundedIcon color="info" fontSize="small" />
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {t('myWorkUpcomingSection')}
                  </Typography>
                </Box>
                {upcomingDays.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('myWorkEmptyUpcoming')}
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {upcomingDays.map((day) => (
                      <Box key={day.dayStart}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          {new Date(day.dayStart).toLocaleDateString(lang, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                        <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                          {day.items.map((item) => (
                            <Box
                              key={item.cardId}
                              onClick={() => navigate(cardPath(item))}
                              sx={{
                                p: 1,
                                borderRadius: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.boardTitle}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper sx={{ ...surfaceSx, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlternateEmailRoundedIcon color="secondary" fontSize="small" />
                    <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                      {t('myWorkMentionsSection')}
                    </Typography>
                  </Box>
                  <Button component={RouterLink} to="/inbox" size="small" sx={{ textTransform: 'none' }}>
                    {t('inboxOpenFull')}
                  </Button>
                </Box>
                {unreadMentions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('inboxEmptyUnread')}
                  </Typography>
                ) : (
                  <Stack divider={<Divider />} spacing={1}>
                    {unreadMentions.map((m) => (
                      <Box
                        key={m._id}
                        onClick={() => {
                          const p = resolveNotificationPath(m)
                          if (p) navigate(p)
                        }}
                        sx={{ py: 0.75, cursor: 'pointer' }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {m.title || m.body}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(m.createdAt, lang)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}
    </PageShell>
  )
}

export default MyWorkPage
