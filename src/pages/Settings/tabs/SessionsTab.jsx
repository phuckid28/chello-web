import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { toast } from 'react-toastify'
import { fetchSessionsAPI, revokeOtherSessionsAPI, revokeSessionAPI } from '~/apis'
import { MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import RelativeTime from '../components/RelativeTime'
import SettingsSection, { SettingsStack } from '../components/SettingsSection'
import { apiErrorMessage } from '../utils/format'
import { deviceLabel, sortSessions } from '../utils/security'

function SessionsTab() {
  const { t, tPrimary } = useTranslation()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchSessionsAPI()
      .then((res) => {
        if (!active) return
        const list = Array.isArray(res) ? res : (res?.sessions || res?.items || [])
        setSessions(list)
      })
      .catch((err) => {
        if (active) setError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [tPrimary])

  const sorted = useMemo(() => sortSessions(sessions), [sessions])
  const hasOthers = useMemo(() => sorted.some((s) => !s.current), [sorted])

  const handleRevokeOne = async (sessionId) => {
    setError('')
    setBusyId(sessionId)
    try {
      await revokeSessionAPI(sessionId)
      setSessions((prev) => prev.filter((s) => s._id !== sessionId))
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setBusyId('')
    }
  }

  const handleRevokeOthers = async () => {
    setError('')
    setBusyId('all')
    try {
      await revokeOtherSessionsAPI()
      setSessions((prev) => prev.filter((s) => s.current))
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setBusyId('')
    }
  }

  return (
    <SettingsStack>
      <SettingsSection
        index={1}
        label={tPrimary('setTabSessions')}
        title={t('setTabSessions')}
        description={tPrimary('setSessionsDesc')}
        actions={
          hasOthers ? (
            <Button
              size='small'
              variant='outlined'
              color='error'
              startIcon={<LogoutRoundedIcon />}
              disabled={Boolean(busyId)}
              onClick={handleRevokeOthers}
            >
              {tPrimary('setSessionRevokeAll')}
            </Button>
          ) : null
        }
      >
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography variant='body2' color='text.secondary'>{tPrimary('v7Loading')}</Typography>
        ) : sorted.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>{tPrimary('v7Empty')}</Typography>
        ) : (
          <Stack spacing={1.25}>
            {sorted.map((session) => {
              const label = deviceLabel(session) || 'Web Session'
              return (
                <Box
                  key={session._id || `${session.ip}-${session.createdAt}`}
                  sx={{
                    p: 1.75,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: session.current ? 'primary.main' : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: 'wrap'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <DevicesOutlinedIcon color={session.current ? 'primary' : 'action'} />
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>{label}</Typography>
                        {session.current && (
                          <Chip size='small' color='success' label={tPrimary('setSessionCurrent')} sx={{ fontWeight: 700, height: 22 }} />
                        )}
                      </Box>
                      <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
                        {session.ip || '—'} · <RelativeTime value={session.lastUsedAt || session.createdAt} />
                      </Typography>
                    </Box>
                  </Box>

                  {!session.current && (
                    <Button
                      size='small'
                      variant='outlined'
                      color='error'
                      disabled={Boolean(busyId)}
                      onClick={() => handleRevokeOne(session._id)}
                    >
                      {tPrimary('setSessionRevoke')}
                    </Button>
                  )}
                </Box>
              )
            })}
          </Stack>
        )}
      </SettingsSection>
    </SettingsStack>
  )
}

export default SessionsTab
