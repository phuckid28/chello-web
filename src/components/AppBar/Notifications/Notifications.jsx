import { useEffect, useState } from 'react'
import Badge from '@mui/material/Badge'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import DoneIcon from '@mui/icons-material/Done'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import { useDispatch, useSelector } from 'react-redux'
import {
  addNotification,
  fetchInvitationsAPI,
  selectCurrentNotifications,
  updateBoardInvitationAPI
} from '~/redux/notifications/notificationsSlice'
import {
  archiveNotification,
  fetchInboxTab,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationReceived,
  selectInboxTab,
  selectUnreadCount
} from '~/redux/inbox/inboxSlice'
import { isUnread, resolveNotificationPath } from '~/redux/inbox/inboxHelpers'
import { formatRelativeTime } from '~/components/Activity/activityHelpers'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { BOARD_INVITATION_STATUS } from '~/utils/constants'
import { REALTIME_EVENTS, subscribeRealtime } from '~/utils/realtimeStream'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'
import soraAvatar from '~/assets/sora.jpg'

function Notifications() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t, tPrimary, lang } = useTranslation()
  const invitations = useSelector(selectCurrentNotifications)
  const inboxAll = useSelector(selectInboxTab('all'))
  const unreadCount = useSelector(selectUnreadCount)
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    if (!currentUser?._id) return undefined
    dispatch(fetchInvitationsAPI())
    dispatch(fetchUnreadCount())
    dispatch(fetchInboxTab({ tab: 'all' }))

    const unsubInvite = subscribeRealtime(REALTIME_EVENTS.BOARD_INVITE, (invitation) => {
      if (String(invitation?.inviteeId) === String(currentUser._id)) {
        dispatch(addNotification(invitation))
      }
    })
    const unsubNotification = subscribeRealtime(REALTIME_EVENTS.NOTIFICATION, (notification) => {
      if (notification && (!notification.recipientId || String(notification.recipientId) === String(currentUser._id))) {
        dispatch(notificationReceived(notification))
      }
    })

    return () => {
      unsubInvite()
      unsubNotification()
    }
  }, [dispatch, currentUser?._id])

  const pendingInvitationsCount = (invitations || []).filter(
    n => n.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING
  ).length
  const totalBadge = (unreadCount || 0) + pendingInvitationsCount
  const hasUnread = totalBadge > 0

  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)
    dispatch(fetchInboxTab({ tab: 'all' }))
    dispatch(fetchUnreadCount())
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const updateBoardInvitation = (status, invitationId) => {
    dispatch(updateBoardInvitationAPI({ status, invitationId }))
      .then(res => {
        if (res.payload?.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED) {
          handleClose()
          navigate(`/boards/${res.payload.boardInvitation.boardId}`)
        }
      })
  }

  const handleOpenNotification = (item) => {
    if (isUnread(item)) {
      dispatch(markNotificationRead(item._id))
    }
    const path = resolveNotificationPath(item)
    handleClose()
    if (path) navigate(path)
  }

  const recentInboxItems = (inboxAll?.items || []).slice(0, 6)
  const isEmpty = recentInboxItems.length === 0 && (!invitations || invitations.length === 0)

  return (
    <Box>
      <Tooltip title={tPrimary('notificationsTooltip')}>
        <Badge
          color="warning"
          badgeContent={totalBadge > 0 ? totalBadge : undefined}
          sx={{ cursor: 'pointer' }}
          id="basic-button-open-notification"
          aria-controls={open ? 'basic-notification-drop-down' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClickNotificationIcon}
        >
          <NotificationsNoneIcon sx={{ color: hasUnread ? 'yellow' : 'white' }} />
        </Badge>
      </Tooltip>

      <Menu
        sx={{ mt: 2 }}
        id="basic-notification-drop-down"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button-open-notification', sx: { py: 0 } }}
      >
        <Box sx={{
          px: 2,
          py: 1.25,
          minWidth: 320,
          maxWidth: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('inboxTitle')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title={t('inboxMarkAllRead')}>
                <IconButton size="small" onClick={() => dispatch(markAllNotificationsRead())}>
                  <DoneAllRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Button
              size="small"
              endIcon={<OpenInNewRoundedIcon fontSize="inherit" />}
              onClick={() => {
                handleClose()
                navigate('/inbox')
              }}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              {t('inboxOpenFull')}
            </Button>
          </Box>
        </Box>

        {isEmpty && (
          <MenuItem sx={{ minWidth: 300, py: 2, justifyContent: 'center' }} disabled>
            {t('inboxEmpty')}
          </MenuItem>
        )}

        {recentInboxItems.map((item) => {
          const unread = isUnread(item)
          return (
            <Box key={item._id}>
              <MenuItem
                onClick={() => handleOpenNotification(item)}
                sx={{
                  minWidth: 300,
                  maxWidth: 380,
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  py: 1.25,
                  bgcolor: unread ? 'action.hover' : 'transparent'
                }}
              >
                <Avatar
                  src={item.actor?.avatar || soraAvatar}
                  alt={item.actor?.displayName || ''}
                  sx={{ width: 32, height: 32, mt: 0.25 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: unread ? 700 : 500 }}>
                    {item.title || item.body}
                  </Typography>
                  {item.body && item.title && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      {item.body}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                    {formatRelativeTime(item.createdAt, lang)}
                  </Typography>
                </Box>
                <Tooltip title={t('inboxArchive')}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch(archiveNotification(item._id))
                    }}
                  >
                    <ArchiveOutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </MenuItem>
              <Divider />
            </Box>
          )
        })}

        {invitations?.map((notification, index) => (
          <Box key={notification._id || index}>
            <MenuItem sx={{
              minWidth: 300,
              maxWidth: 380,
              overflowY: 'auto'
            }}>
              <Box sx={{ maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box><GroupAddIcon fontSize="small" /></Box>
                  <Box><strong>{notification.inviter?.displayName}</strong> {tPrimary('invitedYouToBoard')} <strong>{notification.board?.title}</strong></Box>
                </Box>

                {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      className="interceptor-loading"
                      type="submit"
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => updateBoardInvitation(BOARD_INVITATION_STATUS.ACCEPTED, notification._id)}
                    >
                      {tPrimary('acceptBtn')}
                    </Button>
                    <Button
                      className="interceptor-loading"
                      type="submit"
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => updateBoardInvitation(BOARD_INVITATION_STATUS.REJECTED, notification._id)}
                    >
                      {tPrimary('rejectBtn')}
                    </Button>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                  {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED && (
                    <Chip icon={<DoneIcon />} label={tPrimary('acceptedChip')} color="success" size="small" />
                  )}
                  {notification.boardInvitation?.status === BOARD_INVITATION_STATUS.REJECTED && (
                    <Chip icon={<NotInterestedIcon />} label={tPrimary('rejectedChip')} size="small" />
                  )}
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="span" sx={{ fontSize: '13px' }}>
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            {index !== (invitations.length - 1) && <Divider />}
          </Box>
        ))}
      </Menu>
    </Box>
  )
}

export default Notifications
