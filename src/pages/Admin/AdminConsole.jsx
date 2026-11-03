import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import { toast } from 'react-toastify'
import PageShell from '~/components/Layout/PageShell'
import { MONO_FONT } from '~/components/Layout/surface'
import { useTranslation } from '~/customHooks/useTranslation'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  fetchAdminStatsAPI,
  fetchAdminUsersAPI,
  updateAdminUserAPI,
  forceLogoutUserAPI,
  fetchAdminMonitoringOverviewAPI,
  fetchAdminSecurityOverviewAPI,
  createAdminIpRuleAPI,
  deleteAdminIpRuleAPI,
  updateAdminEmergencyStateAPI,
  executeAdminEmergencyPlaybookAPI
} from '~/apis'
import {
  SEARCH_DEBOUNCE_MS,
  patchUserInList,
  replaceUserInList,
  appendUniqueUsers,
  normalizeUsersPage,
  getThreatBadgeMeta
} from './adminUtils'
import TrafficOverviewTab from './tabs/TrafficOverviewTab'
import AccessDdosTab from './tabs/AccessDdosTab'
import SecurityWafTab from './tabs/SecurityWafTab'
import InfrastructureTab from './tabs/InfrastructureTab'
import EmergencyControlTab from './tabs/EmergencyControlTab'

const LIVE_POLL_MS = 5000

