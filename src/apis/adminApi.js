// User System v7 & System Observability/SOC v8 — global admin console APIs. Requires currentUser.role === 'admin'.
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const ADMIN = `${API_ROOT}/v1/admin`

export const fetchAdminUsersAPI = async (params = {}) => {
  const response = await authorizedAxiosInstance.get(`${ADMIN}/users`, { params })
  return response.data
}

// patch: { isActive?, role?: 'client' | 'admin', unlock?: true }
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
