import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
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
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { isUserLocked } from '../adminUtils'

const containmentPanelSx = {
  ...surfaceSx,
  mb: 3,
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 300px auto 340px',
  '@supports not (content-visibility: auto)': {
    contain: 'layout style paint'
  }
}

const stickyTableWrapperSx = {
  overflow: 'auto',
  maxInlineSize: '100%',
  maxBlockSize: 'min(480px, 72vh)',
  containerType: 'inline-size'
}

const stickyHeadCellSx = {
  fontWeight: 800,
  position: 'sticky',
  insetBlockStart: 0,
  zIndex: 1,
  bgcolor: 'background.paper'
}

const CIRCUIT_BREAKER_MODULES = [
  { key: 'registration', labelKey: 'admCbRegistration' },
  { key: 'aiAssistant', labelKey: 'admCbAiAssistant' },
  { key: 'fileUploads', labelKey: 'admCbFileUploads' },
  { key: 'publicInvites', labelKey: 'admCbPublicInvites' },
  { key: 'dataExports', labelKey: 'admCbDataExports' }
]

const PLAYBOOKS = [
  { action: 'revoke_non_admin_sessions', labelKey: 'admPbRevokeSessions', color: 'error' },
  { action: 'clear_auto_bans', labelKey: 'admPbClearAutoBans', color: 'warning' },
  { action: 'purge_expired_tokens', labelKey: 'admPbPurgeTokens', color: 'primary' },
  { action: 'reset_telemetry_and_rate_limits', labelKey: 'admPbResetTelemetry', color: 'secondary' }
]

