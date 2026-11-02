import { useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import { useNavigate } from 'react-router-dom'
import { fetchBoardActivityAPI } from '~/apis'
import {
  activityTargetPath,
  activityVerbKey,
  formatRelativeTime,
  groupByDay
} from '~/components/Activity/activityHelpers'
import { useTranslation } from '~/customHooks/useTranslation'
import soraAvatar from '~/assets/sora.jpg'

function BoardActivityDrawer({ open, onClose, boardId }) {
  const navigate = useNavigate()
  const { t, lang, formatMessage } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !boardId) return
    setLoading(true)
    fetchBoardActivityAPI(boardId)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || [])
        setItems(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, boardId])

  const dayGroups = groupByDay(items)

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, maxWidth: '92vw', p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryRoundedIcon color="primary" />
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {t('collabActivityTitle')}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={26} />
            </Box>
          ) : dayGroups.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              {t('collabActivityEmpty')}
            </Typography>
          ) : (
            <Stack spacing={2.5}>
              {dayGroups.map((group) => (
                <Box key={group.key}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {group.key}
                  </Typography>
                  <Stack spacing={1.25} sx={{ mt: 1 }}>
                    {group.items.map((act, idx) => {
                      const targetPath = activityTargetPath(act)
                      const sentence = formatMessage(activityVerbKey(act.verb), {
                        actor: act.actor?.displayName || act.actor?.username || 'User',
                        target: act.meta?.title || act.targetTitle || '',
                        status: act.meta?.status || '',
                        role: act.meta?.role || ''
                      })
                      return (
                        <Box
                          key={act._id || idx}
                          onClick={() => {
                            if (targetPath) {
                              onClose()
                              navigate(targetPath)
                            }
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.25,
                            p: 1,
                            borderRadius: 1.5,
                            cursor: targetPath ? 'pointer' : 'default',
                            '&:hover': targetPath ? { bgcolor: 'action.hover' } : undefined
                          }}
                        >
                          <Avatar
                            src={act.actor?.avatar || soraAvatar}
                            sx={{ width: 28, height: 28, mt: 0.25 }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2">{sentence}</Typography>
                            <Typography variant="caption" color="text.disabled">
                              {formatRelativeTime(act.createdAt, lang)}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

export default BoardActivityDrawer
