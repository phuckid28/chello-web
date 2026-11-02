import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import { cancelDeletionAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { toast } from 'react-toastify'

// App-wide banner shown while the account sits in its 14-day deletion grace period (contract §7)
function DeletionBanner() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary, formatMessage, lang } = useTranslation()
  const [busy, setBusy] = useState(false)

  if (!currentUser?.deletionScheduledAt) return null

  const date = new Date(currentUser.deletionScheduledAt).toLocaleDateString(lang)
  const handleCancel = async () => {
    setBusy(true)
    try {
      const user = await cancelDeletionAPI()
      dispatch(setCurrentUser(user?._id ? user : { ...currentUser, deletionScheduledAt: null }))
      toast.success(tPrimary('v7DeletionCancelled'))
    } catch (error) {
      // The axios interceptor already surfaced the API error message
    } finally {
      setBusy(false)
    }
  }

  return (
    <Alert
      severity="warning"
      role="status"
      sx={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar + 1 }}
      action={
        <Button color="inherit" size="small" disabled={busy} onClick={handleCancel} sx={{ fontWeight: 800 }}>
          {tPrimary('v7DeletionCancel')}
        </Button>
      }
    >
      {formatMessage('v7DeletionBanner', { date })}
    </Alert>
  )
}

export default DeletionBanner
