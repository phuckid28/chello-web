import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { fetchMeAPI, selectCurrentUser } from '~/redux/user/userSlice'
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
  executeAdminEmergencyPlaybookAPI,
  fetchAdminApiLogsAPI,
  updateAdminApiLogConfigAPI,
  clearAdminApiLogsAPI,
  fetchAdminCronJobsAPI,
  updateAdminCronJobAPI,
  triggerAdminCronJobAPI,
  fetchAdminRbacMatrixAPI,
  updateAdminRbacMatrixAPI,
  simulateAdminUserPermissionsAPI,
  forceAdminPasswordChangeAPI,
  createAdminUserAPI,
  bulkImportAdminUsersAPI,
  fetchAdminNetworkOverviewAPI,
  updateAdminNetworkPolicyAPI,
  upsertAdminProxyServerAPI,
  deleteAdminProxyServerAPI,
  upsertAdminServerNodeAPI,
  deleteAdminServerNodeAPI,
  runAdminNetworkHealthCheckAPI,
  verifyAdminAuditChainAPI,
  runAdminWafSimulatorAPI
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
import ApiLogsTab from './tabs/ApiLogsTab'
import CronJobsTab from './tabs/CronJobsTab'
import PermissionMatrixTab from './tabs/PermissionMatrixTab'
import ProxyServerTab from './tabs/ProxyServerTab'

const LIVE_POLL_MS = 5000

