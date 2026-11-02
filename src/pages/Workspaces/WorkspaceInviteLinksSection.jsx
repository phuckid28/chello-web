import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { toast } from 'react-toastify'
import { surfaceSx } from '~/components/Layout/surface'
import {
  inviteToWorkspaceByEmailAPI,
  createWorkspaceInviteLinkAPI,
  revokeWorkspaceInviteLinkAPI
} from '~/apis'
import {
  isValidEmail,
  buildInviteLinkPayload,
  inviteLinkStatus
} from '~/components/Workspace/workspaceValidation'
import { inviteLinkRoles, roleLabelKey } from '~/utils/workspaceTree'
import { useTranslation } from '~/customHooks/useTranslation'

function WorkspaceInviteLinksSection({
  workspaceId,
  canManageMembers,
  canManageWorkspace,
  inviteLinks = [],
  onLinksChange
}) {
  const { tPrimary, formatMessage } = useTranslation()
  const roleOptions = inviteLinkRoles()

  // Email invite state
  const [email, setEmail] = useState('')
  const [emailRole, setEmailRole] = useState('member')
  const [emailTouched, setEmailTouched] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Invite link creation state
  const [linkRole, setLinkRole] = useState('member')
  const [expiresInHours, setExpiresInHours] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [creatingLink, setCreatingLink] = useState(false)
  const [createdUrl, setCreatedUrl] = useState('')

  const emailValid = isValidEmail(email)
  const { errors: linkErrors, payload: linkPayload } = buildInviteLinkPayload({
    role: linkRole,
    expiresInHours,
    maxUses
  })

  const handleSendEmailInvite = async (e) => {
    e.preventDefault()
    setEmailTouched(true)
    if (!emailValid || sendingEmail) return
    setSendingEmail(true)
    try {
      const cleanEmail = email.trim()
      await inviteToWorkspaceByEmailAPI(workspaceId, { email: cleanEmail, role: emailRole })
      toast.success(formatMessage('wsInviteSent', { email: cleanEmail }))
      setEmail('')
      setEmailTouched(false)
    } finally {
      setSendingEmail(false)
    }
  }

  const handleCreateInviteLink = async (e) => {
    e.preventDefault()
    if (!linkPayload || creatingLink) return
    setCreatingLink(true)
    try {
      const created = await createWorkspaceInviteLinkAPI(workspaceId, linkPayload)
      const token = created?.token || created?.inviteLink?.token || ''
      const fullUrl = created?.url || (token ? `${window.location.origin}/invite/${token}` : '')
      setCreatedUrl(fullUrl)
      setExpiresInHours('')
      setMaxUses('')
      toast.success(tPrimary('wsLinkCreated'))
      if (onLinksChange) onLinksChange()
    } finally {
      setCreatingLink(false)
    }
  }

  const handleCopyUrl = async (urlToCopy) => {
    if (!urlToCopy) return
    try {
      await navigator.clipboard.writeText(urlToCopy)
      toast.success(tPrimary('wsLinkCopied'))
    } catch (err) {
      toast.error(tPrimary('wsLinkCopyFailed'))
    }
  }

  const handleRevokeLink = async (linkId) => {
    if (!linkId) return
    await revokeWorkspaceInviteLinkAPI(workspaceId, linkId)
    toast.success(tPrimary('wsLinkRevoked'))
    if (onLinksChange) onLinksChange()
  }

  const renderLinkStatusChip = (link) => {
    const status = inviteLinkStatus(link)
    if (status.expired) {
      return <Chip size='small' color='error' label={tPrimary('wsLinkExpired')} />
    }
    if (status.exhausted) {
      return <Chip size='small' color='warning' label={tPrimary('wsLinkExhausted')} />
    }
    if (link.expiresAt) {
      const dateStr = new Date(link.expiresAt).toLocaleDateString()
      return <Chip size='small' variant='outlined' label={formatMessage('wsLinkExpires', { date: dateStr })} />
    }
    return <Chip size='small' variant='outlined' label={tPrimary('wsLinkNoExpiry')} />
  }

  return (
    <Stack spacing={3}>
      {canManageMembers && (
        <Box sx={surfaceSx}>
          <Typography variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
            {tPrimary('wsInviteEmailTitle')}
          </Typography>
          <Box component='form' onSubmit={handleSendEmailInvite} noValidate>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
              <TextField
                label={tPrimary('wsInviteEmailLabel')}
                type='email'
                size='small'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                error={Boolean(emailTouched && email && !emailValid)}
                helperText={emailTouched && email && !emailValid ? tPrimary('wsEmailInvalid') : ''}
                sx={{ flex: 1 }}
              />
              <FormControl size='small' sx={{ minWidth: 160 }}>
                <InputLabel id='invite-email-role-label'>{tPrimary('wsInviteRoleLabel')}</InputLabel>
                <Select
                  labelId='invite-email-role-label'
                  label={tPrimary('wsInviteRoleLabel')}
                  value={emailRole}
                  onChange={(e) => setEmailRole(e.target.value)}
                >
                  {roleOptions.map((r) => (
                    <MenuItem key={r} value={r}>
                      {tPrimary(roleLabelKey(r))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type='submit'
                variant='contained'
                startIcon={<SendRoundedIcon />}
                disabled={sendingEmail || !emailValid}
                sx={{ textTransform: 'none', fontWeight: 700, height: 40 }}
              >
                {tPrimary('wsInviteSend')}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      {canManageWorkspace && (
        <Box sx={surfaceSx}>
          <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
            {tPrimary('wsLinksTitle')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {tPrimary('wsLinksHelp')}
          </Typography>

          <Box component='form' onSubmit={handleCreateInviteLink} noValidate sx={{ mb: 2.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel id='invite-link-role-label'>{tPrimary('wsInviteRoleLabel')}</InputLabel>
                <Select
                  labelId='invite-link-role-label'
                  label={tPrimary('wsInviteRoleLabel')}
                  value={linkRole}
                  onChange={(e) => setLinkRole(e.target.value)}
                >
                  {roleOptions.map((r) => (
                    <MenuItem key={r} value={r}>
                      {tPrimary(roleLabelKey(r))}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label={tPrimary('wsLinkExpiry')}
                size='small'
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                error={Boolean(linkErrors.expiresInHours)}
                helperText={
                  linkErrors.expiresInHours
                    ? tPrimary(linkErrors.expiresInHours)
                    : `${tPrimary('wsLinkExpiryRule')} • ${tPrimary('wsLinkOptional')}`
                }
                sx={{ width: { xs: '100%', sm: 200 } }}
              />

              <TextField
                label={tPrimary('wsLinkMaxUses')}
                size='small'
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                error={Boolean(linkErrors.maxUses)}
                helperText={
                  linkErrors.maxUses
                    ? tPrimary(linkErrors.maxUses)
                    : `${tPrimary('wsLinkMaxUsesRule')} • ${tPrimary('wsLinkOptional')}`
                }
                sx={{ width: { xs: '100%', sm: 200 } }}
              />

              <Button
                type='submit'
                variant='contained'
                startIcon={<LinkRoundedIcon />}
                disabled={creatingLink || !linkPayload}
                sx={{ textTransform: 'none', fontWeight: 700, height: 40 }}
              >
                {tPrimary('wsLinkCreate')}
              </Button>
            </Stack>
          </Box>

          {createdUrl && (
            <Alert
              severity='success'
              sx={{ mb: 2.5 }}
              action={
                <Button
                  color='inherit'
                  size='small'
                  startIcon={<ContentCopyRoundedIcon fontSize='small' />}
                  onClick={() => handleCopyUrl(createdUrl)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {tPrimary('wsLinkCopy')}
                </Button>
              }
            >
              <Typography variant='body2' sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
                {createdUrl}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {tPrimary('wsLinkHiddenUrl')}
              </Typography>
            </Alert>
          )}

          {inviteLinks.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {tPrimary('wsLinksEmpty')}
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {inviteLinks.map((link) => {
                const usesLabel = link.maxUses
                  ? formatMessage('wsLinkUses', { uses: link.uses || 0, max: link.maxUses })
                  : formatMessage('wsLinkUsesUnlimited', { uses: link.uses || 0 })
                return (
                  <Box
                    key={link._id || link.token}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                      <Chip
                        size='small'
                        color='primary'
                        label={tPrimary(roleLabelKey(link.role || 'member'))}
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip size='small' variant='outlined' label={usesLabel} />
                      {renderLinkStatusChip(link)}
                    </Stack>

                    <Button
                      size='small'
                      color='error'
                      startIcon={<DeleteOutlineRoundedIcon fontSize='small' />}
                      onClick={() => handleRevokeLink(link._id)}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      {tPrimary('wsLinkRevoke')}
                    </Button>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Box>
      )}
    </Stack>
  )
}

export default WorkspaceInviteLinksSection
