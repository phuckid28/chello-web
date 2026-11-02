import { useState, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { updateStatusAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import { setFocusFromUser } from '~/utils/focusMode'
import { MONO_FONT } from '~/components/Layout/surface'

const EMOJI_PRESETS = ['💬', '🎯', '📅', '🌴', '🚀', '☕', '🛠️', '📚']
const MAX_STATUS_TEXT = 80

const MODE_OPTIONS = [
  { value: 'available', labelKey: 'profModeAvailable', color: '#22c55e' },
  { value: 'focus', labelKey: 'profModeFocus', color: '#a855f7' },
  { value: 'meeting', labelKey: 'profModeMeeting', color: '#f59e0b' },
  { value: 'ooo', labelKey: 'profModeOoo', color: '#64748b' }
]

const CLEAR_OPTIONS = [
  { value: 'never', labelKey: 'profClearNever' },
  { value: '30m', labelKey: 'profClear30m' },
  { value: '1h', labelKey: 'profClear1h' },
  { value: '4h', labelKey: 'profClear4h' },
  { value: 'today', labelKey: 'profClearToday' },
  { value: 'week', labelKey: 'profClearWeek' }
]

const computeUntilTimestamp = (durationKey) => {
  const now = new Date()
  if (durationKey === '30m') return now.getTime() + 30 * 60 * 1000
  if (durationKey === '1h') return now.getTime() + 60 * 60 * 1000
  if (durationKey === '4h') return now.getTime() + 4 * 60 * 60 * 1000
  if (durationKey === 'today') {
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    return endOfDay.getTime()
  }
  if (durationKey === 'week') {
    const dayOfWeek = now.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59, 999)
    return endOfWeek.getTime()
  }
  return null
}

function StatusDialog({ open, onClose, onSaved }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary, formatMessage, lang } = useTranslation()

  const existingStatus = currentUser?.status || {}
  const [emoji, setEmoji] = useState(existingStatus.emoji || '💬')
  const [text, setText] = useState(existingStatus.text || '')
  const [mode, setMode] = useState(existingStatus.mode || 'available')
  const [clearAfter, setClearAfter] = useState('never')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const st = currentUser?.status || {}
    setEmoji(st.emoji || '💬')
    setText(st.text || '')
    setMode(st.mode || 'available')
    setClearAfter('never')
  }, [open, currentUser?.status])

  const applyUserUpdate = (updatedUser, fallbackStatus) => {
    const nextUser = updatedUser && updatedUser._id
      ? updatedUser
      : { ...currentUser, status: fallbackStatus }
    dispatch(setCurrentUser(nextUser))
    setFocusFromUser(nextUser)
    if (onSaved) onSaved(nextUser)
  }

  const handleSave = async () => {
    setSaving(true)
    const until = computeUntilTimestamp(clearAfter)
    const payload = {
      emoji: emoji || '',
      text: text.trim().slice(0, MAX_STATUS_TEXT),
      mode: mode || 'available',
      until
    }
    try {
      const updatedUser = await updateStatusAPI(payload)
      applyUserUpdate(updatedUser, payload)
      toast.success(tPrimary('profStatusSaved'))
      onClose()
    } catch {
      // Interceptor displays error toast if needed
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    setSaving(true)
    const clearedPayload = { emoji: '', text: '', mode: 'available', until: null }
    try {
      const updatedUser = await updateStatusAPI(clearedPayload)
      applyUserUpdate(updatedUser, clearedPayload)
      toast.info(tPrimary('profStatusCleared'))
      onClose()
    } catch {
      // Interceptor displays error toast if needed
    } finally {
      setSaving(false)
    }
  }

  const existingUntil = Number(existingStatus.until)
  const hasFutureUntil = Boolean(existingStatus.until && Number.isFinite(existingUntil) && existingUntil > Date.now())
  const untilLabel = hasFutureUntil
    ? formatMessage('profStatusUntil', {
      time: new Date(existingUntil).toLocaleString(lang, { dateStyle: 'short', timeStyle: 'short' })
    })
    : ''

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        {t('profStatusDialogTitle')}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Box>
          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
            {t('profStatusEmojiLabel')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {EMOJI_PRESETS.map((item) => {
              const selected = emoji === item
              return (
                <Button
                  key={item}
                  variant={selected ? 'contained' : 'outlined'}
                  size='small'
                  onClick={() => setEmoji(selected ? '' : item)}
                  sx={{ minWidth: 40, px: 1, fontSize: '1.1rem', lineHeight: 1.2 }}
                >
                  {item}
                </Button>
              )
            })}
          </Box>
        </Box>

        <TextField
          fullWidth
          size='small'
          label={tPrimary('profStatusPlaceholder')}
          placeholder={tPrimary('profStatusPlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_STATUS_TEXT))}
          inputProps={{ maxLength: MAX_STATUS_TEXT }}
          helperText={(
            <Box component='span' sx={{ fontFamily: MONO_FONT, fontSize: '0.72rem' }}>
              {text.length}/{MAX_STATUS_TEXT}
              {untilLabel ? ` · ${untilLabel}` : ''}
            </Box>
          )}
        />

        <Box>
          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
            {t('profStatusMode')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {MODE_OPTIONS.map((opt) => {
              const selected = mode === opt.value
              return (
                <Chip
                  key={opt.value}
                  label={t(opt.labelKey)}
                  onClick={() => setMode(opt.value)}
                  variant={selected ? 'filled' : 'outlined'}
                  color={selected ? 'primary' : 'default'}
                  icon={(
                    <Box
                      component='span'
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: opt.color,
                        display: 'inline-block',
                        ml: 1
                      }}
                    />
                  )}
                  sx={{ fontWeight: 700 }}
                />
              )
            })}
          </Box>
        </Box>

        {mode === 'focus' && (
          <Alert severity='info' sx={{ py: 0.5, fontSize: '0.8rem' }}>
            {t('profFocusHint')}
          </Alert>
        )}

        <FormControl fullWidth size='small'>
          <InputLabel id='status-clear-after-label'>{t('profClearAfter')}</InputLabel>
          <Select
            labelId='status-clear-after-label'
            label={t('profClearAfter')}
            value={clearAfter}
            onChange={(e) => setClearAfter(e.target.value)}
          >
            {CLEAR_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button
          color='inherit'
          size='small'
          disabled={saving}
          onClick={handleClear}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('profClearStatus')}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color='inherit'
            size='small'
            disabled={saving}
            onClick={onClose}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('v7Cancel')}
          </Button>
          <Button
            variant='contained'
            size='small'
            disabled={saving}
            onClick={handleSave}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {saving ? t('v7Saving') : t('v7Save')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default StatusDialog
