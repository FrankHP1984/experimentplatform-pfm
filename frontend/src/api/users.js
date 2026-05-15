import api from './client'

export const fetchMe = () =>
  api.get('/users/me').then((r) => r.data)

export const updateProfile = (data) =>
  api.put('/users/me', data).then((r) => r.data)

export const updateMe = updateProfile

export const syncUser = (role = 'RESEARCHER', firstName = '', lastName = '') =>
  api.post('/users/sync', { role, firstName, lastName }).then((r) => r.data)

export const deleteMe = () =>
  api.delete('/users/me')
