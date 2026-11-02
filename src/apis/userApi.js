// User System v7 — auth, sessions, 2FA, profile, preferences, data rights (/v1/users)
// See the binding API contract (sections 1, 2, 7). Every call returns response.data.
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const USERS = `${API_ROOT}/v1/users`

const get = async (url, config) => (await authorizedAxiosInstance.get(url, config)).data
const post = async (url, body, config) => (await authorizedAxiosInstance.post(url, body, config)).data
const put = async (url, body, config) => (await authorizedAxiosInstance.put(url, body, config)).data
const del = async (url, config) => (await authorizedAxiosInstance.delete(url, config)).data

// Silent requests: the caller renders its own inline message instead of a global toast
const SILENT = { silent: true }

// ---- Auth & recovery ----
export const registerAccountAPI = (data) => post(`${USERS}/register`, data, SILENT)
export const resendVerificationAPI = (email) => post(`${USERS}/resend_verification`, { email }, SILENT)
export const forgotPasswordAPI = (email) => post(`${USERS}/forgot_password`, { email }, SILENT)
export const resetPasswordAPI = (data) => put(`${USERS}/reset_password`, data, SILENT)
export const changePasswordAPI = (data) => put(`${USERS}/password`, data, SILENT)

// ---- Sessions & audit ----
export const fetchSessionsAPI = () => get(`${USERS}/sessions`)
export const revokeSessionAPI = (sessionId) => del(`${USERS}/sessions/${sessionId}`)
export const revokeOtherSessionsAPI = () => del(`${USERS}/sessions`)
export const fetchAuditLogsAPI = (limit = 50) => get(`${USERS}/audit_logs`, { params: { limit } })

// ---- 2FA (TOTP) ----
export const setupTwoFactorAPI = () => post(`${USERS}/2fa/setup`, {})
export const enableTwoFactorAPI = (code) => post(`${USERS}/2fa/enable`, { code }, SILENT)
export const disableTwoFactorAPI = (data) => post(`${USERS}/2fa/disable`, data, SILENT)
export const regenerateBackupCodesAPI = (password) => post(`${USERS}/2fa/backup_codes`, { password }, SILENT)

// ---- Self profile & preferences ----
export const fetchMeAPI = () => get(`${USERS}/me`)
export const updateProfileAPI = (data) => put(`${USERS}/profile`, data)
export const updateUsernameAPI = (username) => put(`${USERS}/username`, { username }, SILENT)
export const updateStatusAPI = (status) => put(`${USERS}/status`, status)
export const updatePreferencesAPI = (preferences) => put(`${USERS}/preferences`, preferences, SILENT)
export const updateNotificationSettingsAPI = (data) => put(`${USERS}/notification_settings`, data)
export const updatePrivacyAPI = (data) => put(`${USERS}/privacy`, data)
export const uploadUserImageAPI = (payload) => post(`${USERS}/avatar`, payload, SILENT)

// ---- Directory & public profiles ----
export const searchUsersAPI = (params) => get(`${USERS}/search`, { params, silent: true })
export const fetchPublicProfileAPI = (username) => get(`${USERS}/u/${encodeURIComponent(username)}`, SILENT)
export const fetchProfileActivityAPI = (username, params = {}) =>
  get(`${USERS}/u/${encodeURIComponent(username)}/activity`, { params, silent: true })
export const fetchProfileHeatmapAPI = (username, days = 365) =>
  get(`${USERS}/u/${encodeURIComponent(username)}/heatmap`, { params: { days }, silent: true })
export const fetchProfileWorkloadAPI = (username) =>
  get(`${USERS}/u/${encodeURIComponent(username)}/workload`, SILENT)

// ---- Data rights ----
export const exportMyDataAPI = () => get(`${USERS}/export`)
export const deleteAccountAPI = (data) => post(`${USERS}/delete_account`, data, SILENT)
export const cancelDeletionAPI = () => post(`${USERS}/cancel_deletion`, {})
