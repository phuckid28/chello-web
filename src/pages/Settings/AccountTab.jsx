import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MailIcon from '@mui/icons-material/Mail'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'

import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import soraAvatar from '~/assets/sora.jpg'

function AccountTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary } = useTranslation()
  const { themeConfig } = usePersonaTheme()

  const initialGeneralForm = {
    displayName: currentUser?.displayName || '',
    avatar: currentUser?.avatar || ''
  }
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialGeneralForm
  })

  const submitChangeGeneralInformation = (data) => {
    const { displayName, avatar } = data

    if (displayName === currentUser?.displayName && (avatar || null) === (currentUser?.avatar || null)) return

    toast.promise(
      dispatch(updateUserAPI({ displayName, avatar })),
      { pending: tPrimary('updatingToast') }
    ).then(res => {
      if (!res.error) {
        toast.success(tPrimary('userUpdatedToast'))
      }
    })
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
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        pb: 2.5,
        mb: 3,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              border: `2px solid ${themeConfig.accentColor}`
            }}
            alt={currentUser?.displayName}
            src={currentUser?.avatar || soraAvatar}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.015em' }}>
              {currentUser?.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              @{currentUser?.username}
            </Typography>
          </Box>
        </Box>
        <Chip
          size="small"
          label={themeConfig.element}
          sx={{
            fontWeight: 700,
            color: themeConfig.accentColor,
            bgcolor: themeConfig.badgeBg,
            border: `1px solid ${themeConfig.columnBorder}`
          }}
        />
      </Box>

      <form onSubmit={handleSubmit(submitChangeGeneralInformation)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              disabled
              defaultValue={currentUser?.email}
              fullWidth
              label={tPrimary('yourEmailLabel')}
              type="text"
              variant="filled"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              disabled
              defaultValue={currentUser?.username}
              fullWidth
              label={tPrimary('yourUsernameLabel')}
              type="text"
              variant="filled"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBoxIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label={tPrimary('yourDisplayNameLabel')}
              type="text"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentIndIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              {...register('displayName', {
                required: FIELD_REQUIRED_MESSAGE
              })}
              error={!!errors['displayName']}
            />
            <FieldErrorAlert errors={errors} fieldName={'displayName'} />
          </Box>

          <Box>
            <TextField
              fullWidth
              label={tPrimary('avatarUrlLabel')}
              type="text"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              {...register('avatar')}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              color="primary"
              sx={{ px: 3.5, py: 1, fontWeight: 800 }}
            >
              {t('updateBtn')}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  )
}

export default AccountTab