function AdminConsole() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const { tPrimary, formatMessage } = useTranslation()

  const [activeTab, setActiveTab] = useState(0)
  const [livePoll, setLivePoll] = useState(true)

  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)
  const [monitoring, setMonitoring] = useState(null)
  const [securityData, setSecurityData] = useState(null)
  const [secFilters, setSecFilters] = useState({ severity: '', category: '' })
  const [auditChainResult, setAuditChainResult] = useState(null)
  const [wafSimResult, setWafSimResult] = useState(null)

  // v9 states
  const [apiLogsData, setApiLogsData] = useState(null)
  const [apiLogFilters, setApiLogFilters] = useState({
    source: 'memory',
    method: '',
    statusGroup: '',
    minDurationMs: 0,
    q: ''
  })
  const [cronData, setCronData] = useState(null)
  const [rbacData, setRbacData] = useState(null)
  const [simulationResult, setSimulationResult] = useState(null)
  const [networkData, setNetworkData] = useState(null)

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

  const loadApiLogs = useCallback(async (filters = apiLogFilters) => {
    try {
      const res = await fetchAdminApiLogsAPI(filters)
      setApiLogsData(res || null)
    } catch {
      // Keep last known API logs state
    }
  }, [apiLogFilters])

  const loadCronJobs = useCallback(async () => {
    try {
      const res = await fetchAdminCronJobsAPI()
      setCronData(res || null)
    } catch {
      // Ignore transient error
    }
  }, [])

  const loadRbacMatrix = useCallback(async () => {
    try {
      const res = await fetchAdminRbacMatrixAPI()
      setRbacData(res || null)
    } catch {
      // Ignore transient error
    }
  }, [])

  const loadNetworkOverview = useCallback(async () => {
    try {
      const res = await fetchAdminNetworkOverviewAPI()
      setNetworkData(res || null)
    } catch {
      // Ignore transient error
    }
  }, [])

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
    loadStatsAndMonitoring()
    loadSecurity(secFilters)
    if (currentUser && !['admin', 'ops_manager', 'security_auditor'].includes(currentUser.role)) {
      dispatch(fetchMeAPI())
    }
  }, [currentUser, dispatch, loadStatsAndMonitoring, loadSecurity, secFilters])

  useEffect(() => {
    loadUsers(debouncedQuery, null)
  }, [debouncedQuery, loadUsers])

  useEffect(() => {
    if (activeTab === 5) loadApiLogs(apiLogFilters)
    if (activeTab === 6) loadCronJobs()
    if (activeTab === 7) loadRbacMatrix()
    if (activeTab === 8) loadNetworkOverview()
  }, [activeTab, apiLogFilters, loadApiLogs, loadCronJobs, loadRbacMatrix, loadNetworkOverview])

  useEffect(() => {
    if (!livePoll) return undefined
    const timer = setInterval(() => {
      loadStatsAndMonitoring()
      if (activeTab === 2) loadSecurity(secFilters)
      if (activeTab === 5) loadApiLogs(apiLogFilters)
      if (activeTab === 6) loadCronJobs()
    }, LIVE_POLL_MS)
    return () => clearInterval(timer)
  }, [livePoll, activeTab, secFilters, apiLogFilters, loadStatsAndMonitoring, loadSecurity, loadApiLogs, loadCronJobs])

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

  const handleForcePasswordChange = async (payload) => {
    setActionBusy(true)
    try {
      await forceAdminPasswordChangeAPI(payload)
      toast.success(tPrimary('admForcePwSuccess'))
      await loadUsers(debouncedQuery, null)
    } finally {
      setActionBusy(false)
    }
  }

  const handleCreateUser = async (payload) => {
    setActionBusy(true)
    try {
      const res = await createAdminUserAPI(payload)
      toast.success(`Đã tạo tài khoản ${res?.email || payload.email}`)
      await loadUsers(debouncedQuery, null)
      return res
    } finally {
      setActionBusy(false)
    }
  }

  const handleBulkImportUsers = async (payload) => {
    setActionBusy(true)
    try {
      const res = await bulkImportAdminUsersAPI(payload)
      if (!payload.dryRun) {
        const created = res?.createdCount ?? res?.summary?.createdCount ?? 0
        const updated = res?.updatedCount ?? res?.summary?.updatedCount ?? 0
        toast.success(`Đã nhập hoàn tất: Tạo mới ${created}, Cập nhật ${updated}`)
        await loadUsers(debouncedQuery, null)
      }
      return res
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

  const handleVerifyAuditChain = async () => {
    setActionBusy(true)
    try {
      const res = await verifyAdminAuditChainAPI()
      setAuditChainResult(res)
      if (res?.valid) toast.success(`Chuỗi băm SHA-256 hợp lệ (${res.checkedCount ?? res.totalChecked ?? 0} bản ghi)`)
      else toast.error('Phát hiện sai lệch trong chuỗi Audit Log!')
    } finally {
      setActionBusy(false)
    }
  }

  const handleRunWafSimulator = async () => {
    setActionBusy(true)
    try {
      const res = await runAdminWafSimulatorAPI({ scenario: 'sqli_probe' })
      setWafSimResult(res)
      toast.success(res?.reason ? `WAF Self-Test: ${res.code} — ${res.reason}` : 'WAF Self-Test hoàn tất!')
    } finally {
      setActionBusy(false)
    }
  }

  const handleUpdateApiLogConfig = async (patch) => {
    setActionBusy(true)
    try {
      await updateAdminApiLogConfigAPI(patch)
      toast.success('Đã cập nhật cấu hình thu thập & giới hạn FIFO API Logs')
      await loadApiLogs(apiLogFilters)
    } finally {
      setActionBusy(false)
    }
  }

  const handleClearApiLogs = async () => {
    setActionBusy(true)
    try {
      await clearAdminApiLogsAPI()
      toast.success('Đã xóa toàn bộ API Logs trong RAM và MongoDB')
      await loadApiLogs(apiLogFilters)
    } finally {
      setActionBusy(false)
    }
  }

  const handleUpdateCronJob = async (jobId, patch) => {
    setActionBusy(true)
    try {
      await updateAdminCronJobAPI(jobId, patch)
      toast.success(`Đã cập nhật Cron Job: ${jobId}`)
      await loadCronJobs()
    } finally {
      setActionBusy(false)
    }
  }

  const handleTriggerCronJob = async (jobId) => {
    setActionBusy(true)
    try {
      const res = await triggerAdminCronJobAPI(jobId)
      toast.success(`Đã chạy ${jobId}: ${res?.summary || 'Thành công'}`)
      await loadCronJobs()
    } finally {
      setActionBusy(false)
    }
  }

  const handleSaveRbacMatrix = async (matrix) => {
    setActionBusy(true)
    try {
      await updateAdminRbacMatrixAPI(matrix)
      toast.success('Đã lưu Ma trận Phân quyền RBAC!')
      await loadRbacMatrix()
    } finally {
      setActionBusy(false)
    }
  }

  const handleSimulatePermissions = async (params) => {
    setActionBusy(true)
    try {
      const res = await simulateAdminUserPermissionsAPI(params)
      setSimulationResult(res)
    } finally {
      setActionBusy(false)
    }
  }

  const handleUpdateNetworkPolicy = async (patch) => {
    setActionBusy(true)
    try {
      await updateAdminNetworkPolicyAPI(patch)
      toast.success('Đã lưu cấu hình Trusted Reverse Proxy & Chính sách Mật khẩu!')
      await Promise.all([loadNetworkOverview(), loadSecurity(secFilters)])
    } finally {
      setActionBusy(false)
    }
  }

  const handleUpsertProxy = async (payload) => {
    setActionBusy(true)
    try {
      await upsertAdminProxyServerAPI(payload)
      toast.success('Đã lưu Outbound Proxy (AES-256-GCM)!')
      await loadNetworkOverview()
    } finally {
      setActionBusy(false)
    }
  }

  const handleDeleteProxy = async (proxyId) => {
    setActionBusy(true)
    try {
      await deleteAdminProxyServerAPI(proxyId)
      toast.success('Đã xóa Outbound Proxy')
      await loadNetworkOverview()
    } finally {
      setActionBusy(false)
    }
  }

  const handleUpsertServer = async (payload) => {
    setActionBusy(true)
    try {
      await upsertAdminServerNodeAPI(payload)
      toast.success('Đã lưu Server Node!')
      await loadNetworkOverview()
    } finally {
      setActionBusy(false)
    }
  }

  const handleDeleteServer = async (serverId) => {
    setActionBusy(true)
    try {
      await deleteAdminServerNodeAPI(serverId)
      toast.success('Đã xóa Server Node')
      await loadNetworkOverview()
    } finally {
      setActionBusy(false)
    }
  }

  const handleRunNetworkHealthCheck = async () => {
    setActionBusy(true)
    try {
      const res = await runAdminNetworkHealthCheckAPI()
      toast.success(res?.summary || 'Đã hoàn tất kiểm tra sức khỏe Server & Proxy!')
      await loadNetworkOverview()
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
      maxWidth={1360}
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
              if (activeTab === 5) loadApiLogs(apiLogFilters)
              if (activeTab === 6) loadCronJobs()
              if (activeTab === 7) loadRbacMatrix()
              if (activeTab === 8) loadNetworkOverview()
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
          <Tab label={tPrimary('admTabApiLogs')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabCronJobs')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabRbacMatrix')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
          <Tab label={tPrimary('admTabProxyServer')} sx={{ fontWeight: 800, fontFamily: MONO_FONT }} />
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
          onVerifyAuditChain={handleVerifyAuditChain}
          onRunWafSimulator={handleRunWafSimulator}
          auditChainResult={auditChainResult}
          wafSimResult={wafSimResult}
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
          onForcePasswordChange={handleForcePasswordChange}
          onCreateUser={handleCreateUser}
          onBulkImportUsers={handleBulkImportUsers}
          busy={actionBusy}
        />
      )}
      {activeTab === 5 && (
        <ApiLogsTab
          apiLogsData={apiLogsData}
          filters={apiLogFilters}
          onChangeFilters={setApiLogFilters}
          onUpdateConfig={handleUpdateApiLogConfig}
          onClearLogs={handleClearApiLogs}
          busy={actionBusy}
        />
      )}
      {activeTab === 6 && (
        <CronJobsTab
          cronData={cronData}
          onUpdateJob={handleUpdateCronJob}
          onTriggerJob={handleTriggerCronJob}
          busy={actionBusy}
        />
      )}
      {activeTab === 7 && (
        <PermissionMatrixTab
          rbacData={rbacData}
          users={users}
          simulationResult={simulationResult}
          onSaveMatrix={handleSaveRbacMatrix}
          onSimulatePermissions={handleSimulatePermissions}
          busy={actionBusy}
        />
      )}
      {activeTab === 8 && (
        <ProxyServerTab
          networkData={networkData}
          onUpdatePolicy={handleUpdateNetworkPolicy}
          onUpsertProxy={handleUpsertProxy}
          onDeleteProxy={handleDeleteProxy}
          onUpsertServer={handleUpsertServer}
          onDeleteServer={handleDeleteServer}
          onRunHealthCheck={handleRunNetworkHealthCheck}
          busy={actionBusy}
        />
      )}
    </PageShell>
  )
}

export default AdminConsole
