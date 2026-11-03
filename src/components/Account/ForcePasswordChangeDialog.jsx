import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import { toast } from 'react-toastify'
import { selectCurrentUser, updateUserAPI, logoutUserAPI } from '~/redux/user/userSlice'
import { useTranslation } from '~/customHooks/useTranslation'
import { MONO_FONT } from '~/components/Layout/surface'

const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/

function ForcePasswordChangeDialog() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary } = useTranslation()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const open = Boolean(currentUser?.mustChangePassword)
  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!currentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại (hoặc mật khẩu tạm được cấp).')
      return
    }
    if (!PASSWORD_RULE.test(newPassword)) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số.')
      return
    }
    if (newPassword === currentPassword) {
      setErrorMsg('Mật khẩu mới phải khác mật khẩu hiện tại.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.')
      return
    }

    setSubmitting(true)
    try {
      await dispatch(updateUserAPI({ currentPassword, newPassword })).unwrap()
      toast.success(tPrimary('admFpcSuccess'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể cập nhật mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth='sm'
      fullWidth
      aria-labelledby='force-password-change-title'
    >
      <DialogTitle
        id='force-password-change-title'
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 800 }}
      >
        <LockResetRoundedIcon color='warning' />
        <span>{tPrimary('admFpcDialogTitle')}</span>
      </DialogTitle>
      <Box component='form' onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            {tPrimary('admFpcDialogSub')}
          </Typography>
          {currentUser?.passwordForceReason && (
            <Alert severity='warning' sx={{ fontFamily: MONO_FONT, fontSize: '0.8rem' }}>
              {currentUser.passwordForceReason}
            </Alert>
          )}
          {errorMsg && <Alert severity='error'>{errorMsg}</Alert>}

          <TextField
            type='password'
            required
            fullWidth
            size='small'
            label={tPrimary('admFpcCurrentPw')}
            autoComplete='current-password'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={submitting}
          />
          <TextField
            type='password'
            required
            fullWidth
            size='small'
            label={tPrimary('admFpcNewPw')}
            autoComplete='new-password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={submitting}
          />
          <TextField
            type='password'
            required
            fullWidth
            size='small'
            label={tPrimary('admFpcConfirmPw')}
            autoComplete='new-password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Button
            color='inherit'
            disabled={submitting}
            onClick={() => dispatch(logoutUserAPI(false))}
          >
            {tPrimary('logoutMenu')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='warning'
            disabled={submitting}
            sx={{ fontWeight: 800 }}
          >
            {tPrimary('admFpcSubmit')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default ForcePasswordChangeDialog
