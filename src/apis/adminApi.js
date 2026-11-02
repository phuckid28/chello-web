// User System v7 — global admin console (contract §7). Requires currentUser.role === 'admin'.
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
