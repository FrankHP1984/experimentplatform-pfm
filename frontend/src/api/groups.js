import api from './client'

export const getGroups = (experimentId) =>
  api.get(`/experiments/${experimentId}/groups`).then((r) => r.data)

export const createGroup = (experimentId, data) =>
  api.post(`/experiments/${experimentId}/groups`, data).then((r) => r.data)

export const updateGroup = (experimentId, groupId, data) =>
  api.put(`/experiments/groups/${groupId}`, data).then((r) => r.data)

export const deleteGroup = (experimentId, groupId) =>
  api.delete(`/experiments/groups/${groupId}`).then((r) => r.data)
