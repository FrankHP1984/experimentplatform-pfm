import api from './client'

export const submitResponses = (enrollmentId, data) =>
  api.post(`/questions/enrollments/${enrollmentId}/responses`, data).then((r) => r.data)

export const getExperimentResponses = (experimentId) =>
  api.get(`/experiments/${experimentId}/responses`).then((r) => r.data)

export const getParticipantResponses = (enrollmentId) =>
  api.get(`/questions/enrollments/${enrollmentId}/responses`).then((r) => r.data)

export const getEnrollmentResponses = (enrollmentId) =>
  api.get(`/questions/enrollments/${enrollmentId}/responses`).then((r) => r.data)

export const getPhaseQuestions = (phaseId) =>
  api.get(`/questions/phases/${phaseId}`).then((r) => r.data)

export const submitQuestionResponse = (enrollmentId, responseData) =>
  api.post(`/questions/enrollments/${enrollmentId}/responses`, responseData).then((r) => r.data)
