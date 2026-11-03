// User System v7, System Observability/SOC v8 & Enterprise Governance v9 — global admin console APIs.
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const ADMIN = `${API_ROOT}/v1/admin`

export const fetchAdminUsersAPI = async (params = {}) => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/users`, { params })
  return response.data
}

// patch: { isActive?, role?: 'client' | 'admin' | 'ops_manager' | 'security_auditor', unlock?: true }
export const updateAdminUserAPI = async (userId, patch) => {
  const response = await authorizedAxiosInstance.put(`${ADMIN}/users/${userId}`, patch)
  return response.data
}

export const forceLogoutUserAPI = async (userId) => {
  const response = await authorizedAxiosInstance.delete(`${ADMIN}/users/${userId}/sessions`)
  return response.data
}

export const fetchAdminStatsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/stats`)
  return response.data
}

// v8 System Observability, Traffic In/Out, DDoS Radar, WAF & Emergency Control APIs
export const fetchAdminMonitoringOverviewAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/monitoring/overview`)
  return response.data
}

export const fetchAdminSecurityOverviewAPI = async (params = {}) => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/security/overview`, { params })
  return response.data
}

export const createAdminIpRuleAPI = async (payload) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/security/ip-rules`, payload)
  return response.data
}

export const deleteAdminIpRuleAPI = async (ruleIdOrIp) => {
  const response = await authorizedAxiosInstance.delete(`${ADMIN}/security/ip-rules/${encodeURIComponent(ruleIdOrIp)}`)
  return response.data
}

export const fetchAdminEmergencyStateAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/emergency/state`)
  return response.data
}

export const updateAdminEmergencyStateAPI = async (patch) => {
  const response = await authorizedAxiosInstance.put(`${ADMIN}/emergency/state`, patch)
  return response.data
}

export const executeAdminEmergencyPlaybookAPI = async (payload) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/emergency/actions`, payload)
  return response.data
}

export const fetchPublicSystemStatusAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/status`)
  return response.data
}

// v9 Enterprise Governance, API Logs Inspector, Cron Jobs, RBAC Matrix, Password Policy, Provisioning & Network/Proxy
export const fetchAdminApiLogsAPI = async (params = {}) => {
  const { q = '', method = '', statusGroup = '', minDurationMs = 0, limit = 80 } = params || {}
  const response = await authorizedAxiosInstance.get(`${ADMIN}/api-logs`, {
    params: { q, method, statusGroup, minDurationMs, limit }
  })
  return response.data
}

export const updateAdminApiLogConfigAPI = async (patch) => {
  const response = await authorizedAxiosInstance.patch(`${ADMIN}/api-logs/config`, patch)
  return response.data
}

export const clearAdminApiLogsAPI = async () => {
  const response = await authorizedAxiosInstance.delete(`${ADMIN}/api-logs`)
  return response.data
}

export const fetchAdminCronJobsAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/cron-jobs`)
  return response.data
}

export const updateAdminCronJobAPI = async (jobKey, patch) => {
  const response = await authorizedAxiosInstance.patch(`${ADMIN}/cron-jobs/${encodeURIComponent(jobKey)}`, patch)
  return response.data
}

export const triggerAdminCronJobAPI = async (jobKey) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/cron-jobs/${encodeURIComponent(jobKey)}/run`)
  return response.data
}

export const fetchAdminRbacMatrixAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/rbac/matrix`)
  return response.data
}

export const updateAdminRbacMatrixAPI = async (payload) => {
  const body = payload && (payload.matrix || payload.resetDefault) ? payload : { matrix: payload }
  const response = await authorizedAxiosInstance.put(`${ADMIN}/rbac/matrix`, body)
  return response.data
}

export const simulateAdminUserPermissionsAPI = async (payload = {}) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/rbac/simulate`, payload)
  return response.data
}

export const forceAdminPasswordChangeAPI = async (payload = {}) => {
  const { userId, userIds, scope = 'selected', temporaryPassword = null, reason = 'admin_forced' } = payload
  const response = await authorizedAxiosInstance.post(`${ADMIN}/users/force-password-change`, {
    userId,
    userIds,
    scope,
    temporaryPassword,
    reason
  })
  return response.data
}

export const createAdminUserAPI = async (payload) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/users/create`, payload)
  return response.data
}

export const bulkImportAdminUsersAPI = async (payload) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/users/bulk-import`, payload)
  return response.data
}

export const fetchAdminNetworkOverviewAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/network/overview`)
  return response.data
}

export const updateAdminNetworkPolicyAPI = async (patch) => {
  const response = await authorizedAxiosInstance.patch(`${ADMIN}/network/policy`, patch)
  return response.data
}

export const upsertAdminProxyServerAPI = async (payload) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/network/proxies`, payload)
  return response.data
}

export const deleteAdminProxyServerAPI = async (proxyId) => {
  const response = await authorizedAxiosInstance.delete(`${ADMIN}/network/proxies/${encodeURIComponent(proxyId)}`)
  return response.data
}

export const upsertAdminServerNodeAPI = async (payload) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/network/nodes`, payload)
  return response.data
}

export const deleteAdminServerNodeAPI = async (serverId) => {
  const response = await authorizedAxiosInstance.delete(`${ADMIN}/network/nodes/${encodeURIComponent(serverId)}`)
  return response.data
}

export const runAdminNetworkHealthCheckAPI = async () => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/network/health-check`)
  return response.data
}

export const verifyAdminAuditChainAPI = async () => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/security/verify-audit-chain`)
  return response.data
}

export const runAdminWafSimulatorAPI = async (payload = { scenario: 'sqli_probe' }) => {
  const response = await authorizedAxiosInstance.post(`${ADMIN}/security/waf-simulator`, payload)
  return response.data
}
