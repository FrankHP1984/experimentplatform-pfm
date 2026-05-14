import api from './client'

export const getPhases = (experimentId) =>
  api.get(`/experiments/${experimentId}/phases`).then((r) => r.data)

export const createPhase = (experimentId, data) =>
  api.post(`/experiments/${experimentId}/phases`, data).then((r) => r.data)

export const updatePhase = (experimentId, phaseId, data) =>
  api.put(`/experiments/phases/${phaseId}`, data).then((r) => r.data)

export const deletePhase = (experimentId, phaseId) =>
  api.delete(`/experiments/phases/${phaseId}`).then((r) => r.data)
