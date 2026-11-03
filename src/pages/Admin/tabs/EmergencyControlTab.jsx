import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
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
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { EditorialLabel } from '~/components/Layout/PageShell'
import { surfaceSx, MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { isUserLocked, parseBulkUsersText, buildCredentialsCsv } from '../adminUtils'

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
  maxBlockSize: 'min(520px, 72vh)',
  containerType: 'inline-size'
}

const stickyHeadCellSx = {
  fontWeight: 800,
  position: 'sticky',
  insetBlockStart: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
  whiteSpace: 'nowrap'
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

const ROLE_META = {
  admin: { labelKey: 'admRoleAdmin', color: 'error' },
  ops_manager: { labelKey: 'admRoleOpsManager', color: 'info' },
  security_auditor: { labelKey: 'admRoleSecurityAuditor', color: 'warning' },
  client: { labelKey: 'admRoleClient', color: 'default' }
}

const downloadCsvFile = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

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
  onForcePasswordChange,
  onCreateUser,
  onBulkImportUsers,
  busy
}) {
  const { tPrimary, formatMessage, lang } = useTranslation()

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuUser, setMenuUser] = useState(null)
  const [confirmState, setConfirmState] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  // Direct Create User modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newRole, setNewRole] = useState('client')
  const [newPassword, setNewPassword] = useState('')
  const [newMustChange, setNewMustChange] = useState(true)
  const [createdCredentials, setCreatedCredentials] = useState(null)

  // Bulk Import modal state
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkRawText, setBulkRawText] = useState('email,displayName,role,password\nuser1@example.com,Nguyen Van A,client,\nops1@example.com,Tran Thi B,ops_manager,')
  const [bulkConflictMode, setBulkConflictMode] = useState('skip')
  const [bulkMustChange, setBulkMustChange] = useState(true)
  const [bulkReport, setBulkReport] = useState(null)

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

  const handleToggleSelectUser = (userId) => {
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleToggleSelectAll = (checked) => {
    if (!checked) {
      setSelectedIds([])
      return
    }
    const selectable = (users || []).filter(u => u._id !== currentUser?._id).map(u => u._id)
    setSelectedIds(selectable)
  }

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    const res = await onCreateUser({
      email: newEmail.trim(),
      displayName: newDisplayName.trim(),
      username: newUsername.trim(),
      role: newRole,
      password: newPassword.trim(),
      mustChangePassword: newMustChange
    })
    if (res) {
      setCreatedCredentials(res)
      setNewEmail('')
      setNewDisplayName('')
      setNewUsername('')
      setNewPassword('')
    }
  }

  const handleRunBulkImport = async (dryRun) => {
    const parsedRows = parseBulkUsersText(bulkRawText)
    if (parsedRows.length === 0) return
    const res = await onBulkImportUsers({
      users: parsedRows,
      conflictMode: bulkConflictMode,
      mustChangePassword: bulkMustChange,
      dryRun
    })
    if (res) {
      setBulkReport(res)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setBulkRawText(String(ev.target?.result || ''))
      setBulkReport(null)
    }
    reader.readAsText(file)
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

      {/* 3. System User Directory, Provisioning & Force Password Change (Option B) */}
      <Box sx={{ ...containmentPanelSx, mb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 800 }}>{tPrimary('admUsersTitle')}</Typography>
            <Typography variant='caption' color='text.secondary'>
              Tạo/nhập tài khoản hàng loạt, phân quyền 4 cấp (Admin / Ops / SOC / Client) và buộc đổi mật khẩu kèm đăng xuất tức thì (Option B).
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {selectedIds.length > 0 && (
              <Button
                size='small'
                variant='contained'
                color='warning'
                startIcon={<LockResetRoundedIcon />}
                disabled={busy}
                onClick={async () => {
                  await onForcePasswordChange({
                    userIds: selectedIds,
                    revokeAllSessions: true,
                    reason: 'Quản trị viên yêu cầu đặt lại mật khẩu bảo mật (Option B).'
                  })
                  setSelectedIds([])
                }}
                sx={{ fontWeight: 800 }}
              >
                {formatMessage('admForcePwSelectedBtn', { count: selectedIds.length })}
              </Button>
            )}
            <Button
              size='small'
              variant='outlined'
              startIcon={<UploadFileRoundedIcon />}
              disabled={busy}
              onClick={() => {
                setBulkReport(null)
                setBulkOpen(true)
              }}
              sx={{ fontWeight: 800 }}
            >
              {tPrimary('admBulkImportBtn')}
            </Button>
            <Button
              size='small'
              variant='contained'
              startIcon={<PersonAddAlt1RoundedIcon />}
              disabled={busy}
              onClick={() => {
                setCreatedCredentials(null)
                setCreateOpen(true)
              }}
              sx={{ fontWeight: 800 }}
            >
              {tPrimary('admCreateUserBtn')}
            </Button>
            <TextField
              size='small'
              type='search'
              label={tPrimary('admSearchLabel')}
              placeholder={tPrimary('admSearchPlaceholder')}
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 230 } }}
            />
          </Box>
        </Box>

        {usersError && <Alert severity='error' sx={{ mb: 2 }}>{tPrimary('admUsersFailed')}</Alert>}

        <TableContainer tabIndex={0} role='region' aria-label={tPrimary('admUsersTitle')} sx={stickyTableWrapperSx}>
          <Table size='small' sx={{ tableLayout: 'fixed', minWidth: 980 }}>
            <TableHead>
              <TableRow>
                <TableCell padding='checkbox' sx={{ ...stickyHeadCellSx, width: 44 }}>
                  <Checkbox
                    size='small'
                    indeterminate={selectedIds.length > 0 && selectedIds.length < (users || []).filter(u => u._id !== currentUser?._id).length}
                    checked={(users || []).length > 1 && selectedIds.length === (users || []).filter(u => u._id !== currentUser?._id).length}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    inputProps={{ 'aria-label': 'Select all users' }}
                  />
                </TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 210 }}>{tPrimary('admColUser')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 200 }}>{tPrimary('admColEmail')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 150 }}>{tPrimary('admColRole')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 165 }}>{tPrimary('admColStatus')}</TableCell>
                <TableCell sx={{ ...stickyHeadCellSx, width: 100 }}>{tPrimary('admColLastLogin')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 70 }}>{tPrimary('admColSessions')}</TableCell>
                <TableCell align='right' sx={{ ...stickyHeadCellSx, width: 75 }}>{tPrimary('admColActions')}</TableCell>
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
                const roleInfo = ROLE_META[u.role] || ROLE_META.client
                return (
                  <TableRow key={u._id} hover selected={selectedIds.includes(u._id)}>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        size='small'
                        disabled={isSelf}
                        checked={selectedIds.includes(u._id)}
                        onChange={() => handleToggleSelectUser(u._id)}
                        inputProps={{ 'aria-label': `Select ${userLabel(u)}` }}
                      />
                    </TableCell>
                    <TableCell component='th' scope='row' sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar src={u.avatar} alt={userLabel(u)} sx={{ width: 28, height: 28, fontSize: '0.78rem' }}>
                          {userLabel(u).slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant='body2' noWrap sx={{ fontWeight: 700 }}>{u.displayName || u.username || '—'}</Typography>
                            {isSelf && <Chip size='small' label={tPrimary('admYou')} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />}
                          </Box>
                          {u.username && <Typography variant='caption' color='text.secondary' noWrap sx={{ fontFamily: MONO_FONT, display: 'block' }}>@{u.username}</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.email}>
                      {u.email}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip size='small' color={roleInfo.color} label={tPrimary(roleInfo.labelKey)} sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip size='small' color={active ? 'success' : 'default'} label={tPrimary(active ? 'admActive' : 'admInactive')} />
                        {locked && <Chip size='small' color='warning' label={tPrimary('admLocked')} />}
                        {u.mustChangePassword && (
                          <Chip size='small' color='warning' variant='outlined' label={tPrimary('admMustChangePwBadge')} sx={{ fontWeight: 700 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: MONO_FONT, fontSize: '0.75rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {formatDate(u.lastLoginAt)}
                    </TableCell>
                    <TableCell align='right' sx={{ fontFamily: MONO_FONT, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(u.activeSessionsCount ?? u.sessionsCount ?? 0)}
                    </TableCell>
                    <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
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

      {/* Row Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        {menuUser && (
          <MenuItem
            disabled={busy}
            onClick={() => {
              const target = menuUser
              handleCloseMenu()
              setConfirmState({ type: 'forcePasswordChange', user: target })
            }}
          >
            {tPrimary('admForcePwAction')}
          </MenuItem>
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
                  if (target.isActive === false) onPatchUser(target, { isActive: true })
                  else setConfirmState({ type: 'deactivate', user: target })
                }}
              >
                {tPrimary(menuUser.isActive === false ? 'admActivate' : 'admDeactivate')}
              </MenuItem>
            </span>
          </Tooltip>
        )}
        {menuUser && ['admin', 'ops_manager', 'security_auditor', 'client'].map((roleOption) => {
          if (menuUser.role === roleOption) return null
          return (
            <MenuItem
              key={roleOption}
              disabled={isMenuSelf || busy}
              onClick={() => {
                const target = menuUser
                handleCloseMenu()
                onPatchUser(target, { role: roleOption })
              }}
            >
              Chuyển vai trò: {tPrimary(ROLE_META[roleOption].labelKey)}
            </MenuItem>
          )
        })}
      </Menu>

      {/* Confirm Action Dialog */}
      <Dialog open={Boolean(confirmState)} onClose={() => setConfirmState(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {confirmState?.type === 'forcePasswordChange' ? tPrimary('admForcePwTitle') : tPrimary('admConfirmTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            {confirmState?.type === 'forcePasswordChange' && tPrimary('admForcePwSub')}
            {confirmState?.type === 'deactivate' && formatMessage('admConfirmDeactivate', { name: userLabel(confirmState.user) })}
            {confirmState?.type === 'forceLogout' && formatMessage('admConfirmForceLogout', { name: userLabel(confirmState.user) })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmState(null)} disabled={busy}>{tPrimary('v7Cancel')}</Button>
          <Button
            variant='contained'
            color={confirmState?.type === 'deactivate' ? 'error' : 'warning'}
            disabled={busy}
            onClick={async () => {
              if (!confirmState?.user) return
              const u = confirmState.user
              const t = confirmState.type
              setConfirmState(null)
              if (t === 'deactivate') await onPatchUser(u, { isActive: false })
              else if (t === 'forceLogout') await onForceLogout(u)
              else if (t === 'forcePasswordChange') {
                await onForcePasswordChange({
                  userIds: [u._id],
                  revokeAllSessions: true,
                  reason: 'Quản trị viên yêu cầu đặt lại mật khẩu bảo mật (Option B).'
                })
              }
            }}
            sx={{ fontWeight: 800 }}
          >
            {tPrimary('v7Confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Direct Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Tạo Tài khoản Hệ thống Trực tiếp</DialogTitle>
        <Box component='form' onSubmit={handleCreateUserSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {createdCredentials && (
              <Alert
                severity='success'
                action={
                  <Button
                    size='small'
                    color='inherit'
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => downloadCsvFile(buildCredentialsCsv([createdCredentials]), `chella-user-${createdCredentials.username}.csv`)}
                  >
                    Tải CSV
                  </Button>
                }
              >
                <Typography variant='body2' sx={{ fontWeight: 800 }}>
                  Đã tạo: {createdCredentials.email}
                </Typography>
                <Typography variant='caption' sx={{ fontFamily: MONO_FONT, display: 'block' }}>
                  Mật khẩu tạm: <strong>{createdCredentials.temporaryPassword}</strong> (Bắt buộc đổi khi đăng nhập)
                </Typography>
              </Alert>
            )}
            <TextField
              size='small'
              type='email'
              required
              label='Email tài khoản'
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <TextField
                size='small'
                label='Tên hiển thị (Display Name)'
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
              />
              <TextField
                size='small'
                label='Username (Tùy chọn)'
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <FormControl size='small'>
                <InputLabel>Vai trò Hệ thống</InputLabel>
                <Select label='Vai trò Hệ thống' value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <MenuItem value='client'>Người dùng (Client)</MenuItem>
                  <MenuItem value='ops_manager'>Quản lý Vận hành (Ops Manager)</MenuItem>
                  <MenuItem value='security_auditor'>Kiểm toán Bảo mật (Security Auditor)</MenuItem>
                  <MenuItem value='admin'>Quản trị viên (Global Admin)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size='small'
                label='Mật khẩu khởi tạo (Để trống = Tự sinh 14 ký tự)'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                Bắt buộc đổi mật khẩu ngay lần đăng nhập đầu tiên
              </Typography>
              <Switch checked={newMustChange} onChange={(e) => setNewMustChange(e.target.checked)} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)}>Đóng</Button>
            <Button type='submit' variant='contained' disabled={busy || !newEmail.trim()} sx={{ fontWeight: 800 }}>
              Tạo Tài khoản
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Bulk Import Users Wizard (CSV / TSV / JSON) */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Nhập Tài khoản Hàng loạt (CSV / TSV / JSON Bulk Provisioning)
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant='caption' color='text.secondary'>
            Định dạng cột CSV: <code>email,displayName,role,password</code> (nếu cột <code>password</code> để trống, hệ thống tự động sinh mật khẩu mạnh 14 ký tự và xuất file CSV bàn giao).
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant='outlined' component='label' size='small' startIcon={<UploadFileRoundedIcon />} sx={{ fontWeight: 700 }}>
              Chọn file .CSV / .TXT / .JSON
              <input type='file' hidden accept='.csv,.tsv,.txt,.json' onChange={handleFileUpload} />
            </Button>

            <FormControl size='small' sx={{ minWidth: 210 }}>
              <InputLabel>Khi trùng Email đã tồn tại</InputLabel>
              <Select label='Khi trùng Email đã tồn tại' value={bulkConflictMode} onChange={(e) => setBulkConflictMode(e.target.value)}>
                <MenuItem value='skip'>Bỏ qua tài khoản trùng (Skip)</MenuItem>
                <MenuItem value='upsert'>Cập nhật Vai trò & Tên (Upsert)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='caption' sx={{ fontWeight: 700 }}>Buộc đổi mật khẩu lần đầu:</Typography>
              <Switch size='small' checked={bulkMustChange} onChange={(e) => setBulkMustChange(e.target.checked)} />
            </Box>
          </Box>

          <TextField
            multiline
            minRows={6}
            maxRows={12}
            fullWidth
            value={bulkRawText}
            onChange={(e) => setBulkRawText(e.target.value)}
            InputProps={{ sx: { fontFamily: MONO_FONT, fontSize: '0.78rem' } }}
          />

          {bulkReport && (
            <Alert
              severity={bulkReport.dryRun ? 'info' : 'success'}
              action={
                !bulkReport.dryRun && (bulkReport.credentials || []).length > 0 ? (
                  <Button
                    size='small'
                    color='inherit'
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => downloadCsvFile(buildCredentialsCsv(bulkReport.credentials), 'chella-bulk-credentials.csv')}
                    sx={{ fontWeight: 800 }}
                  >
                    Tải CSV Mật khẩu ({bulkReport.credentials.length})
                  </Button>
                ) : null
              }
            >
              <Typography variant='body2' sx={{ fontWeight: 800 }}>
                {bulkReport.dryRun ? 'KẾT QUẢ KIỂM TRA THỬ (DRY-RUN PREVIEW):' : 'ĐÃ NHẬP TÀI KHOẢN HOÀN TẤT:'}
              </Typography>
              <Typography variant='caption' sx={{ fontFamily: MONO_FONT }}>
                Tổng dòng: {bulkReport.totalRows} • Hợp lệ: {bulkReport.validCount} • Tạo mới: {bulkReport.createdCount} • Cập nhật: {bulkReport.updatedCount} • Bỏ qua: {bulkReport.skippedCount} • Lỗi: {bulkReport.invalidCount}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setBulkOpen(false)}>Đóng</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              disabled={busy}
              onClick={() => handleRunBulkImport(true)}
              sx={{ fontWeight: 700 }}
            >
              Kiểm tra thử (Dry-Run)
            </Button>
            <Button
              variant='contained'
              disabled={busy}
              onClick={() => handleRunBulkImport(false)}
              sx={{ fontWeight: 800 }}
            >
              Thực thi Nhập Hàng loạt
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmergencyControlTab
