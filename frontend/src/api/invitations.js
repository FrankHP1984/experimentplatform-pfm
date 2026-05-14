import api from './client'

export const getInvitation = (token) =>
  api.get(`/invitations/${token}`).then((r) => r.data)

export const createInvitation = (experimentId, email, groupId = null) =>
  api.post(`/experiments/${experimentId}/invitations`, { email, groupId }).then((r) => r.data)

export const getExperimentInvitations = (experimentId) =>
  api.get(`/experiments/${experimentId}/invitations`).then((r) => r.data)

export const acceptInvitation = (token, participantData) =>
  api.post(`/invitations/${token}/accept`, participantData).then((r) => r.data)

export const declineInvitation = (token) =>
  api.post(`/invitations/${token}/decline`).then((r) => r.data)
