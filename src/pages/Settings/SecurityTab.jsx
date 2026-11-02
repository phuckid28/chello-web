import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { logoutUserAPI, updateUserAPI } from '~/redux/user/userSlice'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'

function SecurityTab() {
  const dispatch = useDispatch()
  const { t, tPrimary } = useTranslation()
  const { themeConfig } = usePersonaTheme()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const confirmChangePassword = useConfirm()
  const submitChangePassword = (data) => {
    confirmChangePassword({
      title: <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LogoutIcon sx={{ color: 'warning.dark' }} /> {tPrimary('changePasswordConfirmTitle')}
      </Box>,
      description: tPrimary('changePasswordConfirmDesc'),
      confirmationText: tPrimary('confirmBtn'),
      cancellationText: tPrimary('cancelBtn')
    }).then(() => {
      const { current_password, new_password } = data

      toast.promise(
        dispatch(updateUserAPI({ current_password, new_password })),
        { pending: tPrimary('updatingToast') }
      ).then(res => {
        if (!res.error) {
          toast.success(tPrimary('passwordChangedToast'))
          dispatch(logoutUserAPI(false))
        }
      })
    }).catch(() => {})
  }

  return (
    <Box sx={{
      maxWidth: '640px',
      mx: 'auto',
      p: { xs: 2.5, md: 3.5 },
      borderRadius: 'var(--chella-radius-card, 14px)',
      bgcolor: (theme) => (theme.palette.mode === 'dark'
        ? 'var(--chella-raised-dark, #131c31)'
        : 'var(--chella-raised-light, #ffffff)'),
      border: `1px solid ${themeConfig.columnBorder}`,
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)'
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pb: 2,
        mb: 3,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{
          width: 42,
          height: 42,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: themeConfig.badgeBg,
          border: `1px solid ${themeConfig.columnBorder}`,
          color: themeConfig.accentColor
        }}>
          <ShieldOutlinedIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.015em' }}>
            {t('securityDashboardTitle')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {tPrimary('changePasswordConfirmDesc')}
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(submitChangePassword)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          <Box>
            <TextField
              fullWidth
              label={tPrimary('currentPasswordLabel')}
              type="password"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PasswordIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              {...register('current_password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: PASSWORD_RULE,
                  message: PASSWORD_RULE_MESSAGE
                }
              })}
              error={!!errors['current_password']}
            />
            <FieldErrorAlert errors={errors} fieldName={'current_password'} />
          </Box>

          <Box>
            <TextField
              fullWidth
              label={tPrimary('newPasswordLabel')}
              type="password"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              {...register('new_password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: {
                  value: PASSWORD_RULE,
                  message: PASSWORD_RULE_MESSAGE
                }
              })}
              error={!!errors['new_password']}
            />
            <FieldErrorAlert errors={errors} fieldName={'new_password'} />
          </Box>

          <Box>
            <TextField
              fullWidth
              label={tPrimary('newPasswordConfirmLabel')}
              type="password"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockResetIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              {...register('new_password_confirmation', {
                validate: (value) => {
                  if (value === watch('new_password')) return true
                  return tPrimary('passwordMismatchMsg')
                }
              })}
              error={!!errors['new_password_confirmation']}
            />
            <FieldErrorAlert errors={errors} fieldName={'new_password_confirmation'} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              color="primary"
              sx={{ px: 3.5, py: 1, fontWeight: 800 }}
            >
              {t('changePasswordBtn')}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  )
}

export default SecurityTab
