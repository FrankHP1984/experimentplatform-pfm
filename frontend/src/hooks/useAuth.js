import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import { fetchMe, syncUser, updateProfile } from '../api/users'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setUser, logout } = useAuthContext()

  const clearError = () => setError(null)

  // Registro solo para investigadores (los participantes se invitan)
  const register = async ({ email, password, name, institution }) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (signUpError) throw signUpError

      // Si no hay sesión activa, intentamos hacer login directamente
      if (!data.session) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError || !loginData.session) {
          setError('Registro exitoso. Por favor, verifica tu email para continuar.')
          return
        }
      }

      const partes = (name || '').trim().split(/\s+/)
      await syncUser('RESEARCHER', partes[0] || '', partes.slice(1).join(' ') || '')

      if (institution?.trim()) {
        await updateProfile({ institution: institution.trim() })
      }

      const profile = await fetchMe()
      setUser(profile)
      navigate('/onboarding')
    } catch (err) {
      console.error('Error en el registro:', err.message)
      if (err.response?.status === 409) {
        try {
          const profile = await fetchMe()
          setUser(profile)
          navigate('/onboarding')
          return
        } catch (_) {
          // Si fetchMe también falla, hacemos logout normal
        }
      }
      await logout()
      setError(err.message || 'Error al registrar la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      const profile = await fetchMe()
      setUser(profile)

      const destino = profile.role === 'PARTICIPANT' ? '/participant/dashboard' : '/dashboard'
      navigate(destino)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Email not confirmed')) {
        setError('Necesitas confirmar tu email antes de entrar. Revisa tu bandeja de entrada.')
      } else if (msg.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.')
      } else {
        setError(msg || 'No se pudo iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return { login, register, logout: handleLogout, loading, error, clearError }
}
