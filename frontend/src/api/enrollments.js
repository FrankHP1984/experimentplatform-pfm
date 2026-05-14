import api from './client'

export const getEnrollments = (experimentId) =>
  api.get(`/experiments/${experimentId}/participants`).then((r) => r.data)

export const getEnrollment = (enrollmentId) =>
  api.get(`/enrollments/${enrollmentId}`).then((r) => r.data)

export const enrollByToken = (token, data) =>
  api.post(`/invitations/${token}/accept`, data).then((r) => r.data)

export const getInviteInfo = (token) =>
  api.get(`/invitations/${token}`).then((r) => r.data)

export const patchEnrollmentStatus = (enrollmentId, status) =>
  api.put(`/enrollments/${enrollmentId}/status`, null, { params: { status } }).then((r) => r.data)

export const getMyEnrollments = () =>
  api.get('/enrollments/me').then((r) => r.data)

export const completeEnrollment = (enrollmentId) =>
  api.put(`/enrollments/${enrollmentId}/complete`).then((r) => r.data)

export const assignGroup = (enrollmentId, groupId) =>
  api.patch(`/enrollments/${enrollmentId}/group`, null, { params: groupId != null ? { groupId } : {} }).then((r) => r.data)

export const signConsent = (_enrollmentId) => Promise.resolve()

