// User System v7 — multi-level workspaces, board members, invite links, activity (contract §3, §6)
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

const WORKSPACES = `${API_ROOT}/v1/workspaces`
const BOARDS = `${API_ROOT}/v1/boards`
const INVITES = `${API_ROOT}/v1/invites`

const get = async (url, config) => (await authorizedAxiosInstance.get(url, config)).data
const post = async (url, body, config) => (await authorizedAxiosInstance.post(url, body, config)).data
const put = async (url, body, config) => (await authorizedAxiosInstance.put(url, body, config)).data
const del = async (url, config) => (await authorizedAxiosInstance.delete(url, config)).data

// ---- Workspace tree & CRUD ----
export const fetchWorkspaceTreeAPI = () => get(WORKSPACES)
export const createWorkspaceAPI = (data) => post(WORKSPACES, data)
export const fetchWorkspaceDetailsAPI = (workspaceId) => get(`${WORKSPACES}/${workspaceId}`, { silent: true })
export const updateWorkspaceAPI = (workspaceId, data) => put(`${WORKSPACES}/${workspaceId}`, data)
export const moveWorkspaceAPI = (workspaceId, parentId) => put(`${WORKSPACES}/${workspaceId}/move`, { parentId })
export const deleteWorkspaceAPI = (workspaceId) => del(`${WORKSPACES}/${workspaceId}`)

// ---- Workspace members ----
export const fetchWorkspaceMembersAPI = (workspaceId) => get(`${WORKSPACES}/${workspaceId}/members`)
export const updateWorkspaceMemberRoleAPI = (workspaceId, userId, role) =>
  put(`${WORKSPACES}/${workspaceId}/members/${userId}`, { role })
export const removeWorkspaceMemberAPI = (workspaceId, userId) =>
  del(`${WORKSPACES}/${workspaceId}/members/${userId}`)
export const transferWorkspaceOwnershipAPI = (workspaceId, userId) =>
  post(`${WORKSPACES}/${workspaceId}/transfer_ownership`, { userId })
export const inviteToWorkspaceByEmailAPI = (workspaceId, data) =>
  post(`${WORKSPACES}/${workspaceId}/invitations`, data)

// ---- Workspace invite links ----
export const createWorkspaceInviteLinkAPI = (workspaceId, data) =>
  post(`${WORKSPACES}/${workspaceId}/invite_links`, data)
export const fetchWorkspaceInviteLinksAPI = (workspaceId) => get(`${WORKSPACES}/${workspaceId}/invite_links`)
export const revokeWorkspaceInviteLinkAPI = (workspaceId, linkId) =>
  del(`${WORKSPACES}/${workspaceId}/invite_links/${linkId}`)

// ---- Board ↔ workspace attachment ----
export const attachBoardToWorkspaceAPI = (boardId, workspaceId) =>
  put(`${WORKSPACES}/boards/${boardId}`, { workspaceId })

// ---- Board members & roles ----
export const fetchBoardMembersAPI = (boardId) => get(`${BOARDS}/${boardId}/members`)
export const updateBoardMemberRoleAPI = (boardId, userId, role) =>
  put(`${BOARDS}/${boardId}/members/${userId}`, { role })
export const removeBoardMemberAPI = (boardId, userId) => del(`${BOARDS}/${boardId}/members/${userId}`)
export const createBoardInviteLinkAPI = (boardId, data) => post(`${BOARDS}/${boardId}/invite_links`, data)
export const fetchBoardInviteLinksAPI = (boardId) => get(`${BOARDS}/${boardId}/invite_links`, { silent: true })
export const revokeBoardInviteLinkAPI = (boardId, linkId) => del(`${BOARDS}/${boardId}/invite_links/${linkId}`)

// ---- Board activity feed ----
export const fetchBoardActivityAPI = (boardId, params = {}) =>
  get(`${BOARDS}/${boardId}/activity`, { params, silent: true })

// ---- Public invite acceptance ----
export const fetchInviteAPI = (token) => get(`${INVITES}/${encodeURIComponent(token)}`, { silent: true })
export const acceptInviteAPI = (token) => post(`${INVITES}/${encodeURIComponent(token)}/accept`, {})
