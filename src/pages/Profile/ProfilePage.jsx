import { useState, useEffect, useCallback } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  fetchPublicProfileAPI,
  fetchProfileHeatmapAPI,
  fetchProfileWorkloadAPI,
  fetchProfileActivityAPI
} from '~/apis'
import StatusDialog from '~/components/AppBar/Menus/StatusDialog'
import PageShell, { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { formatDate } from '~/pages/Settings/utils/format'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getLocalTimeInfo, LOCALE_BY_LANG } from '~/utils/workingHours'
import ProfileHeatmap from './ProfileHeatmap'
import ProfileWorkload from './ProfileWorkload'

const MODE_LABEL_KEY = {
  available: 'profModeAvailable',
  focus: 'profModeFocus',
  meeting: 'profModeMeeting',
  ooo: 'profModeOoo'
}

const MODE_DOT_COLOR = {
  available: '#22c55e',
  focus: '#a855f7',
  meeting: '#f59e0b',
  ooo: '#64748b'
}

const STAT_DEFS = [
  { key: 'crsCompleted', labelKey: 'profStatCrsCompleted' },
  { key: 'crsActive', labelKey: 'profStatCrsActive' },
  { key: 'storyPointsDone', labelKey: 'profStatStoryPoints' },
  { key: 'boardsCount', labelKey: 'profStatBoards' },
  { key: 'wikiPagesCount', labelKey: 'profStatWiki' },
  { key: 'commentsCount', labelKey: 'profStatComments' }
]

const extractActivityItems = (res) => {
  if (Array.isArray(res?.items)) return res.items
  if (Array.isArray(res?.activities)) return res.activities
  if (Array.isArray(res)) return res
  return []
}

