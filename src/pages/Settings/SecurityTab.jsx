import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import LockIcon from '@mui/icons-material/Lock'
import LockResetIcon from '@mui/icons-material/LockReset'
import PasswordIcon from '@mui/icons-material/Password'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  changePasswordAPI, disableTwoFactorAPI, enableTwoFactorAPI,
  fetchAuditLogsAPI, regenerateBackupCodesAPI, setupTwoFactorAPI
} from '~/apis'
import PasswordStrengthMeter from '~/components/Form/PasswordStrengthMeter'
import { MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser, setCurrentUser } from '~/redux/user/userSlice'
import { passwordPolicyError } from '~/utils/passwordStrength'
import { TOTP_RULE } from '~/utils/validators'
import RelativeTime from './components/RelativeTime'
import SettingsSection, { SettingsStack } from './components/SettingsSection'
import { apiErrorMessage, copyToClipboard, downloadTextFile } from './utils/format'
import {
  PASSWORD_ERROR_KEYS, WARNING_AUDIT_EVENTS, auditEventKey,
  backupCodesText, groupSecret, summarizeUserAgent
} from './utils/security'

function SecurityTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary } = useTranslation()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  const [setupData, setSetupData] = useState(null)
  const [totpCode, setTotpCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [twoFaAction, setTwoFaAction] = useState('')
  const [twoFaPassword, setTwoFaPassword] = useState('')
  const [twoFaDisableCode, setTwoFaDisableCode] = useState('')
  const [twoFaError, setTwoFaError] = useState('')
  const [twoFaBusy, setTwoFaBusy] = useState(false)

  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(true)

  useEffect(() => {
    let active = true
    setAuditLoading(true)
    fetchAuditLogsAPI(50)
      .then((res) => {
        if (active) setAuditLogs(Array.isArray(res) ? res : (res?.items || res?.logs || []))
      })
      .catch(() => {})
      .finally(() => { if (active) setAuditLoading(false) })
    return () => { active = false }
  }, [])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwError('')
    if (!currentPassword) { setPwError(tPrimary('authFieldRequired')); return }
    const policyCode = passwordPolicyError(newPassword)
    if (policyCode) { setPwError(tPrimary(PASSWORD_ERROR_KEYS[policyCode])); return }
    if (confirmPassword !== newPassword) { setPwError(tPrimary('passwordMismatchMsg')); return }
    setPwSaving(true)
    try {
      await changePasswordAPI({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success(tPrimary('setSecPwUpdated'))
    } catch (err) {
      setPwError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setPwSaving(false)
    }
  }

  const handleStartSetup2FA = async () => {
    setTwoFaError('')
    setTwoFaBusy(true)
    try {
      const res = await setupTwoFactorAPI()
      setSetupData(res)
      setTotpCode('')
    } catch (err) {
      setTwoFaError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleEnable2FA = async (e) => {
    e.preventDefault()
    const clean = totpCode.trim()
    if (!TOTP_RULE.test(clean)) { setTwoFaError(tPrimary('authTwoFaCodeFormat')); return }
    setTwoFaError('')
    setTwoFaBusy(true)
    try {
      const res = await enableTwoFactorAPI(clean)
      dispatch(setCurrentUser({ ...currentUser, twoFactorEnabled: true }))
      setSetupData(null)
      setTotpCode('')
      setBackupCodes(Array.isArray(res?.backupCodes) ? res.backupCodes : [])
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setTwoFaError(apiErrorMessage(err, tPrimary('authTwoFaInvalid')))
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleRegenerateCodes = async (e) => {
    e.preventDefault()
    if (!twoFaPassword) return
    setTwoFaError('')
    setTwoFaBusy(true)
    try {
      const res = await regenerateBackupCodesAPI(twoFaPassword)
      setBackupCodes(Array.isArray(res?.backupCodes) ? res.backupCodes : [])
      setTwoFaPassword('')
      setTwoFaAction('')
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setTwoFaError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleDisable2FA = async (e) => {
    e.preventDefault()
    if (!twoFaPassword || !TOTP_RULE.test(twoFaDisableCode.trim())) {
      setTwoFaError(tPrimary('authTwoFaCodeFormat'))
      return
    }
    setTwoFaError('')
    setTwoFaBusy(true)
    try {
      await disableTwoFactorAPI({ password: twoFaPassword, code: twoFaDisableCode.trim() })
      dispatch(setCurrentUser({ ...currentUser, twoFactorEnabled: false }))
      setBackupCodes([])
      setTwoFaPassword('')
      setTwoFaDisableCode('')
      setTwoFaAction('')
      toast.success(tPrimary('v7Saved'))
    } catch (err) {
      setTwoFaError(apiErrorMessage(err, tPrimary('v7ErrorGeneric')))
    } finally {
      setTwoFaBusy(false)
    }
  }

  const handleCopyCodes = async () => {
    if (await copyToClipboard(backupCodes.join('\n'))) toast.success(tPrimary('v7Copied'))
  }

  const handleDownloadCodes = () => {
    const content = backupCodesText(backupCodes, {
      account: currentUser?.email || '', generatedAt: new Date().toISOString()
    })
    downloadTextFile(content, 'chella-backup-codes.txt')
  }

  return (
    <SettingsStack>
      <SettingsSection index={1} label={tPrimary('tabSecurity')} title={t('securityDashboardTitle')} description={tPrimary('setSecPwDesc')}>
        {pwError && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setPwError('')}>{pwError}</Alert>}
        <Box component='form' onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth type='password' label={tPrimary('currentPasswordLabel')} value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position='start'><PasswordIcon fontSize='small' /></InputAdornment> }}
          />
          <Box>
            <TextField
              fullWidth type='password' label={tPrimary('newPasswordLabel')} value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position='start'><LockIcon fontSize='small' /></InputAdornment> }}
            />
            <PasswordStrengthMeter password={newPassword} />
          </Box>
          <TextField
            fullWidth type='password' label={tPrimary('newPasswordConfirmLabel')} value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position='start'><LockResetIcon fontSize='small' /></InputAdornment> }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='submit' variant='contained' disabled={pwSaving} sx={{ px: 3.5, fontWeight: 800 }}>
              {pwSaving ? tPrimary('v7Saving') : t('changePasswordBtn')}
            </Button>
          </Box>
        </Box>
      </SettingsSection>

      <SettingsSection
        index={2} label={tPrimary('tabSecurity')} title={t('authTwoFaTitle')} description={tPrimary('setTwoFaDesc')}
        actions={
          <Chip
            icon={<ShieldOutlinedIcon />} size='small'
            color={currentUser?.twoFactorEnabled ? 'success' : 'default'}
            label={tPrimary(currentUser?.twoFactorEnabled ? 'setTwoFactorOn' : 'setTwoFactorOff')}
            sx={{ fontWeight: 700 }}
          />
        }
      >
        {twoFaError && <Alert severity='error' sx={{ mb: 2 }} onClose={() => setTwoFaError('')}>{twoFaError}</Alert>}

        {backupCodes.length > 0 && (
          <Box sx={{ p: 2, mb: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'warning.main', bgcolor: 'action.hover' }}>
            <Typography variant='body2' sx={{ fontWeight: 700, mb: 1.25 }}>{tPrimary('setTwoFaBackupNotice')}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1, mb: 1.5 }}>
              {backupCodes.map((code) => (
                <Box key={code} sx={{ p: 0.75, borderRadius: 1, bgcolor: 'background.paper', fontFamily: MONO_FONT, fontSize: '0.82rem', textAlign: 'center', fontWeight: 700 }}>
                  {code}
                </Box>
              ))}
            </Box>
            <Stack direction='row' spacing={1}>
              <Button size='small' variant='outlined' startIcon={<ContentCopyRoundedIcon />} onClick={handleCopyCodes}>{tPrimary('v7Copy')}</Button>
              <Button size='small' variant='outlined' startIcon={<DownloadRoundedIcon />} onClick={handleDownloadCodes}>{tPrimary('setTwoFaDownloadCodes')}</Button>
            </Stack>
          </Box>
        )}

        {!currentUser?.twoFactorEnabled && !setupData && (
          <Button variant='contained' onClick={handleStartSetup2FA} disabled={twoFaBusy} sx={{ fontWeight: 700 }}>
            {tPrimary('setTwoFaSetupBtn')}
          </Button>
        )}

        {!currentUser?.twoFactorEnabled && setupData && (
          <Box component='form' onSubmit={handleEnable2FA} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='body2' color='text.secondary'>{tPrimary('setTwoFaScanHint')}</Typography>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
              {setupData.otpauthUrl && (
                <Box
                  component='img'
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setupData.otpauthUrl)}`}
                  alt='2FA QR Code' width={180} height={180}
                  sx={{ borderRadius: '10px', border: '1px solid', borderColor: 'divider', bgcolor: '#fff', p: 1 }}
                />
              )}
              <Box sx={{ flex: '1 1 220px' }}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>TOTP Secret</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Box component='code' sx={{ fontFamily: MONO_FONT, fontWeight: 700, fontSize: '0.9rem', px: 1.25, py: 0.75, borderRadius: 1, bgcolor: 'action.hover' }}>
                    {groupSecret(setupData.secret)}
                  </Box>
                  <Button
                    size='small' variant='text' startIcon={<ContentCopyRoundedIcon />}
                    onClick={async () => { if (await copyToClipboard(setupData.secret)) toast.success(tPrimary('v7Copied')) }}
                  >
                    {tPrimary('v7Copy')}
                  </Button>
                </Box>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <TextField size='small' label={tPrimary('authTwoFaCodeLabel')} value={totpCode} onChange={(e) => setTotpCode(e.target.value)} inputProps={{ maxLength: 6 }} />
                  <Button type='submit' variant='contained' disabled={twoFaBusy} sx={{ fontWeight: 700 }}>{tPrimary('v7Confirm')}</Button>
                  <Button variant='text' onClick={() => setSetupData(null)} disabled={twoFaBusy}>{tPrimary('v7Cancel')}</Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        )}

        {currentUser?.twoFactorEnabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction='row' spacing={1.25} flexWrap='wrap' useFlexGap>
              <Button variant='outlined' size='small' onClick={() => { setTwoFaAction(twoFaAction === 'regen' ? '' : 'regen'); setTwoFaError('') }}>
                {tPrimary('setTwoFaRegenerateBtn')}
              </Button>
              <Button variant='outlined' color='error' size='small' onClick={() => { setTwoFaAction(twoFaAction === 'disable' ? '' : 'disable'); setTwoFaError('') }}>
                {tPrimary('setTwoFaDisableBtn')}
              </Button>
            </Stack>

            {twoFaAction === 'regen' && (
              <Box component='form' onSubmit={handleRegenerateCodes} sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField size='small' type='password' label={tPrimary('currentPasswordLabel')} value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} />
                <Button type='submit' variant='contained' size='small' disabled={twoFaBusy || !twoFaPassword}>{tPrimary('v7Confirm')}</Button>
              </Box>
            )}

            {twoFaAction === 'disable' && (
              <Box component='form' onSubmit={handleDisable2FA} sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField size='small' type='password' label={tPrimary('currentPasswordLabel')} value={twoFaPassword} onChange={(e) => setTwoFaPassword(e.target.value)} />
                <TextField size='small' label={tPrimary('authTwoFaCodeLabel')} value={twoFaDisableCode} onChange={(e) => setTwoFaDisableCode(e.target.value)} inputProps={{ maxLength: 6 }} />
                <Button type='submit' variant='contained' color='error' size='small' disabled={twoFaBusy}>{tPrimary('setTwoFaDisableBtn')}</Button>
              </Box>
            )}
          </Box>
        )}
      </SettingsSection>

      <SettingsSection index={3} label={tPrimary('tabSecurity')} title={t('setAuditTitle')} description={tPrimary('setAuditDesc')}>
        {auditLoading ? (
          <Typography variant='body2' color='text.secondary'>{tPrimary('v7Loading')}</Typography>
        ) : auditLogs.length === 0 ? (
          <Typography variant='body2' color='text.secondary'>{tPrimary('v7Empty')}</Typography>
        ) : (
          <Stack spacing={1}>
            {auditLogs.map((item, idx) => {
              const isWarning = WARNING_AUDIT_EVENTS.includes(item.event)
              const ua = summarizeUserAgent(item.userAgent)
              const uaSummary = [ua.browser, ua.os].filter(Boolean).join(' · ') || item.userAgent || '—'
              return (
                <Box
                  key={item._id || `${item.event}-${item.createdAt}-${idx}`}
                  sx={{
                    p: 1.5, borderRadius: '10px', border: '1px solid',
                    borderColor: isWarning ? 'warning.main' : 'divider',
                    bgcolor: isWarning ? 'rgba(245, 158, 11, 0.06)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap'
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {isWarning && <WarningAmberRoundedIcon fontSize='small' color='warning' />}
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>{tPrimary(auditEventKey(item.event))}</Typography>
                    </Box>
                    <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
                      {item.ip || '—'} · {uaSummary}
                    </Typography>
                  </Box>
                  <RelativeTime value={item.createdAt} sx={{ fontSize: '0.78rem', color: 'text.secondary', fontFamily: MONO_FONT }} />
                </Box>
              )
            })}
          </Stack>
        )}
      </SettingsSection>
    </SettingsStack>
  )
}

export default SecurityTab
