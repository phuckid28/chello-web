import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import DoneIcon from '@mui/icons-material/Done'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import PageShell from '~/components/Layout/PageShell'
import { surfaceSx } from '~/components/Layout/surface'
import {
  archiveNotification,
  fetchInboxTab,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  selectInboxTab,
  selectUnreadCount
} from '~/redux/inbox/inboxSlice'
import {
  fetchInvitationsAPI,
  selectCurrentNotifications,
  updateBoardInvitationAPI
} from '~/redux/notifications/notificationsSlice'
import { INBOX_TABS, isUnread, resolveNotificationPath } from '~/redux/inbox/inboxHelpers'
import { formatRelativeTime } from '~/components/Activity/activityHelpers'
import { BOARD_INVITATION_STATUS } from '~/utils/constants'
import { useTranslation } from '~/customHooks/useTranslation'
import soraAvatar from '~/assets/sora.jpg'

const TAB_LABEL_KEYS = {
  all: 'inboxTabAll',
  unread: 'inboxTabUnread',
  mention: 'inboxTabMention',
  assigned: 'inboxTabAssigned',
  invite: 'inboxTabInvite'
}

function InboxPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, tPrimary, lang } = useTranslation()
  const [activeTab, setActiveTab] = useState('all')
  const tabState = useSelector(selectInboxTab(activeTab))
  const unreadCount = useSelector(selectUnreadCount)
  const invitations = useSelector(selectCurrentNotifications)

  useEffect(() => {
    dispatch(fetchInboxTab({ tab: activeTab }))
    dispatch(fetchUnreadCount())
    dispatch(fetchInvitationsAPI())
  }, [dispatch, activeTab])

  const handleOpenItem = (item) => {
    if (isUnread(item)) {
      dispatch(markNotificationRead(item._id))
    }
    const path = resolveNotificationPath(item)
    if (path) navigate(path)
  }

  const handleLoadMore = () => {
    if (!tabState?.nextCursor || tabState?.loading) return
    dispatch(fetchInboxTab({ tab: activeTab, cursor: tabState.nextCursor }))
  }

  const handleInvitationAction = (status, invitationId) => {
    dispatch(updateBoardInvitationAPI({ status, invitationId }))
      .then((res) => {
        if (res.payload?.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED) {
          navigate(`/boards/${res.payload.boardInvitation.boardId}`)
        }
      })
  }

  const showLegacyInvites = activeTab === 'all' || activeTab === 'invite'
  const legacyInvites = showLegacyInvites ? (invitations || []) : []
  const items = tabState?.items || []
  const isEmpty = !tabState?.loading && items.length === 0 && legacyInvites.length === 0

  return (
    <PageShell
      index={1}
      eyebrow={t('inboxEyebrow')}
      title={t('inboxTitle')}
      subtitle={t('inboxSubtitle')}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<DoneAllRoundedIcon />}
          disabled={!unreadCount}
          onClick={() => dispatch(markAllNotificationsRead())}
        >
          {t('inboxMarkAllRead')}
        </Button>
      }
    >
      <Paper sx={{ ...surfaceSx, p: 0, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, next) => setActiveTab(next)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {INBOX_TABS.map((tab) => (
              <Tab
                key={tab}
                value={tab}
                label={
                  tab === 'unread' && unreadCount > 0
                    ? `${t(TAB_LABEL_KEYS[tab])} (${unreadCount})`
                    : t(TAB_LABEL_KEYS[tab])
                }
              />
            ))}
          </Tabs>
        </Box>

        {tabState?.loading && items.length === 0 && (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {isEmpty && (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {activeTab === 'unread' ? t('inboxEmptyUnread') : t('inboxEmpty')}
            </Typography>
          </Box>
        )}

        <Stack divider={<Divider />}>
          {items.map((item) => {
            const unread = isUnread(item)
            return (
              <Box
                key={item._id}
                onClick={() => handleOpenItem(item)}
                sx={{
                  px: 2.5,
                  py: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  cursor: resolveNotificationPath(item) ? 'pointer' : 'default',
                  bgcolor: unread ? 'action.hover' : 'transparent',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Avatar
                  src={item.actor?.avatar || soraAvatar}
                  alt={item.actor?.displayName || ''}
                  sx={{ width: 40, height: 40, mt: 0.25 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: unread ? 700 : 600 }}>
                      {item.title || item.body}
                    </Typography>
                    {item.type && (
                      <Chip size="small" label={item.type} variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                    )}
                  </Box>
                  {item.body && item.title && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.body}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
                    {formatRelativeTime(item.createdAt, lang)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title={unread ? t('inboxMarkRead') : t('inboxMarkUnread')}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        dispatch(unread ? markNotificationRead(item._id) : markNotificationUnread(item._id))
                      }
                    >
                      {unread ? (
                        <MarkEmailReadOutlinedIcon fontSize="small" />
                      ) : (
                        <MarkEmailUnreadOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('inboxArchive')}>
                    <IconButton
                      size="small"
                      onClick={() => dispatch(archiveNotification(item._id))}
                    >
                      <ArchiveOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )
          })}

          {legacyInvites.map((invite, idx) => (
            <Box
              key={invite._id || idx}
              sx={{
                px: 2.5,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={invite.inviter?.avatar || soraAvatar} sx={{ width: 38, height: 38 }} />
                <Box>
                  <Typography variant="body2">
                    <strong>{invite.inviter?.displayName}</strong> {tPrimary('invitedYouToBoard')}{' '}
                    <strong>{invite.board?.title}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(invite.createdAt, lang)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {invite.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleInvitationAction(BOARD_INVITATION_STATUS.ACCEPTED, invite._id)}
                    >
                      {tPrimary('acceptBtn')}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleInvitationAction(BOARD_INVITATION_STATUS.REJECTED, invite._id)}
                    >
                      {tPrimary('rejectBtn')}
                    </Button>
                  </>
                )}
                {invite.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED && (
                  <Chip icon={<DoneIcon />} label={tPrimary('acceptedChip')} color="success" size="small" />
                )}
                {invite.boardInvitation?.status === BOARD_INVITATION_STATUS.REJECTED && (
                  <Chip icon={<NotInterestedIcon />} label={tPrimary('rejectedChip')} size="small" />
                )}
              </Box>
            </Box>
          ))}
        </Stack>

        {tabState?.nextCursor && (
          <Box sx={{ p: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
            <Button variant="outlined" size="small" onClick={handleLoadMore} disabled={tabState.loading}>
              {t('inboxLoadMore')}
            </Button>
          </Box>
        )}
      </Paper>
    </PageShell>
  )
}

export default InboxPage
