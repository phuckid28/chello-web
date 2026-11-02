import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { updateNotificationSettingsAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import SettingsSection, { SettingsStack } from '../components/SettingsSection'
import { apiErrorMessage } from '../utils/format'
import {
  DIGEST_OPTIONS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
  buildNotificationSettings,
  isSameSettings,
  notificationTypeKey,
  setChannelForAll,
  toggleChannel
} from '../utils/preferences'

const DIGEST_LABELS = {
  off: 'setDigestOff',
  daily: 'setDigestDaily',
  weekly: 'setDigestWeekly'
}

const CHANNEL_LABELS = {
  inApp: 'setNotifColInApp',
  email: 'setNotifColEmail'
}

function NotificationsTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary } = useTranslation()

  const savedSettings = useMemo(
    () => buildNotificationSettings(currentUser?.notificationSettings),
    [currentUser?.notificationSettings]
  )
  const [form, setForm] = useState(savedSettings)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(savedSettings)
  }, [savedSettings])

  const unchanged = isSameSettings(form, savedSettings)

  const handleToggleColumn = (channel) => {
    const allOn = NOTIFICATION_TYPES.every((type) => Boolean(form.channels[type]?.[channel]))
    setForm((prev) => setChannelForAll(prev, channel, !allOn))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateNotificationSettingsAPI(form)
      const nextUser = res?.user || res
      if (nextUser && typeof nextUser === 'object') {
        dispatch(setCurrentUser(nextUser))
      }
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      toast.error(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsStack>
      <SettingsSection
        index={1}
        label={tPrimary('setTabNotifications')}
        title={t('setTabNotifications')}
        description={tPrimary('setNotifMatrixDesc')}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 2,
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              Event
            </Typography>
            {NOTIFICATION_CHANNELS.map((channel) => (
              <Box key={channel} sx={{ textAlign: 'center', minWidth: 96 }}>
                <Typography variant='caption' sx={{ fontWeight: 700, display: 'block' }}>
                  {tPrimary(CHANNEL_LABELS[channel])}
                </Typography>
                <Button size='small' variant='text' onClick={() => handleToggleColumn(channel)} sx={{ fontSize: '0.68rem', py: 0 }}>
                  {tPrimary('setNotifToggleAll')}
                </Button>
              </Box>
            ))}
          </Box>

          {NOTIFICATION_TYPES.map((type) => (
            <Box
              key={type}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 2,
                alignItems: 'center',
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {tPrimary(notificationTypeKey(type))}
              </Typography>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <Box key={channel} sx={{ textAlign: 'center', minWidth: 96 }}>
                  <Switch
                    size='small'
                    checked={Boolean(form.channels[type]?.[channel])}
                    onChange={() => setForm((prev) => toggleChannel(prev, type, channel))}
                    inputProps={{ 'aria-label': `${tPrimary(notificationTypeKey(type))} - ${tPrimary(CHANNEL_LABELS[channel])}` }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </SettingsSection>

      <SettingsSection
        index={2}
        label={tPrimary('setTabNotifications')}
        title={t('setQuietHoursTitle')}
      >
        <Stack spacing={2.25}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              {tPrimary('setQuietHoursEnable')}
            </Typography>
            <Switch
              checked={form.quietHours.enabled}
              onChange={(e) => setForm((prev) => ({
                ...prev,
                quietHours: { ...prev.quietHours, enabled: e.target.checked }
              }))}
            />
          </Box>

          <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap' useFlexGap>
            <TextField
              size='small'
              type='time'
              disabled={!form.quietHours.enabled}
              value={form.quietHours.start}
              onChange={(e) => setForm((prev) => ({
                ...prev,
                quietHours: { ...prev.quietHours, start: e.target.value }
              }))}
            />
            <Typography variant='body2' color='text.secondary'>–</Typography>
            <TextField
              size='small'
              type='time'
              disabled={!form.quietHours.enabled}
              value={form.quietHours.end}
              onChange={(e) => setForm((prev) => ({
                ...prev,
                quietHours: { ...prev.quietHours, end: e.target.value }
              }))}
            />
          </Stack>

          <TextField
            select
            size='small'
            label={tPrimary('setDigestLabel')}
            value={form.emailDigest}
            onChange={(e) => setForm((prev) => ({ ...prev, emailDigest: e.target.value }))}
            sx={{ maxWidth: 280 }}
          >
            {DIGEST_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{tPrimary(DIGEST_LABELS[opt])}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant='contained' disabled={saving || unchanged} onClick={handleSave} sx={{ px: 3.5, fontWeight: 800 }}>
              {saving ? tPrimary('v7Saving') : tPrimary('v7Save')}
            </Button>
          </Box>
        </Stack>
      </SettingsSection>
    </SettingsStack>
  )
}

export default NotificationsTab
