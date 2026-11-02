// User System v7 — board presence heartbeat (contract §5). Presence is best-effort: never toast.
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const PRESENCE = `${API_ROOT}/v1/presence`

export const sendPresenceHeartbeatAPI = async (boardId, editing = null) => {
  const body = editing ? { editing } : {}
  const response = await authorizedAxiosInstance.post(`${PRESENCE}/boards/${boardId}/heartbeat`, body, { silent: true })
  return response.data
}

export const leavePresenceAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${PRESENCE}/boards/${boardId}`, { silent: true })
  return response.data
}
