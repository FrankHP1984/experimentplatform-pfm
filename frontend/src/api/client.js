import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Añade el token de Supabase a cada petición automáticamente
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return config
})

// Si el token ha caducado, redirige a la página de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/error/token-expired'
    }
    const message = error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

export default api
