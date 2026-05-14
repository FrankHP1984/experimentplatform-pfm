/* eslint-disable no-undef */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../api/client'
import { useAuthContext } from '../../context/AuthContext'
import { syncUser, fetchMe } from '../../api/users'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setUser } = useAuthContext()

  useEffect(() => {
    const confirmar = async () => {
      try {
        // Supabase manda el token en el hash de la URL al confirmar el email
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (!accessToken) {
          throw new Error('No se encontró el token de acceso en la URL')
        }

        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) throw sessionError
        if (!session) throw new Error('No se pudo establecer la sesión')

        try {
          const profile = await fetchMe()
          setUser(profile)
          setStatus('success')
          const destino = profile.role === 'PARTICIPANT' ? '/participant/dashboard' : '/dashboard'
          setTimeout(() => navigate(destino), 1000)
        } catch {
          // El usuario aún no existe en el backend, lo sincronizamos
          // Los participantes se invitan, así que aquí siempre es un investigador
          await syncUser('RESEARCHER')
          const profile = await fetchMe()
          setUser(profile)
          setStatus('success')
          setTimeout(() => navigate('/onboarding'), 1000)
        }
      } catch (err) {
        console.error('Error en callback de autenticación:', err)
        setError(err.message || 'Error al confirmar el email')
        setStatus('error')
        setTimeout(() => navigate('/?error=confirmation-failed'), 3000)
      }
    }

    confirmar()
  }, [navigate, setUser])

  if (status === 'processing') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '1rem',
        color: 'var(--text)'
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <div>Confirmando tu email...</div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '1rem',
        color: 'var(--text)'
      }}>
        <div style={{ fontSize: '2rem' }}>✅</div>
        <div>¡Email confirmado!</div>
        <div style={{ opacity: 0.7 }}>Redirigiendo...</div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: '1rem',
        color: 'var(--text)'
      }}>
        <div style={{ fontSize: '2rem' }}>❌</div>
        <div>Error al confirmar el email</div>
        <div style={{ opacity: 0.7, maxWidth: '400px', textAlign: 'center' }}>
          {error}
        </div>
        <div style={{ opacity: 0.5, fontSize: '0.875rem' }}>
          Redirigiendo al inicio...
        </div>
      </div>
    )
  }

  return null
}
