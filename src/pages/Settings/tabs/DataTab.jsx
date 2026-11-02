import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { cancelDeletionAPI, deleteAccountAPI, exportMyDataAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { logoutUserAPI, selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import SettingsSection, { SettingsStack } from '../components/SettingsSection'
import { apiErrorMessage, downloadTextFile, exportFileName, formatDate } from '../utils/format'

function DataTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary, formatMessage, lang } = useTranslation()

  const [exporting, setExporting] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportMyDataAPI()
      const json = JSON.stringify(data, null, 2)
      downloadTextFile(json, exportFileName(), 'application/json')
      toast.success(tPrimary('v7Done'))
    } catch (err) {
      toast.error(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setExporting(false)
    }
  }

  const handleCancelDeletion = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await cancelDeletionAPI()
      const nextUser = res?.user || res
      if (nextUser && typeof nextUser === 'object') {
        dispatch(setCurrentUser(nextUser))
      } else {
        dispatch(setCurrentUser({ ...currentUser, deletionScheduledAt: null }))
      }
      toast.success(tPrimary('v7DeletionCancelled'))
    } catch (err) {
      setError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setBusy(false)
    }
  }

  const emailMatches = Boolean(currentUser?.email) &&
    confirmEmail.trim().toLowerCase() === currentUser.email.toLowerCase()

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!password || !emailMatches) return
    setBusy(true)
    setError('')
    try {
      await deleteAccountAPI({ password, confirmEmail: confirmEmail.trim() })
      dispatch(logoutUserAPI(false))
    } catch (err) {
      setError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
      setBusy(false)
    }
  }

  return (
    <SettingsStack>
      <SettingsSection
        index={1}
        label={tPrimary('setTabData')}
        title={t('setExportTitle')}
        description={tPrimary('setExportDesc')}
      >
        <Button
          variant='contained'
          startIcon={<DownloadRoundedIcon />}
          disabled={exporting}
          onClick={handleExport}
          sx={{ fontWeight: 700 }}
        >
          {exporting ? tPrimary('v7Loading') : tPrimary('setExportBtn')}
        </Button>
      </SettingsSection>

      <SettingsSection
        index={2}
        tone='danger'
        label={tPrimary('wsDangerZone')}
        title={t('setDeleteTitle')}
        description={tPrimary('setDeleteDesc')}
      >
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {currentUser?.deletionScheduledAt ? (
          <Stack spacing={2} alignItems='flex-start'>
            <Alert severity='warning' sx={{ width: '100%' }}>
              {formatMessage('v7DeletionBanner', { date: formatDate(currentUser.deletionScheduledAt, lang) })}
            </Alert>
            <Button variant='outlined' onClick={handleCancelDeletion} disabled={busy} sx={{ fontWeight: 700 }}>
              {tPrimary('v7DeletionCancel')}
            </Button>
          </Stack>
        ) : (
          <Box component='form' onSubmit={handleDeleteAccount} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              size='small'
              type='password'
              label={tPrimary('currentPasswordLabel')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              label={formatMessage('setDeleteConfirmEmail', { email: currentUser?.email || '' })}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type='submit'
                variant='contained'
                color='error'
                startIcon={<DeleteForeverRoundedIcon />}
                disabled={busy || !password || !emailMatches}
                sx={{ fontWeight: 800 }}
              >
                {tPrimary('setDeleteTitle')}
              </Button>
            </Box>
          </Box>
        )}
      </SettingsSection>
    </SettingsStack>
  )
}

export default DataTab
