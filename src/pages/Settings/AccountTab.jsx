import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
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
import soraAvatar from '~/assets/sora.jpg'

function AccountTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

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
      { pending: 'Updating...' }
    ).then(res => {
      if (!res.error) {
        toast.success('User updated successfully!')
      }
    })
  }

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 84, height: 84 }}
            alt={currentUser?.displayName}
            src={currentUser?.avatar || soraAvatar}
          />
          <Box>
            <Typography variant="h6">{currentUser?.displayName}</Typography>
            <Typography sx={{ color: 'grey' }}>@{currentUser?.username}</Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit(submitChangeGeneralInformation)}>
          <Box sx={{ width: '400px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                disabled
                defaultValue={currentUser?.email}
                fullWidth
                label="Your Email"
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
            </Box>

            <Box>
              <TextField
                disabled
                defaultValue={currentUser?.username}
                fullWidth
                label="Your Username"
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
                label="Your Display Name"
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
                label="Avatar Image URL (optional)"
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

            <Box>
              <Button
                className="interceptor-loading"
                type="submit"
                variant="contained"
                color="primary"
                fullWidth>
                Update
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default AccountTab