function AdminConsole() {
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary, formatMessage } = useTranslation()

  const [activeTab, setActiveTab] = useState(0)
  const [livePoll, setLivePoll] = useState(true)

  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)
  const [monitoring, setMonitoring] = useState(null)
  const [securityData, setSecurityData] = useState(null)
  const [secFilters, setSecFilters] = useState({ severity: '', category: '' })

  const [users, setUsers] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadStatsAndMonitoring = useCallback(async () => {
    setStatsError(false)
    try {
      const [statsRes, monRes] = await Promise.all([
        fetchAdminStatsAPI(),
        fetchAdminMonitoringOverviewAPI()
      ])
      setStats(statsRes || {})
      setMonitoring(monRes || null)
    } catch {
      setStatsError(true)
    }
  }, [])

  const loadSecurity = useCallback(async (filters = secFilters) => {
    try {
      const res = await fetchAdminSecurityOverviewAPI(filters)
      setSecurityData(res || null)
    } catch {
      // Keep last known security state on transient failure
    }
  }, [secFilters])

  const loadUsers = useCallback(async (query, cursor = null) => {
    setUsersLoading(true)
    setUsersError(false)
    try {
      const params = {}
      if (query) params.q = query
      if (cursor) params.cursor = cursor
      const res = await fetchAdminUsersAPI(params)
      const page = normalizeUsersPage(res)
      setUsers((prev) => (cursor ? appendUniqueUsers(prev, page.items) : page.items))
      setNextCursor(page.nextCursor)
    } catch {
      setUsersError(true)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadStatsAndMonitoring()
      loadSecurity(secFilters)
    }
  }, [currentUser?.role, loadStatsAndMonitoring, loadSecurity, secFilters])

  useEffect(() => {
    if (currentUser?.role === 'admin') loadUsers(debouncedQuery, null)
  }, [currentUser?.role, debouncedQuery, loadUsers])

  useEffect(() => {
    if (currentUser?.role !== 'admin' || !livePoll) return undefined
    const timer = setInterval(() => {
      loadStatsAndMonitoring()
      if (activeTab === 2) loadSecurity(secFilters)
    }, LIVE_POLL_MS)
    return () => clearInterval(timer)
  }, [currentUser?.role, livePoll, activeTab, secFilters, loadStatsAndMonitoring, loadSecurity])

  if (currentUser?.role !== 'admin') {
    return (
      <PageShell index={1} eyebrow={tPrimary('admEyebrow')} title={tPrimary('admForbiddenTitle')} subtitle={tPrimary('admForbiddenSub')}>
        <Button component={Link} to='/boards' variant='contained' sx={{ fontWeight: 800 }}>{tPrimary('admBackToBoards')}</Button>
      </PageShell>
    )
  }

  const userLabel = (u) => u?.displayName || u?.username || u?.email || ''

  const handlePatchUser = async (targetUser, patch) => {
    setActionBusy(true)
    try {
      const updated = await updateAdminUserAPI(targetUser._id, patch)
      setUsers((prev) => (updated?._id ? replaceUserInList(prev, updated) : patchUserInList(prev, targetUser._id, patch)))
      toast.success(formatMessage('admUpdated', { name: userLabel(targetUser) }))
    } finally {
      setActionBusy(false)
    }
  }

  const handleForceLogout = async (targetUser) => {
    setActionBusy(true)
    try {
      await forceLogoutUserAPI(targetUser._id)
      setUsers((prev) => patchUserInList(prev, targetUser._id, { activeSessionsCount: 0, sessionsCount: 0 }))
      toast.success(formatMessage('admLoggedOut', { name: userLabel(targetUser) }))
    } finally {
      setActionBusy(false)
    }
  }

  const handleCreateIpRule = async (payload) => {
    setActionBusy(true)
    try {
      await createAdminIpRuleAPI(payload)
      toast.success(formatMessage('admRuleAdded', { ip: payload.ip }))
      await Promise.all([loadStatsAndMonitoring(), loadSecurity(secFilters)])
    } finally {
      setActionBusy(false)
    }
  }

  const handleDeleteIpRule = async (ruleIdOrIp) => {
    setActionBusy(true)
    try {
      await deleteAdminIpRuleAPI(ruleIdOrIp)
      toast.success(tPrimary('admRuleRemoved'))
      await Promise.all([loadStatsAndMonitoring(), loadSecurity(secFilters)])
    } finally {
      setActionBusy(false)
    }
  }

  const handleQuickIpAction = async ({ type, ip, ruleId, durationMinutes = 60 }) => {
    if (type === 'unblock') {
      await handleDeleteIpRule(ruleId || ip)
    } else if (type === 'block') {
      await handleCreateIpRule({ ip, mode: 'block', durationMinutes, reason: 'Blocked from Access & DDoS Radar' })
    } else if (type === 'allow') {
      await handleCreateIpRule({ ip, mode: 'allow', durationMinutes: null, reason: 'Whitelisted from Access Radar' })
    }
  }

  const handleToggleEmergency = async (patch) => {
    setActionBusy(true)
    try {
      const nextState = await updateAdminEmergencyStateAPI(patch)
      setMonitoring((prev) => (prev ? { ...prev, emergencyState: nextState } : prev))
      toast.success(tPrimary('admEmergencySaved'))
      await loadSecurity(secFilters)
    } finally {
      setActionBusy(false)
    }
  }

  const handleRunPlaybook = async (payload) => {
    setActionBusy(true)
    try {
      const res = await executeAdminEmergencyPlaybookAPI(payload)
      toast.success(formatMessage('admPlaybookSuccess', { message: res?.message || payload.action }))
      await Promise.all([loadStatsAndMonitoring(), loadSecurity(secFilters), loadUsers(debouncedQuery, null)])
    } finally {
      setActionBusy(false)
    }
  }

  const emergencyState = monitoring?.emergencyState || securityData?.emergencyState || {}
  const radar = monitoring?.telemetry?.ddosRadar || {}
  const threatMeta = getThreatBadgeMeta(radar.threatLevel)

  return (
    <PageShell
      index={1}
      eyebrow={tPrimary('admEyebrow')}
      title={tPrimary('admTitle')}
      subtitle={tPrimary('admSubtitle')}
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<SecurityRoundedIcon />}
            color={threatMeta.color}
            label={`${tPrimary(threatMeta.labelKey)} • Z=${Number(radar.zScore || 0).toFixed(2)}`}
            sx={{ fontFamily: MONO_FONT, fontWeight: 800 }}
          />
          <Button
            variant={livePoll ? 'contained' : 'outlined'}
            color={livePoll ? 'success' : 'inherit'}
            size='small'
            onClick={() => setLivePoll((prev) => !prev)}
            sx={{ fontWeight: 800, fontFamily: MONO_FONT }}
          >
            {tPrimary(livePoll ? 'admLivePollOn' : 'admLivePollOff')}
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<RefreshRoundedIcon />}
            onClick={() => {
              loadStatsAndMonitoring()
              loadSecurity(secFilters)
              loadUsers(debouncedQuery, null)
            }}
            sx={{ fontWeight: 700 }}
          >
            {tPrimary('admRefresh')}
          </Button>
        </Box>
      }
    >
      {statsError && <Alert severity='error' sx={{ mb: 2 }}>{tPrimary('admStatsFailed')}</Alert>}
      {emergencyState.underAttackMode && (
        <Alert severity='error' sx={{ mb: 2, fontWeight: 700 }}>{tPrimary('admBannerUnderAttack')}</Alert>
      )}
      {emergencyState.maintenanceMode && (
        <Alert severity='warning' sx={{ mb: 2, fontWeight: 700 }}>{tPrimary('admBannerMaintenance')}</Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant='scrollable'
          scrollButtons='auto'
          aria-label={tPrimary('admTitle')}
        >
          <Tab label={tPrimary('admTabTraffic')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabAccessDdos')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabSecurityWaf')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabInfra')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabEmergency')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <TrafficOverviewTab stats={stats} monitoring={monitoring} />
      )}
      {activeTab === 1 && (
        <AccessDdosTab
          monitoring={monitoring}
          onQuickIpAction={handleQuickIpAction}
          busy={actionBusy}
        />
      )}
      {activeTab === 2 && (
        <SecurityWafTab
          securityData={securityData}
          filters={secFilters}
          onChangeFilters={setSecFilters}
          onCreateIpRule={handleCreateIpRule}
          onDeleteIpRule={handleDeleteIpRule}
          busy={actionBusy}
        />
      )}
      {activeTab === 3 && (
        <InfrastructureTab monitoring={monitoring} />
      )}
      {activeTab === 4 && (
        <EmergencyControlTab
          currentUser={currentUser}
          emergencyState={emergencyState}
          onToggleEmergency={handleToggleEmergency}
          onRunPlaybook={handleRunPlaybook}
          users={users}
          usersLoading={usersLoading}
          usersError={usersError}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          nextCursor={nextCursor}
          onLoadMore={() => loadUsers(debouncedQuery, nextCursor)}
          onPatchUser={handlePatchUser}
          onForceLogout={handleForceLogout}
          busy={actionBusy}
        />
      )}
    </PageShell>
  )
}

export default AdminConsole
