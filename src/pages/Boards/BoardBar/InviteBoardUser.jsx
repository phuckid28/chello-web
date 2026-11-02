import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { EMAIL_RULE, FIELD_REQUIRED_MESSAGE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_ROLES } from '~/utils/permissions'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import {
  createBoardInviteLinkAPI,
  fetchBoardInviteLinksAPI,
  fetchBoardMembersAPI,
  inviteUserToBoardAPI,
  removeBoardMemberAPI,
  revokeBoardInviteLinkAPI,
  updateBoardMemberRoleAPI
} from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import soraAvatar from '~/assets/sora.jpg'

const ROLE_LABEL_KEYS = {
  admin: 'workspaceRoleAdmin',
  editor: 'boardRoleEditor',
  commenter: 'boardRoleCommenter',
  viewer: 'workspaceRoleViewer'
}

function InviteBoardUser({ boardId }) {
  const { t, tPrimary } = useTranslation()
  const [anchorPopoverElement, setAnchorPopoverElement] = useState(null)
  const [members, setMembers] = useState([])
  const [inviteLinks, setInviteLinks] = useState([])
  const [linkRole, setLinkRole] = useState('editor')
  const isOpenPopover = Boolean(anchorPopoverElement)
  const popoverId = isOpenPopover ? 'invite-board-user-popover' : undefined

  const loadBoardAccess = () => {
    if (!boardId) return
    fetchBoardMembersAPI(boardId)
      .then((res) => setMembers(Array.isArray(res) ? res : (res?.members || [])))
      .catch(() => {})
    fetchBoardInviteLinksAPI(boardId)
      .then((res) => setInviteLinks(Array.isArray(res) ? res : (res?.links || [])))
      .catch(() => {})
  }

  useEffect(() => {
    if (isOpenPopover) loadBoardAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenPopover, boardId])

  const handleTogglePopover = (event) => {
    if (!anchorPopoverElement) setAnchorPopoverElement(event.currentTarget)
    else setAnchorPopoverElement(null)
  }

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const submitInviteUserToBoard = (data) => {
    const { inviteeEmail } = data
    inviteUserToBoardAPI({ inviteeEmail, boardId }).then(() => {
      setValue('inviteeEmail', null)
      loadBoardAccess()
    })
  }

  const handleCreateLink = () => {
    createBoardInviteLinkAPI(boardId, { role: linkRole })
      .then((created) => {
        const token = created?.token || created?.code
        if (token && navigator?.clipboard) {
          navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`).catch(() => {})
          toast.success(t('workspaceInviteLinkCopied'))
        }
        loadBoardAccess()
      })
      .catch(() => {})
  }

  const handleCopyLink = (token) => {
    if (!token || !navigator?.clipboard) return
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`).catch(() => {})
    toast.success(t('workspaceInviteLinkCopied'))
  }

  const handleRevokeLink = (linkId) => {
    revokeBoardInviteLinkAPI(boardId, linkId)
      .then(() => {
        toast.info(t('workspaceInviteRevokedToast'))
        loadBoardAccess()
      })
      .catch(() => {})
  }

  const handleChangeMemberRole = (userId, nextRole) => {
    updateBoardMemberRoleAPI(boardId, userId, { role: nextRole })
      .then(() => {
        toast.success(t('workspaceRoleUpdatedToast'))
        loadBoardAccess()
      })
      .catch(() => {})
  }

  const handleRemoveMember = (userId) => {
    removeBoardMemberAPI(boardId, userId)
      .then(() => {
        toast.info(t('workspaceMemberRemovedToast'))
        loadBoardAccess()
      })
      .catch(() => {})
  }

  return (
    <Box>
      <Tooltip title={tPrimary('inviteTooltip')}>
        <Button
          aria-describedby={popoverId}
          onClick={handleTogglePopover}
          variant="outlined"
          startIcon={<PersonAddAltIcon />}
          sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white' } }}
        >
          {tPrimary('inviteBtn')}
        </Button>
      </Tooltip>

      <Popover
        id={popoverId}
        open={isOpenPopover}
        anchorEl={anchorPopoverElement}
        onClose={handleTogglePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2.25, width: 360, maxWidth: '92vw', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <form onSubmit={handleSubmit(submitInviteUserToBoard)}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {tPrimary('invitePopoverTitle')}
              </Typography>
              <Box>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  label={tPrimary('inviteEmailLabel')}
                  type="text"
                  variant="outlined"
                  {...register('inviteeEmail', {
                    required: FIELD_REQUIRED_MESSAGE,
                    pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
                  })}
                  error={!!errors['inviteeEmail']}
                />
                <FieldErrorAlert errors={errors} fieldName={'inviteeEmail'} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button className="interceptor-loading" type="submit" variant="contained" color="info" size="small">
                  {tPrimary('inviteBtn')}
                </Button>
              </Box>
            </Stack>
          </form>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
              {t('workspaceInviteLinksSection')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Select
                size="small"
                value={linkRole}
                onChange={(e) => setLinkRole(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {BOARD_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {t(ROLE_LABEL_KEYS[r] || r)}
                  </MenuItem>
                ))}
              </Select>
              <Button
                size="small"
                variant="outlined"
                startIcon={<LinkRoundedIcon />}
                onClick={handleCreateLink}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                {t('workspaceInviteCreateLink')}
              </Button>
            </Box>
            {inviteLinks.map((link) => {
              const token = link.token || link.code || ''
              return (
                <Box
                  key={link._id || token}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, fontSize: '0.78rem' }}
                >
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }} noWrap>
                    /invite/{token.slice(0, 10)}… ({link.role})
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleCopyLink(token)}>
                      <ContentCopyRoundedIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleRevokeLink(link._id)}>
                      <DeleteOutlineRoundedIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </Stack>

          {members.length > 0 && (
            <>
              <Divider />
              <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                  {t('workspaceNavMembers')} ({members.length})
                </Typography>
                {members.map((m) => {
                  const uid = m.userId || m._id
                  return (
                    <Box
                      key={uid}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Avatar src={m.avatar || soraAvatar} sx={{ width: 26, height: 26 }} />
                        <Typography variant="body2" noWrap>
                          {m.displayName || m.username || m.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Select
                          size="small"
                          value={m.role || 'editor'}
                          onChange={(e) => handleChangeMemberRole(uid, e.target.value)}
                          sx={{ fontSize: '0.75rem', height: 28 }}
                        >
                          {BOARD_ROLES.map((r) => (
                            <MenuItem key={r} value={r}>
                              {t(ROLE_LABEL_KEYS[r] || r)}
                            </MenuItem>
                          ))}
                        </Select>
                        <IconButton size="small" color="error" onClick={() => handleRemoveMember(uid)}>
                          <DeleteOutlineRoundedIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            </>
          )}
        </Box>
      </Popover>
    </Box>
  )
}

export default InviteBoardUser