function ProfilePage() {
  const { username } = useParams()
  const currentUser = useSelector(selectCurrentUser)
  const { themeConfig } = usePersonaTheme()
  const { t, tPrimary, formatMessage, lang } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [heatmap, setHeatmap] = useState(null)
  const [workload, setWorkload] = useState(null)
  const [activityItems, setActivityItems] = useState([])
  const [activityHidden, setActivityHidden] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  const loadAll = useCallback(async () => {
    if (!username) return
    setLoading(true)
    setNotFound(false)
    setLoadError(false)
    try {
      const profileRes = await fetchPublicProfileAPI(username)
      setProfileData(profileRes)
    } catch (err) {
      const status = err?.response?.status
      if (status === 404 || status === 403) {
        setNotFound(true)
      } else {
        setLoadError(true)
      }
      setLoading(false)
      return
    }

    const [heatRes, workRes, actRes] = await Promise.all([
      fetchProfileHeatmapAPI(username, 365).catch(() => ({ hidden: true })),
      fetchProfileWorkloadAPI(username).catch(() => ({ hidden: true })),
      fetchProfileActivityAPI(username, {}).catch(() => ({ hidden: true }))
    ])

    setHeatmap(heatRes || { hidden: true })
    setWorkload(workRes || { hidden: true })
    if (!actRes || actRes.hidden) {
      setActivityHidden(true)
      setActivityItems([])
      setNextCursor(null)
    } else {
      setActivityHidden(false)
      setActivityItems(extractActivityItems(actRes))
      setNextCursor(actRes.nextCursor || null)
    }
    setLoading(false)
  }, [username])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleLoadMoreActivity = async () => {
    if (!username || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const res = await fetchProfileActivityAPI(username, { cursor: nextCursor })
      const more = extractActivityItems(res)
      setActivityItems((prev) => [...prev, ...more])
      setNextCursor(res?.nextCursor || null)
    } catch {
      setNextCursor(null)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <PageShell index={1} eyebrow={t('profEyebrow')} title={username ? `@${username}` : t('profEyebrow')}>
        <Box sx={{ ...surfaceSx, py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={22} />
          <Typography variant='body2' color='text.secondary'>{t('v7Loading')}</Typography>
        </Box>
      </PageShell>
    )
  }

  if (notFound) {
    return (
      <PageShell index={1} eyebrow={t('profEyebrow')}>
        <Box sx={{ ...surfaceSx, py: 6, px: 3, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
          <LockOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant='h6' sx={{ fontWeight: 800, mb: 1 }}>
            {t('profNotFoundTitle')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {t('profNotFoundBody')}
          </Typography>
          <Button
            component={RouterLink}
            to='/boards'
            variant='contained'
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {t('profBackHome')}
          </Button>
        </Box>
      </PageShell>
    )
  }

  if (loadError || !profileData) {
    return (
      <PageShell index={1} eyebrow={t('profEyebrow')}>
        <Box sx={{ ...surfaceSx, py: 5, px: 3, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
          <Typography variant='body1' sx={{ fontWeight: 700, mb: 2 }}>
            {t('profLoadError')}
          </Typography>
          <Button variant='outlined' onClick={loadAll} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {t('v7Retry')}
          </Button>
        </Box>
      </PageShell>
    )
  }

  const user = profileData.user || profileData
  const stats = profileData.stats || user.stats || {}
  const sharedWorkspaces = Array.isArray(profileData.sharedWorkspaces)
    ? profileData.sharedWorkspaces
    : (Array.isArray(user.sharedWorkspaces) ? user.sharedWorkspaces : [])
  const sharedBoards = Array.isArray(profileData.sharedBoards)
    ? profileData.sharedBoards
    : (Array.isArray(user.sharedBoards) ? user.sharedBoards : [])
  const isSelf = profileData.relation === 'self'
    || Boolean(currentUser?.username && user.username && currentUser.username === user.username)
    || Boolean(currentUser?._id && user._id && currentUser._id === user._id)

  const effectiveStatus = isSelf && currentUser?.status ? currentUser.status : user.status
  const hasStatus = Boolean(
    effectiveStatus?.text
    || effectiveStatus?.emoji
    || (effectiveStatus?.mode && MODE_LABEL_KEY[effectiveStatus.mode])
  )
  const roleLine = [user.jobTitle, user.department].filter(Boolean).join(' · ')
  const timeInfo = user.timezone
    ? getLocalTimeInfo({
      timeZone: user.timezone,
      workingHours: user.workingHours,
      viewerTimeZone: currentUser?.timezone,
      locale: LOCALE_BY_LANG[lang] || 'en-US'
    })
    : null
  const joinedLabel = user.createdAt
    ? formatMessage('profJoined', { date: formatDate(user.createdAt, lang) })
    : ''
  const skills = Array.isArray(user.skills) ? user.skills : []
  const socialLinks = Array.isArray(user.socialLinks) ? user.socialLinks : []

  return (
    <PageShell index={1} eyebrow={t('profEyebrow')} title={user.displayName || `@${user.username}`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Hero Card */}
        <Box sx={{ ...surfaceSx, p: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              height: { xs: 120, md: 164 },
              background: user.bannerUrl
                ? `url(${user.bannerUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${themeConfig.accentColor}33 0%, ${themeConfig.secondaryAccent || '#6366f1'}44 100%)`,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`
            }}
          />
          <Box sx={{ px: { xs: 2.25, md: 3 }, pb: { xs: 2.5, md: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                mt: -5,
                mb: 2
              }}
            >
              <Avatar
                src={user.avatar || undefined}
                alt={user.displayName}
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: '2rem',
                  fontWeight: 800,
                  border: (theme) => `4px solid ${theme.palette.background.paper}`
                }}
              >
                {(user.displayName || user.username || '?')[0]}
              </Avatar>

              {isSelf && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<MoodOutlinedIcon fontSize='small' />}
                    onClick={() => setStatusDialogOpen(true)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {hasStatus ? t('profEditStatus') : t('profSetStatus')}
                  </Button>
                  <Button
                    component={RouterLink}
                    to='/settings/profile'
                    variant='contained'
                    size='small'
                    startIcon={<EditOutlinedIcon fontSize='small' />}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {t('profEditProfile')}
                  </Button>
                </Box>
              )}
            </Box>

            <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {user.displayName || user.username}
            </Typography>
            {user.username && (
              <Typography variant='body2' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
                @{user.username}
              </Typography>
            )}
            {roleLine && (
              <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 600 }}>
                {roleLine}
              </Typography>
            )}

            {hasStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                {(effectiveStatus?.emoji || effectiveStatus?.text) && (
                  <Chip
                    size='small'
                    variant='outlined'
                    label={`${effectiveStatus.emoji ? `${effectiveStatus.emoji} ` : ''}${effectiveStatus.text || ''}`.trim()}
                    sx={{ fontWeight: 600 }}
                  />
                )}
                {effectiveStatus?.mode && MODE_LABEL_KEY[effectiveStatus.mode] && (
                  <Chip
                    size='small'
                    label={tPrimary(MODE_LABEL_KEY[effectiveStatus.mode])}
                    icon={(
                      <Box
                        component='span'
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: MODE_DOT_COLOR[effectiveStatus.mode] || '#22c55e',
                          display: 'inline-block',
                          ml: 1
                        }}
                      />
                    )}
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              {timeInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='caption' sx={{ fontFamily: MONO_FONT, fontWeight: 600 }}>
                    {formatMessage('profLocalTime', { time: timeInfo.timeString })}
                  </Typography>
                  {timeInfo.hasWorkingHours && (
                    <Chip
                      size='small'
                      color={timeInfo.isWorking ? 'success' : 'default'}
                      variant='outlined'
                      label={tPrimary(timeInfo.isWorking ? 'profWorkingNow' : 'profOutsideHours')}
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  )}
                  <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
                    ({timeInfo.offsetDiffMinutes === 0
                      ? tPrimary('profSameTime')
                      : formatMessage('profOffsetVsYou', { offset: timeInfo.offsetLabel })})
                  </Typography>
                </Box>
              )}
              {joinedLabel && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant='caption' color='text.secondary'>
                    {joinedLabel}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* About, Skills, Links & Shared Spaces */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Box component='section' sx={{ ...surfaceSx, p: { xs: 2.25, md: 3 }, height: '100%' }}>
              <EditorialLabel index={1}>{t('profAbout')}</EditorialLabel>
              <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mt: 0.5, mb: 1.5 }}>
                {t('profAbout')}
              </Typography>
              <Typography variant='body2' color={user.bio ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-line' }}>
                {user.bio || t('profNoBio')}
              </Typography>

              {user.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
                    {t('profEmail')}:
                  </Typography>
                  <Typography variant='body2' sx={{ fontFamily: MONO_FONT }}>
                    {user.email}
                  </Typography>
                </Box>
              )}

              {skills.length > 0 && (
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    {t('profSkills')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {skills.map((skill) => (
                      <Chip key={skill} size='small' label={skill} sx={{ fontWeight: 600 }} />
                    ))}
                  </Box>
                </Box>
              )}

              {socialLinks.length > 0 && (
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    {t('profLinks')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {socialLinks.map((link, idx) => (
                      <Link
                        key={`${link.url}-${idx}`}
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        underline='hover'
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        {link.label || link.url}
                        <LaunchRoundedIcon sx={{ fontSize: 14 }} />
                      </Link>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box component='section' sx={{ ...surfaceSx, p: { xs: 2.25, md: 3 }, height: '100%' }}>
              <EditorialLabel index={2}>{t('profSharedTitle')}</EditorialLabel>
              <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mt: 0.5, mb: 1.5 }}>
                {t('profSharedTitle')}
              </Typography>

              {sharedWorkspaces.length === 0 && sharedBoards.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  {t('profSharedEmpty')}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sharedWorkspaces.length > 0 && (
                    <Box>
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                        {t('profSharedWorkspaces')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {sharedWorkspaces.map((ws) => (
                          <Chip
                            key={ws._id || ws.id}
                            component={RouterLink}
                            to={`/workspaces/${ws._id || ws.id}`}
                            clickable
                            size='small'
                            variant='outlined'
                            label={ws.name || ws.title}
                            sx={{ fontWeight: 700 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {sharedWorkspaces.length > 0 && sharedBoards.length > 0 && <Divider />}

                  {sharedBoards.length > 0 && (
                    <Box>
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                        {t('profSharedBoards')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {sharedBoards.map((bd) => (
                          <Chip
                            key={bd._id || bd.id}
                            component={RouterLink}
                            to={`/boards/${bd._id || bd.id}`}
                            clickable
                            size='small'
                            variant='outlined'
                            label={bd.title || bd.name}
                            sx={{ fontWeight: 700 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* KPI Stats Grid */}
        <Box component='section' sx={{ ...surfaceSx, p: { xs: 2.25, md: 3 } }}>
          <EditorialLabel index={2}>{t('profStatsTitle')}</EditorialLabel>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800, mt: 0.5, mb: 2 }}>
            {t('profStatsTitle')}
          </Typography>
          <Grid container spacing={2}>
            {STAT_DEFS.map((stat) => (
              <Grid key={stat.key} item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant='h5' sx={{ fontFamily: MONO_FONT, fontWeight: 800, color: themeConfig.accentColor }}>
                    {Number(stats[stat.key] ?? 0)}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                    {t(stat.labelKey)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 52-week Contribution Heatmap */}
        <ProfileHeatmap heatmap={heatmap} />

        {/* Active Workload & Recent Activity */}
        <ProfileWorkload
          workload={workload}
          activityItems={activityItems}
          activityHidden={activityHidden}
          nextCursor={nextCursor}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMoreActivity}
        />
      </Box>

      {isSelf && (
        <StatusDialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          onSaved={(updatedUser) => {
            if (updatedUser?.status) {
              setProfileData((prev) => {
                if (!prev) return prev
                if (prev.user) return { ...prev, user: { ...prev.user, status: updatedUser.status } }
                return { ...prev, status: updatedUser.status }
              })
            }
          }}
        />
      )}
    </PageShell>
  )
}

export default ProfilePage
