import api from './client'

export const getQuestions = (phaseId) =>
  api.get(`/questions/phases/${phaseId}`).then((r) => r.data)

export const createQuestion = (phaseId, data) =>
  api.post(`/questions/phases/${phaseId}`, data).then((r) => r.data)

export const updateQuestion = (phaseId, questionId, data) =>
  api.put(`/questions/${questionId}`, data).then((r) => r.data)

export const deleteQuestion = (phaseId, questionId) =>
  api.delete(`/questions/${questionId}`).then((r) => r.data)
