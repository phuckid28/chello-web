import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { toast } from 'react-toastify'
import PageShell, { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { fetchAdminStatsAPI, fetchAdminUsersAPI, updateAdminUserAPI, forceLogoutUserAPI } from '~/apis'
import {
  SEARCH_DEBOUNCE_MS,
  isUserLocked,
  patchUserInList,
  replaceUserInList,
  appendUniqueUsers,
  normalizeUsersPage,
  buildSignupChart
} from './adminUtils'

const CHART_OPTS = { width: 720, height: 200, padding: { top: 16, right: 16, bottom: 28, left: 36 } }
const SR_ONLY = { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }

function AdminConsole() {
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary, formatMessage, lang } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)
  const [users, setUsers] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuUser, setMenuUser] = useState(null)
  const [confirmState, setConfirmState] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadStats = useCallback(async () => {
    setStatsError(false)
    try {
      const data = await fetchAdminStatsAPI()
      setStats(data || {})
    } catch {
      setStatsError(true)
    }
  }, [])

  const loadUsers = useCallback(async (query, cursor = null) => {
    setUsersLoading(true)
    setUsersError(false)
    try {
      const params = {}
      if (query) params.q = query
      if (cursor) params.cursor = cursor
      const res = await fetchAdminUsersAPI(params)
      const page = normalizeUsersPage(res)
      setUsers((prev) => (cursor ? appendUniqueUsers(prev, page.items) : page.items))
      setNextCursor(page.nextCursor)
    } catch {
      setUsersError(true)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.role === 'admin') loadStats()
  }, [currentUser?.role, loadStats])

  useEffect(() => {
    if (currentUser?.role === 'admin') loadUsers(debouncedQuery, null)
  }, [currentUser?.role, debouncedQuery, loadUsers])

  if (currentUser?.role !== 'admin') {
    return (
      <PageShell index={1} eyebrow={tPrimary('admEyebrow')} title={tPrimary('admForbiddenTitle')} subtitle={tPrimary('admForbiddenSub')}>
        <Button component={Link} to='/boards' variant='contained' sx={{ fontWeight: 800 }}>{tPrimary('admBackToBoards')}</Button>
      </PageShell>
    )
  }

  const formatDate = (val) => {
    if (!val) return tPrimary('admNever')
    const date = new Date(val)
    return Number.isNaN(date.getTime()) ? tPrimary('admNever') : date.toLocaleDateString(lang)
  }

  const userLabel = (u) => u?.displayName || u?.username || u?.email || ''

  const runPatchUser = async (targetUser, patch) => {
    setActionBusy(true)
    try {
      const updated = await updateAdminUserAPI(targetUser._id, patch)
      setUsers((prev) => (updated?._id ? replaceUserInList(prev, updated) : patchUserInList(prev, targetUser._id, patch)))
      toast.success(formatMessage('admUpdated', { name: userLabel(targetUser) }))
    } finally {
      setActionBusy(false)
      setConfirmState(null)
    }
  }

  const runForceLogout = async (targetUser) => {
    setActionBusy(true)
    try {
      await forceLogoutUserAPI(targetUser._id)
      setUsers((prev) => patchUserInList(prev, targetUser._id, { activeSessionsCount: 0 }))
      toast.success(formatMessage('admLoggedOut', { name: userLabel(targetUser) }))
    } finally {
      setActionBusy(false)
      setConfirmState(null)
    }
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
    setMenuUser(null)
  }

  const chart = buildSignupChart(stats?.signups, CHART_OPTS)
  const totalSignups = chart.bars.reduce((sum, b) => sum + b.count, 0)
  const kpiCards = [
    { key: 'users', label: tPrimary('admStatUsers'), value: stats?.totalUsers ?? stats?.users ?? 0 },
    { key: 'active7d', label: tPrimary('admStatActive7d'), value: stats?.activeUsers7d ?? stats?.active7d ?? 0 },
    { key: 'workspaces', label: tPrimary('admStatWorkspaces'), value: stats?.totalWorkspaces ?? stats?.workspaces ?? 0 },
    { key: 'boards', label: tPrimary('admStatBoards'), value: stats?.totalBoards ?? stats?.boards ?? 0 }
  ]

  const isMenuSelf = Boolean(menuUser && menuUser._id === currentUser?._id)
  const menuLocked = isUserLocked(menuUser)

  return (
    <PageShell
      index={1}
      eyebrow={tPrimary('admEyebrow')}
      title={tPrimary('admTitle')}
      subtitle={tPrimary('admSubtitle')}
      actions={
        <Button
          variant='outlined'
          size='small'
          startIcon={<RefreshRoundedIcon />}
          onClick={() => {
            loadStats()
            loadUsers(debouncedQuery, null)
          }}
          sx={{ fontWeight: 700 }}
        >
          {tPrimary('admRefresh')}
        </Button>
      }
    >
      {statsError && <Alert severity='error' sx={{ mb: 2 }}>{tPrimary('admStatsFailed')}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {kpiCards.map((item, idx) => (
          <Box key={item.key} sx={surfaceSx}>
            <EditorialLabel index={idx + 1}>{item.label}</EditorialLabel>
            <Typography variant='h4' sx={{ mt: 1, fontFamily: MONO_FONT, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {Number(item.value || 0).toLocaleString(lang)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ ...surfaceSx, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admSignupsTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>{tPrimary('admSignupsSub')}</Typography>
          </Box>
          <Chip size='small' label={formatMessage('admSignupsTotal', { count: totalSignups })} sx={{ fontFamily: MONO_FONT, fontWeight: 700 }} />
        </Box>

        {chart.bars.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>{tPrimary('admSignupsEmpty')}</Typography>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Box
              component='svg'
              role='img'
              aria-label={tPrimary('admChartLabel')}
              viewBox={`0 0 ${CHART_OPTS.width} ${CHART_OPTS.height}`}
              sx={{ width: '100%', height: 'auto', maxHeight: 220, display: 'block' }}
            >
              {chart.tickLines.map((tick) => (
                <g key={tick.value}>
                  <line x1={CHART_OPTS.padding.left} x2={CHART_OPTS.width - CHART_OPTS.padding.right} y1={tick.y} y2={tick.y} stroke='currentColor' strokeOpacity={0.14} strokeDasharray='3 3' />
                  <text x={CHART_OPTS.padding.left - 8} y={tick.y + 4} textAnchor='end' fontSize='10' fill='currentColor' opacity={0.65}>{tick.value}</text>
                </g>
              ))}
              {chart.bars.map((bar) => (
                <g key={bar.date}>
                  <rect x={bar.x} y={bar.y} width={Math.max(2, bar.width)} height={Math.max(0, bar.height)} rx={3} fill={themeConfig.accentColor}>
                    <title>{formatMessage('admSignupsTooltip', { date: bar.date, count: bar.count })}</title>
                  </rect>
                  {bar.showLabel && (
                    <text x={bar.x + bar.width / 2} y={CHART_OPTS.height - 8} textAnchor='middle' fontSize='10' fill='currentColor' opacity={0.7}>
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
                {chart.bars.map((bar) => (
                  <tr key={bar.date}><td>{bar.date}</td><td>{bar.count}</td></tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={surfaceSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admUsersTitle')}</Typography>
          <TextField
            size='small'
            type='search'
            label={tPrimary('admSearchLabel')}
            placeholder={tPrimary('admSearchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
          />
        </Box>

        {usersError && <Alert severity='error' sx={{ mb: 2 }}>{tPrimary('admUsersFailed')}</Alert>}

        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>{tPrimary('admColUser')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{tPrimary('admColEmail')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{tPrimary('admColRole')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{tPrimary('admColStatus')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{tPrimary('admColCreated')}</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{tPrimary('admColLastLogin')}</TableCell>
                <TableCell align='right' sx={{ fontWeight: 800 }}>{tPrimary('admColSessions')}</TableCell>
                <TableCell align='right' sx={{ fontWeight: 800 }}>{tPrimary('admColActions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && !usersLoading && (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 4, color: 'text.secondary' }}>{tPrimary('admNoUsers')}</TableCell>
                </TableRow>
              )}
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id
                const locked = isUserLocked(u)
                const active = u.isActive !== false
                return (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar src={u.avatar} alt={userLabel(u)} sx={{ width: 28, height: 28, fontSize: '0.78rem' }}>
                          {userLabel(u).slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>{u.displayName || u.username || '—'}</Typography>
                            {isSelf && <Chip size='small' label={tPrimary('admYou')} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                          </Box>
                          {u.username && <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>@{u.username}</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.78rem' }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip size='small' color={u.role === 'admin' ? 'primary' : 'default'} label={tPrimary(u.role === 'admin' ? 'admRoleAdmin' : 'admRoleClient')} sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip size='small' color={active ? 'success' : 'default'} label={tPrimary(active ? 'admActive' : 'admInactive')} />
                        {locked && <Chip size='small' color='warning' label={tPrimary('admLocked')} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{formatDate(u.createdAt)}</TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{formatDate(u.lastLoginAt)}</TableCell>
                    <TableCell align='right' sx={{ fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' }}>
                      {Number(u.activeSessionsCount ?? u.sessionsCount ?? 0)}
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        aria-label={formatMessage('admRowActions', { name: userLabel(u) })}
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget)
                          setMenuUser(u)
                        }}
                      >
                        <MoreVertRoundedIcon fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {nextCursor && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant='outlined' size='small' disabled={usersLoading} onClick={() => loadUsers(debouncedQuery, nextCursor)} sx={{ fontWeight: 700 }}>
              {tPrimary('v7LoadMore')}
            </Button>
          </Box>
        )}
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        {menuUser && (
          <Tooltip title={isMenuSelf ? tPrimary('admSelfTooltip') : ''} placement='left'>
            <span>
              <MenuItem
                disabled={isMenuSelf || actionBusy}
                onClick={() => {
                  const target = menuUser
                  handleCloseMenu()
                  if (target.isActive === false) runPatchUser(target, { isActive: true })
                  else setConfirmState({ type: 'deactivate', user: target })
                }}
              >
                {tPrimary(menuUser.isActive === false ? 'admActivate' : 'admDeactivate')}
              </MenuItem>
            </span>
          </Tooltip>
        )}
        {menuUser && menuLocked && (
          <MenuItem
            disabled={actionBusy}
            onClick={() => {
              const target = menuUser
              handleCloseMenu()
              runPatchUser(target, { unlock: true })
            }}
          >
            {tPrimary('admUnlock')}
          </MenuItem>
        )}
        {menuUser && (
          <Tooltip title={isMenuSelf ? tPrimary('admSelfTooltip') : ''} placement='left'>
            <span>
              <MenuItem
                disabled={isMenuSelf || actionBusy}
                onClick={() => {
                  const target = menuUser
                  handleCloseMenu()
                  setConfirmState({ type: target.role === 'admin' ? 'demote' : 'promote', user: target })
                }}
              >
                {tPrimary(menuUser.role === 'admin' ? 'admDemote' : 'admPromote')}
              </MenuItem>
            </span>
          </Tooltip>
        )}
        {menuUser && (
          <MenuItem
            disabled={actionBusy}
            onClick={() => {
              const target = menuUser
              handleCloseMenu()
              setConfirmState({ type: 'forceLogout', user: target })
            }}
          >
            {tPrimary('admForceLogout')}
          </MenuItem>
        )}
      </Menu>

      <Dialog open={Boolean(confirmState)} onClose={() => setConfirmState(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{tPrimary('admConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            {confirmState?.type === 'promote' && formatMessage('admConfirmPromote', { name: userLabel(confirmState.user) })}
            {confirmState?.type === 'demote' && formatMessage('admConfirmDemote', { name: userLabel(confirmState.user) })}
            {confirmState?.type === 'deactivate' && formatMessage('admConfirmDeactivate', { name: userLabel(confirmState.user) })}
            {confirmState?.type === 'forceLogout' && formatMessage('admConfirmForceLogout', { name: userLabel(confirmState.user) })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmState(null)} disabled={actionBusy}>{tPrimary('v7Cancel')}</Button>
          <Button
            variant='contained'
            color={confirmState?.type === 'deactivate' || confirmState?.type === 'demote' ? 'error' : 'primary'}
            disabled={actionBusy}
            onClick={() => {
              if (!confirmState?.user) return
              if (confirmState.type === 'promote') runPatchUser(confirmState.user, { role: 'admin' })
              else if (confirmState.type === 'demote') runPatchUser(confirmState.user, { role: 'client' })
              else if (confirmState.type === 'deactivate') runPatchUser(confirmState.user, { isActive: false })
              else if (confirmState.type === 'forceLogout') runForceLogout(confirmState.user)
            }}
            sx={{ fontWeight: 800 }}
          >
            {tPrimary('v7Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}

export default AdminConsole
