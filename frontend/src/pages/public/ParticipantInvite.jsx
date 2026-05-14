import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInvitation, acceptInvitation, declineInvitation } from '../../api/invitations'
import { supabase } from '../../api/client'
import { syncUser, fetchMe } from '../../api/users'
import { useAuthContext } from '../../context/AuthContext'
import styles from './ParticipantInvite.module.css'

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IconCheckCircle = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

export default function ParticipantInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState(null)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1)
  const [accepted, setAccepted] = useState(false)
  const { setUser } = useAuthContext()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    password: '',
    consent: false
  })

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true)
        const data = await getInvitation(token)
        setInvitation(data)
        setLoading(false)
      } catch (error) {
        console.log('Error:', error)
        setError('Invitación no válida o expirada')
        setLoading(false)
      }
    }
    
    if (token) {
      loadInvitation()
    }
  }, [token])

  const handleAccept = async () => {
    if (!formData.consent) {
      setError('Debes aceptar los términos para continuar')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const email = invitation.invitedEmail

      // 1. Crear cuenta en Supabase (o iniciar sesión si ya existe)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password: formData.password })

      if (signUpError && !signUpError.message?.toLowerCase().includes('already registered')) {
        throw new Error(signUpError.message)
      }

      // Si signUp no devuelve sesión (email confirmation pendiente o ya registrado)
      if (!signUpData?.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: formData.password })
        if (signInError || !signInData?.session) {
          throw new Error('No se pudo crear la sesión. Comprueba la contraseña.')
        }
      }

      // 2. Sincronizar usuario en el backend como PARTICIPANT
      await syncUser('PARTICIPANT')

      // 3. Aceptar la invitación (ahora hay sesión activa con JWT)
      await acceptInvitation(token, {
        consentAgreed: true,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        gender: formData.gender,
      })

      // 4. Cargar perfil en el AuthContext para que PrivateRoute lo reconozca
      const profile = await fetchMe()
      setUser(profile)

      setAccepted(true)
    } catch (error) {
      console.error('Error aceptando invitación:', error)
      setError('No se pudo aceptar la invitación')
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    try {
      await declineInvitation(token)
    } catch {
      // El usuario puede no estar autenticado aún; se navega igualmente
    }
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return 'E'
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
        Cargando invitación...
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', textAlign: 'center', padding: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Invitación no válida</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button 
            className={styles.btnPrimary}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>{getInitials('Sopheron')}</div>
            <div className={styles.logoText}>Empiri<span>a</span></div>
          </div>
        </div>
        
        <div className={styles.right}>
          <div className={styles.formCard}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <IconCheckCircle />
              </div>
              <div className={styles.successTitle}>¡Bienvenido al estudio!</div>
              <div className={styles.successDesc}>
                Tu inscripción ha sido confirmada. Ya puedes acceder a la plataforma con tu correo y contraseña.
              </div>
              <button
                className={styles.btnPrimary}
                onClick={() => navigate('/participant/dashboard')}
              >
                Ir al panel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>{getInitials('Sopheron')}</div>
          <div className={styles.logoText}>Empiri<span>a</span></div>
        </div>

        <div className={styles.studyTag}>
          <div className={styles.studyTagDot}></div>
          Invitación al estudio
        </div>

        <h1 className={styles.studyTitle}>
          {invitation?.experimentTitle || 'Estudio de investigación'}
        </h1>

        <p className={styles.studyDesc}>
          Has sido invitado a participar en este estudio de investigación.
        </p>

        <div className={styles.trustBadges}>
          <div className={styles.trustBadge}>
            <IconShield />
            Datos anónimos
          </div>
          <div className={styles.trustBadge}>
            <IconShield />
            Confidencial
          </div>
          <div className={styles.trustBadge}>
            <IconShield />
            Voluntario
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.stepIndicatorRow}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.active : styles.pending}`}>
            {step > 1 ? <IconCheck /> : 1}
          </div>
          <div className={`${styles.stepLine} ${step > 1 ? styles.done : ''}`}></div>
          <div className={`${styles.stepDot} ${step >= 2 ? styles.active : styles.pending}`}>
            2
          </div>
        </div>

        <div className={styles.stepLabels}>
          <div className={`${styles.stepLabelItem} ${step === 1 ? styles.active : ''}`}>Datos</div>
          <div className={`${styles.stepLabelItem} ${step === 2 ? styles.active : ''}`}>Confirmar</div>
        </div>

        {step === 1 && (
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <div className={styles.formCardTitle}>Información básica</div>
              <div className={styles.formCardSub}>
                Necesitamos algunos datos para tu participación en el estudio
              </div>
            </div>
            <div className={styles.formBody}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Apellidos</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Tus apellidos"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fecha de nacimiento</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Género</label>
                <select
                  className={styles.formSelect}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="OTHER">Otro</option>
                  <option value="PREFER_NOT_TO_SAY">Prefiero no decirlo</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Correo electrónico</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={invitation?.invitedEmail || ''}
                  readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Elige una contraseña</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.formActions}>
                <button className={styles.btnGhost} onClick={handleDecline}>
                  Rechazar
                </button>
                <button 
                  className={styles.btnPrimary}
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.lastName}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <div className={styles.formCardTitle}>Consentimiento informado</div>
              <div className={styles.formCardSub}>
                Lee y acepta los términos para participar en el estudio
              </div>
            </div>
            <div className={styles.formBody}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                />
                <label className={styles.checkboxLabel}>
                  He leído y acepto participar voluntariamente en este estudio. Entiendo que mis datos serán tratados de forma confidencial y anónima, y que puedo retirarme en cualquier momento sin penalización.
                </label>
              </div>

              <div className={styles.formActions}>
                <button className={styles.btnGhost} onClick={() => setStep(1)}>
                  Volver
                </button>
                <button 
                  className={styles.btnPrimary}
                  onClick={handleAccept}
                  disabled={!formData.consent || submitting}
                >
                  {submitting ? 'Procesando...' : 'Aceptar y participar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
