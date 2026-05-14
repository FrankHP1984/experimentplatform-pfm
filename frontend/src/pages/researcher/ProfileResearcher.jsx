import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import { useAuthContext } from '../../context/AuthContext'
import { fetchMe } from '../../api/users'
import styles from './ProfileResearcher.module.css'

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#pg)" strokeWidth="2">
    <defs>
      <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#6C4DE6"/>
        <stop offset="1" stopColor="#00D4AA"/>
      </linearGradient>
    </defs>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

export default function ProfileResearcher() {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState('personal')
  const [pwdModal, setPwdModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    institution: '',
    department: '',
    position: '',
    orcidId: ''
  })
  
  const [researchAreas] = useState([])

  // Cargar datos del usuario al montar
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchMe()
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          institution: userData.institution || '',
          department: userData.department || '',
          position: userData.position || '',
          orcidId: userData.orcidId || ''
        })
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    loadUserData()
  }, [])

  const getInitials = (name) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  if (loadingData) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.mainArea}>
          <div style={{ padding: '2rem', color: 'var(--text)' }}>
            Cargando perfil...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <div className={styles.mainArea}>
        {/* TOPBAR */}
        <div className={styles.topbar}>
          <div className={styles.topbarTitle}>Mi perfil</div>
        </div>

        <div className={styles.pageContent}>
          
          {/* LEFT: MAIN PROFILE CONTENT */}
          <div>
            <div className={styles.profileTabs}>
              <button
                className={`${styles.profileTab} ${activeTab === 'personal' ? styles.active : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Datos personales
              </button>
              <button
                className={`${styles.profileTab} ${activeTab === 'security' ? styles.active : ''}`}
                onClick={() => setActiveTab('security')}
              >
                Seguridad
              </button>
              <button
                className={`${styles.profileTab} ${activeTab === 'notifications' ? styles.active : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notificaciones
              </button>
            </div>

            {/* TAB: PERSONAL */}
            <div className={`${styles.tabPanel} ${activeTab === 'personal' ? styles.active : ''}`}>
              
              <div className={styles.card}>
                {/* Avatar */}
                <div className={styles.avatarSection}>
                  <div className={styles.bigAvatar}>
                    {getInitials(formData.firstName + ' ' + formData.lastName)}
                  </div>
                  <div className={styles.avatarInfo}>
                    <div className={styles.avatarName}>{formData.firstName} {formData.lastName}</div>
                    <div className={styles.avatarRole}>Investigador · Plan Researcher</div>
                  </div>
                </div>

                <div className={styles.cardTitle}>Información básica</div>
                <div className={styles.cardSub}>Estos datos aparecen en los estudios y son visibles para los participantes.</div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Nombre</label>
                    <input type="text" value={formData.firstName} readOnly />
                  </div>
                  <div className={styles.field}>
                    <label>Apellidos</label>
                    <input type="text" value={formData.lastName} readOnly />
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>Correo electrónico</label>
                    <input type="email" value={formData.email} readOnly />
                    <span className={styles.fieldHint}>El correo está vinculado a tu cuenta y no puede modificarse aquí.</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Información académica</div>
                <div className={styles.cardSub}>Utilizada para generar el perfil de investigador visible en los formularios de invitación a participantes.</div>

                <div className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>Institución o universidad</label>
                    <input type="text" value={formData.institution} readOnly />
                  </div>
                  <div className={styles.field}>
                    <label>Departamento o facultad</label>
                    <input type="text" value={formData.department} readOnly />
                  </div>
                  <div className={styles.field}>
                    <label>Cargo o posición</label>
                    <input type="text" value={formData.position} readOnly />
                  </div>
                  <div className={`${styles.field} ${styles.full}`}>
                    <label>ORCID iD</label>
                    <input type="text" value={formData.orcidId} readOnly placeholder="Ej. 0000-0002-1234-5678" />
                    <span className={styles.fieldHint}>Identificador único de investigador. Mejora la visibilidad de tus estudios.</span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>Areas de investigación</div>
                <div className={styles.cardSub}>Añade etiquetas para que los participantes entiendan tu enfoque. Máximo 6.</div>
                <div className={styles.tagsWrap} style={{ marginBottom: 12 }}>
                  {researchAreas.map((area, index) => (
                    <div key={index} className={styles.tag}>{area}</div>
                  ))}
                  {researchAreas.length === 0 && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sin áreas definidas</span>
                  )}
                </div>
              </div>

            </div>

            {/* TAB: SECURITY */}
            <div className={`${styles.tabPanel} ${activeTab === 'security' ? styles.active : ''}`}>
              
              <div className={styles.card}>
                <div className={styles.cardTitle}>Contraseña y autenticación</div>
                <div className={styles.cardSub}>Gestiona el acceso a tu cuenta.</div>

                <div className={styles.securityItem}>
                  <div className={styles.secInfo}>
                    <div className={styles.secLabel}>Contraseña</div>
                    <div className={styles.secSub}>Actualizada hace 3 meses</div>
                  </div>
                  <span className={`${styles.secStatus} ${styles.secOk}`}>
                    <IconCheck />
                    Activa
                  </span>
                  <button className={styles.btnGhost} style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setPwdModal(true)}>
                    Cambiar
                  </button>
                </div>

                <div className={styles.securityItem}>
                  <div className={styles.secInfo}>
                    <div className={styles.secLabel}>Autenticación en dos pasos (2FA)</div>
                    <div className={styles.secSub}>Protege tu cuenta con un segundo factor</div>
                  </div>
                  <span className={`${styles.secStatus} ${styles.secWarn}`}>
                    <IconAlert />
                    No activado
                  </span>
                  <button className={styles.btnGhost} style={{ fontSize: 12, padding: '6px 14px' }}>
                    Activar
                  </button>
                </div>

                <div className={styles.securityItem}>
                  <div className={styles.secInfo}>
                    <div className={styles.secLabel}>Sesiones activas</div>
                    <div className={styles.secSub}>1 sesión activa · Chrome en macOS</div>
                  </div>
                  <button className={styles.btnGhost} style={{ fontSize: 12, padding: '6px 14px' }}>
                    Ver sesiones
                  </button>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <div className={styles.dangerTitle}>Zona de peligro</div>
                <div className={styles.dangerText}>
                  La eliminación de tu cuenta es permanente. Todos tus experimentos, participantes y respuestas serán borrados de forma irreversible. Esta acción no puede deshacerse.
                </div>
                <button className={styles.btnDanger} onClick={() => setDeleteModal(true)}>
                  Eliminar cuenta permanentemente
                </button>
              </div>

            </div>

            {/* TAB: NOTIFICATIONS */}
            <div className={`${styles.tabPanel} ${activeTab === 'notifications' ? styles.active : ''}`}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Preferencias de notificación</div>
                <div className={styles.cardSub}>Elige cuándo quieres recibir emails de Sopheron.</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div className={styles.securityItem}>
                    <div className={styles.secInfo}>
                      <div className={styles.secLabel}>Nueva inscripción en experimento</div>
                      <div className={styles.secSub}>Cuando un participante confirma su inscripción</div>
                    </div>
                    <div className={styles.toggle}><div className={styles.toggleKnob} /></div>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={styles.secInfo}>
                      <div className={styles.secLabel}>Cuestionario completado</div>
                      <div className={styles.secSub}>Cuando un participante finaliza una fase</div>
                    </div>
                    <div className={styles.toggle}><div className={styles.toggleKnob} /></div>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={styles.secInfo}>
                      <div className={styles.secLabel}>Baja voluntaria de participante</div>
                      <div className={styles.secSub}>Cuando un participante se da de baja del estudio</div>
                    </div>
                    <div className={styles.toggle}><div className={styles.toggleKnob} /></div>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={styles.secInfo}>
                      <div className={styles.secLabel}>Resumen semanal del experimento</div>
                      <div className={styles.secSub}>Métricas de participación cada lunes</div>
                    </div>
                    <div className={styles.toggle}><div className={styles.toggleKnob} /></div>
                  </div>
                  <div className={styles.securityItem}>
                    <div className={styles.secInfo}>
                      <div className={styles.secLabel}>Novedades y actualizaciones de Sopheron</div>
                      <div className={styles.secSub}>Nuevas funcionalidades y mejoras de la plataforma</div>
                    </div>
                    <div className={styles.toggle}><div className={styles.toggleKnob} /></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightCol}>
            
            {/* Plan */}
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <div className={styles.planBadge}>
                  <div className={styles.planIcon}>
                    <IconStar />
                  </div>
                  <div>
                    <div className={styles.planName}>Gratuito</div>
                    <div className={styles.planPrice}>Beta</div>
                  </div>
                </div>
                <span className={styles.planTag}>Activo</span>
              </div>

              <div className={styles.planUsage}>
                <div>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>Experimentos activos</span>
                    <span className={styles.usageVal}>1 / 5</span>
                  </div>
                  <div className={styles.usageBar}>
                    <div className={`${styles.usageFill} ${styles.fillViolet}`} style={{ width: '20%' }} />
                  </div>
                </div>
                <div>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>Participantes totales</span>
                    <span className={styles.usageVal}>9 / 200</span>
                  </div>
                  <div className={styles.usageBar}>
                    <div className={`${styles.usageFill} ${styles.fillCyan}`} style={{ width: '4.5%' }} />
                  </div>
                </div>
                <div>
                  <div className={styles.usageHeader}>
                    <span className={styles.usageLabel}>Almacenamiento de datos</span>
                    <span className={styles.usageVal}>12 MB / 1 GB</span>
                  </div>
                  <div className={styles.usageBar}>
                    <div className={`${styles.usageFill} ${styles.fillViolet}`} style={{ width: '1.2%' }} />
                  </div>
                </div>
              </div>

              <div className={styles.planRenew}>
                <IconCalendar />
                Renovación el 11 de mayo de 2026
              </div>

              <button className={styles.btnUpgrade} disabled>Planes de pago — próximamente</button>
            </div>

            {/* Account stats */}
            <div className={styles.statsCard}>
              <div className={styles.statsTitle}>Actividad de la cuenta</div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Miembro desde</span>
                <span className={styles.statVal}>Marzo 2026</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Experimentos creados</span>
                <span className={styles.statVal}>1</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Participantes totales</span>
                <span className={styles.statVal}>9</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Respuestas registradas</span>
                <span className={styles.statVal}>108</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Ultimo acceso</span>
                <span className={styles.statVal}>Hoy, 10:42</span>
              </div>
            </div>

            {/* Integrations */}
            <div className={styles.statsCard}>
              <div className={styles.statsTitle}>Integraciones</div>
              <div className={styles.integrationItem}>
                <div className={`${styles.intIcon} ${styles.intSb}`}>SB</div>
                <div className={styles.intInfo}>
                  <div className={styles.intName}>Supabase Auth</div>
                  <div className={`${styles.intStatus} ${styles.connected}`}>Conectado</div>
                </div>
                <button className={styles.intBtn}>Gestionar</button>
              </div>
              <div className={styles.integrationItem}>
                <div className={`${styles.intIcon} ${styles.intOrcid}`}>ID</div>
                <div className={styles.intInfo}>
                  <div className={styles.intName}>ORCID</div>
                  <div className={`${styles.intStatus} ${styles.connected}`}>Vinculado</div>
                </div>
                <button className={styles.intBtn}>Desvincular</button>
              </div>
              <div className={styles.integrationItem}>
                <div className={`${styles.intIcon} ${styles.intExport}`}>
                  <IconDownload />
                </div>
                <div className={styles.intInfo}>
                  <div className={styles.intName}>Exportación a SPSS / R</div>
                  <div className={styles.intStatus}>Disponible en todos los planes</div>
                </div>
                <button className={styles.intBtn}>Exportar</button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MODALS */}
      {pwdModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setPwdModal(false)}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Cambiar contraseña</h2>
            <p className={styles.modalSub}>Introduce tu contraseña actual y la nueva contraseña que quieras usar.</p>
            <div className={styles.field}>
              <label>Contraseña actual</label>
              <input type="password" placeholder="••••••••••" />
            </div>
            <div className={styles.field}>
              <label>Nueva contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" />
            </div>
            <div className={styles.field}>
              <label>Confirmar nueva contraseña</label>
              <input type="password" placeholder="Repite la nueva contraseña" />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setPwdModal(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={() => setPwdModal(false)}>Actualizar contraseña</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setDeleteModal(false)}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle} style={{ color: 'var(--danger)' }}>Eliminar cuenta</h2>
            <p className={styles.modalSub}>Esta acción es permanente e irreversible. Para confirmar, escribe tu correo electrónico a continuación.</p>
            <div style={{
              background: 'rgba(224,92,107,.07)',
              border: '1px solid rgba(224,92,107,.2)',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 16,
              fontSize: 13,
              color: 'var(--muted)'
            }}>
              Se eliminarán todos tus experimentos (1), participantes (9), respuestas (108) y cualquier dato asociado a tu cuenta.
            </div>
            <div className={styles.field}>
              <label>Confirma tu correo</label>
              <input type="email" placeholder={formData.email} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setDeleteModal(false)}>Cancelar</button>
              <button
                style={{
                  background: 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
                onClick={() => setDeleteModal(false)}
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
