import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { fetchPublicSystemStatusAPI } from '~/apis'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useTranslation } from '~/customHooks/useTranslation'

const POLL_INTERVAL_MS = 45 * 1000

function SystemStatusBanner() {
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary } = useTranslation()
  const [sysStatus, setSysStatus] = useState(null)

  useEffect(() => {
    let active = true
    const checkStatus = async () => {
      try {
        const res = await fetchPublicSystemStatusAPI()
        if (active) setSysStatus(res)
      } catch {
        // Ignore network errors silently
      }
    }
    checkStatus()
    const timer = setInterval(checkStatus, POLL_INTERVAL_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  if (!sysStatus?.maintenanceMode && !sysStatus?.underAttackMode) return null

  const isAdmin = currentUser?.role === 'admin'

  return (
    <Box sx={{ px: 2, pt: 1 }}>
      {sysStatus.maintenanceMode && (
        <Alert
          severity='warning'
          sx={{ mb: 1, fontWeight: 700 }}
          action={
            isAdmin ? (
              <Button component={Link} to='/admin' color='inherit' size='small' sx={{ fontWeight: 800 }}>
                Admin
              </Button>
            ) : null
          }
        >
          {tPrimary('admBannerMaintenance')}
        </Alert>
      )}
      {sysStatus.underAttackMode && isAdmin && (
        <Alert
          severity='error'
          sx={{ mb: 1, fontWeight: 700 }}
          action={
            <Button component={Link} to='/admin' color='inherit' size='small' sx={{ fontWeight: 800 }}>
              Admin
            </Button>
          }
        >
          {tPrimary('admBannerUnderAttack')}
        </Alert>
      )}
    </Box>
  )
}

export default SystemStatusBanner