function EmergencyControlTab({
  currentUser,
  emergencyState,
  onToggleEmergency,
  onRunPlaybook,
  users,
  usersLoading,
  usersError,
  searchInput,
  onSearchChange,
  nextCursor,
  onLoadMore,
  onPatchUser,
  onForceLogout,
  busy
}) {
  const { tPrimary, formatMessage, lang } = useTranslation()

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuUser, setMenuUser] = useState(null)
  const [confirmState, setConfirmState] = useState(null)

  const state = emergencyState || {}
  const disabledModules = state.disabledModules || {}

  const formatDate = (val) => {
    if (!val) return tPrimary('admNever')
    const date = new Date(val)
    return Number.isNaN(date.getTime()) ? tPrimary('admNever') : date.toLocaleDateString(lang)
  }

  const userLabel = (u) => u?.displayName || u?.username || u?.email || ''
  const isMenuSelf = Boolean(menuUser && menuUser._id === currentUser?._id)
  const menuLocked = isUserLocked(menuUser)

  const handleCloseMenu = () => {
    setMenuAnchor(null)
    setMenuUser(null)
  }

  return (
    <Box>
      {/* 1. Tiered Emergency Defense & Lockdown Switches */}
      <Box sx={containmentPanelSx}>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admEmergencyModesTitle')}</Typography>
          <Typography variant='caption' color='text.secondary'>{tPrimary('admEmergencyModesSub')}</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: '2px solid',
              borderColor: state.underAttackMode ? 'error.main' : 'divider',
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <EditorialLabel index={1}>DDoS SHIELD</EditorialLabel>
                <Switch
                  color='error'
                  checked={Boolean(state.underAttackMode)}
                  disabled={busy}
                  onChange={(e) => onToggleEmergency({ underAttackMode: e.target.checked })}
                  inputProps={{ 'aria-label': tPrimary('admUnderAttackTitle') }}
                />
              </Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 0.5 }}>{tPrimary('admUnderAttackTitle')}</Typography>
              <Typography variant='caption' color='text.secondary'>{tPrimary('admUnderAttackDesc')}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: '2px solid',
              borderColor: state.maintenanceMode ? 'warning.main' : 'divider',
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <EditorialLabel index={2}>READ-ONLY LOCKDOWN</EditorialLabel>
                <Switch
                  color='warning'
                  checked={Boolean(state.maintenanceMode)}
                  disabled={busy}
                  onChange={(e) => onToggleEmergency({ maintenanceMode: e.target.checked })}
                  inputProps={{ 'aria-label': tPrimary('admMaintenanceTitle') }}
                />
              </Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 0.5 }}>{tPrimary('admMaintenanceTitle')}</Typography>
              <Typography variant='caption' color='text.secondary'>{tPrimary('admMaintenanceDesc')}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: '2px solid',
              borderColor: state.autoBanEnabled !== false ? 'success.main' : 'divider',
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <EditorialLabel index={3}>AUTO-BAN + ALERT</EditorialLabel>
                <Switch
                  color='success'
                  checked={state.autoBanEnabled !== false}
                  disabled={busy}
                  onChange={(e) => onToggleEmergency({ autoBanEnabled: e.target.checked })}
                  inputProps={{ 'aria-label': tPrimary('admAutoBanTitle') }}
                />
              </Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 0.5 }}>{tPrimary('admAutoBanTitle')}</Typography>
              <Typography variant='caption' color='text.secondary'>{tPrimary('admAutoBanDesc')}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. Granular Feature Circuit Breakers & One-Click Playbooks */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Box sx={{ ...containmentPanelSx, mb: 0 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admCircuitBreakersTitle')}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>{tPrimary('admCircuitBreakersSub')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {CIRCUIT_BREAKER_MODULES.map((mod) => {
              const tripped = Boolean(disabledModules[mod.key])
              return (
                <Box
                  key={mod.key}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: tripped ? 'warning.main' : 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size='small'
                      color={tripped ? 'warning' : 'success'}
                      label={tripped ? 'PAUSED' : 'ONLINE'}
                      sx={{ fontFamily: MONO_FONT, fontWeight: 800, height: 20 }}
                    />
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>{tPrimary(mod.labelKey)}</Typography>
                  </Box>
                  <Switch
                    color='warning'
                    checked={tripped}
                    disabled={busy}
                    onChange={(e) => onToggleEmergency({ disabledModules: { [mod.key]: e.target.checked } })}
                    inputProps={{ 'aria-label': tPrimary(mod.labelKey) }}
                  />
                </Box>
              )
            })}
          </Box>
        </Box>

        <Box sx={{ ...containmentPanelSx, mb: 0 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admPlaybooksTitle')}</Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>{tPrimary('admPlaybooksSub')}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
            {PLAYBOOKS.map((pb) => (
              <Button
                key={pb.action}
                variant='outlined'
                color={pb.color}
                disabled={busy}
                onClick={() => onRunPlaybook({ action: pb.action })}
                sx={{ justifyContent: 'space-between', fontWeight: 800, py: 1.25 }}
              >
                <span>{tPrimary(pb.labelKey)}</span>
                <Chip size='small' label={pb.action} sx={{ fontFamily: MONO_FONT, fontSize: '0.68rem' }} />
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 3. System User Directory & Account Actions */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admUsersTitle')}</Typography>
          <TextField
            size='small'
            type='search'
            label={tPrimary('admSearchLabel')}
            placeholder={tPrimary('admSearchPlaceholder')}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
          />
        </Box>

        {usersError && <Alert severity='error' sx={{ mb: 2 }}>{tPrimary('admUsersFailed')}</Alert>}

        <TableContainer tabIndex={0} role='region' aria-label={tPrimary('admUsersTitle')} sx={stickyTableWrapperSx}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColUser')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColEmail')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColRole')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColStatus')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColCreated')}</TableCell>
                <TableCell sx={stickyHeadCellSx}>{tPrimary('admColLastLogin')}</TableCell>
                <TableCell align='right' sx={stickyHeadCellSx}>{tPrimary('admColSessions')}</TableCell>
                <TableCell align='right' sx={stickyHeadCellSx}>{tPrimary('admColActions')}</TableCell>
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
                    <TableCell component='th' scope='row'>
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
            <Button variant='outlined' size='small' disabled={usersLoading} onClick={onLoadMore} sx={{ fontWeight: 700 }}>
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
                disabled={isMenuSelf || busy}
                onClick={() => {
                  const target = menuUser
                  handleCloseMenu()
                  if (target.isActive === false) onPatchUser(target, { isActive: true })
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
            disabled={busy}
            onClick={() => {
              const target = menuUser
              handleCloseMenu()
              onPatchUser(target, { unlock: true })
            }}
          >
            {tPrimary('admUnlock')}
          </MenuItem>
        )}
        {menuUser && (
          <Tooltip title={isMenuSelf ? tPrimary('admSelfTooltip') : ''} placement='left'>
            <span>
              <MenuItem
                disabled={isMenuSelf || busy}
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
            disabled={busy}
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
          <Button onClick={() => setConfirmState(null)} disabled={busy}>{tPrimary('v7Cancel')}</Button>
          <Button
            variant='contained'
            color={confirmState?.type === 'deactivate' || confirmState?.type === 'demote' ? 'error' : 'primary'}
            disabled={busy}
            onClick={async () => {
              if (!confirmState?.user) return
              const u = confirmState.user
              const t = confirmState.type
              setConfirmState(null)
              if (t === 'promote') await onPatchUser(u, { role: 'admin' })
              else if (t === 'demote') await onPatchUser(u, { role: 'client' })
              else if (t === 'deactivate') await onPatchUser(u, { isActive: false })
              else if (t === 'forceLogout') await onForceLogout(u)
            }}
            sx={{ fontWeight: 800 }}
          >
            {tPrimary('v7Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmergencyControlTab
