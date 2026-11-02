// User System v7 — notifications inbox + card watchers (contract §4)
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const NOTIFICATIONS = `${API_ROOT}/v1/notifications`

const get = async (url, config) => (await authorizedAxiosInstance.get(url, config)).data
const put = async (url, body, config) => (await authorizedAxiosInstance.put(url, body, config)).data

// tab: 'all' | 'unread' | 'mention' | 'assigned' | 'invite'
export const fetchNotificationsAPI = (params = {}) => get(NOTIFICATIONS, { params, silent: true })
export const fetchUnreadCountAPI = () => get(`${NOTIFICATIONS}/unread_count`, { silent: true })
export const markNotificationReadAPI = (id) => put(`${NOTIFICATIONS}/${id}/read`, {})
export const markNotificationUnreadAPI = (id) => put(`${NOTIFICATIONS}/${id}/unread`, {})
export const archiveNotificationAPI = (id) => put(`${NOTIFICATIONS}/${id}/archive`, {})
export const markAllNotificationsReadAPI = () => put(`${NOTIFICATIONS}/read_all`, {})

export const watchCardAPI = (cardId, watch) => put(`${API_ROOT}/v1/cards/${cardId}/watch`, { watch })
