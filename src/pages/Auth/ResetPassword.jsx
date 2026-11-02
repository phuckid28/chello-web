import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardActions from '@mui/material/CardActions'
import Alert from '@mui/material/Alert'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import { useForm } from 'react-hook-form'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import PasswordStrengthMeter from '~/components/Form/PasswordStrengthMeter'
import { resetPasswordAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import AuthLayout from './AuthLayout'
import AuthCard from './AuthCard'
import AuthFooterLink from './AuthFooterLink'
import PasswordField from './PasswordField'
import { passwordPolicyErrorKey, readResetParams } from './authHelpers'

function ResetPassword() {
  const { tPrimary, formatMessage } = useTranslation()
  const [searchParams] = useSearchParams()
  const { email, token, valid } = readResetParams(searchParams)

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { newPassword: '', confirmPassword: '' }
  })
  const [submitting, setSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [failed, setFailed] = useState(false)

  const newPasswordValue = watch('newPassword') || ''

  const onSubmit = async (data) => {
    setSubmitting(true)
    setFailed(false)
    try {
      await resetPasswordAPI({ email, token, newPassword: data.newPassword })
      setSucceeded(true)
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        chipIcon={<LockResetRoundedIcon sx={{ fontSize: '13px !important' }} />}
        heading={tPrimary('authResetTitle')}
        description={valid ? formatMessage('authResetSubtitle', { email }) : undefined}
        onSubmit={valid && !succeeded ? handleSubmit(onSubmit) : undefined}
        footer={<AuthFooterLink to='/login' label={tPrimary('authBackToLogin')} />}
      >
        {!valid && (
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Alert severity='warning' role='alert' sx={{ borderRadius: '10px', mb: 2 }}>
              {tPrimary('authResetInvalidLink')}
            </Alert>
            <Button
              component={Link}
              to='/forgot-password'
              variant='contained'
              color='primary'
              fullWidth
              sx={{ py: 1.1, fontWeight: 800 }}
            >
              {tPrimary('authRequestNewLink')}
            </Button>
          </Box>
        )}

        {valid && succeeded && (
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Alert severity='success' role='status' sx={{ borderRadius: '10px', mb: 2 }}>
              {tPrimary('authResetSuccess')}
            </Alert>
            <Button
              component={Link}
              to={`/login?verifiedEmail=${encodeURIComponent(email)}`}
              variant='contained'
              color='primary'
              fullWidth
              sx={{ py: 1.1, fontWeight: 800 }}
            >
              {tPrimary('authGoToLogin')}
            </Button>
          </Box>
        )}

        {valid && !succeeded && (
          <>
            <Box sx={{ px: 3, pt: 1.5, pb: 2 }}>
              {failed && (
                <Alert
                  severity='error'
                  role='alert'
                  sx={{ mb: 1.5, borderRadius: '10px' }}
                  action={
                    <Button
                      component={Link}
                      to='/forgot-password'
                      color='inherit'
                      size='small'
                      sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                    >
                      {tPrimary('authRequestNewLink')}
                    </Button>
                  }
                >
                  {tPrimary('authResetFailed')}
                </Alert>
              )}

              <Box sx={{ mt: 1 }}>
                <PasswordField
                  autoFocus
                  label={tPrimary('authNewPasswordLabel')}
                  autoComplete='new-password'
                  aria-describedby='reset-password-strength'
                  error={Boolean(errors.newPassword)}
                  {...register('newPassword', {
                    required: tPrimary('authFieldRequired'),
                    validate: (val) => {
                      const errKey = passwordPolicyErrorKey(val)
                      return errKey ? tPrimary(errKey) : true
                    }
                  })}
                />
                <PasswordStrengthMeter id='reset-password-strength' password={newPasswordValue} />
                <FieldErrorAlert errors={errors} fieldName='newPassword' />
              </Box>

              <Box sx={{ mt: 2 }}>
                <PasswordField
                  label={tPrimary('authConfirmPasswordLabel')}
                  autoComplete='new-password'
                  error={Boolean(errors.confirmPassword)}
                  {...register('confirmPassword', {
                    required: tPrimary('authFieldRequired'),
                    validate: (value) => {
                      if (value === watch('newPassword')) return true
                      return tPrimary('passwordMismatchMsg')
                    }
                  })}
                />
                <FieldErrorAlert errors={errors} fieldName='confirmPassword' />
              </Box>
            </Box>

            <CardActions sx={{ px: 3, pb: 2 }}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                size='large'
                fullWidth
                disabled={submitting}
                sx={{ py: 1.2, fontWeight: 800 }}
              >
                {tPrimary('authResetSubmit')}
              </Button>
            </CardActions>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  )
}

export default ResetPassword
