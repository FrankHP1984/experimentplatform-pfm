import api from './client'

export const getParticipant = (id) =>
  api.get(`/participants/${id}`).then((r) => r.data)

export const getParticipantEnrollments = (participantId) =>
  api.get(`/enrollments/participants/${participantId}`).then((r) => r.data)

export const changeParticipantGroup = (participantId, enrollmentId, newGroupId) =>
  api.put(`/participants/${participantId}/group`, null, {
    params: { enrollmentId, newGroupId }
  }).then((r) => r.data)

export const sendParticipantReminder = (participantId, enrollmentId) =>
  api.post(`/participants/${participantId}/reminder`, null, {
    params: { enrollmentId }
  }).then((r) => r.data)

export const updateEnrollmentStatus = (enrollmentId, status) =>
  api.put(`/enrollments/${enrollmentId}/status`, null, {
    params: { status }
  }).then((r) => r.data)
