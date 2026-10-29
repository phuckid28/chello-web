import { toast } from 'react-toastify'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

// Boards
export const fetchBoardsAPI = async (searchPath = '') => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (newBoardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, newBoardData)
  toast.success('Board created successfully')
  return response.data
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving-card`, updateData)
  return response.data
}

// Columns
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}

// Cards
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

export const deleteCardDetailsAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}`)
  return response.data
}

// Users
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Account created successfully! Please check your email and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! Now you can login and enjoy our services! Have a good day!', { theme: 'colored' })
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

// Invitations
export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('User invited to board successfully!')
  return response.data
}

// Knowledge Hub (Confluence-style wiki pages scoped to a Sprint board)
export const fetchWikiPagesAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/wiki-pages`, { params: { boardId } })
  return response.data
}

export const createWikiPageAPI = async (pageData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/wiki-pages`, pageData)
  return response.data
}

export const updateWikiPageAPI = async (pageId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/wiki-pages/${pageId}`, updateData)
  return response.data
}

export const deleteWikiPageAPI = async (pageId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/wiki-pages/${pageId}`)
  return response.data
}
