import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import { useAuthContext } from '../../context/AuthContext'
import { fetchMe, deleteMe } from '../../api/users'
import styles from './ProfileParticipant.module.css'


const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function ProfileParticipant() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('personal')
  const [loadingData, setLoadingData] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== formData.email) return
    setDeleting(true)
    try {
      await deleteMe()
      await logout()
      navigate('/')
    } catch {
      setDeleting(false)
      alert('Error al eliminar la cuenta. Inténtalo de nuevo.')
    }
  }
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchMe()
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
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
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'P'
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
        <div className={styles.topbar}>
          <div className={styles.topbarTitle}>Mi perfil</div>
        </div>

        <div className={styles.pageContent}>
          
          <div>
            <div className={styles.profileTabs}>
              <button
                className={`${styles.profileTab} ${activeTab === 'personal' ? styles.active : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Datos personales
              </button>
              <button
                className={`${styles.profileTab} ${activeTab === 'privacy' ? styles.active : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                Privacidad
              </button>
            </div>

            <div className={`${styles.tabPanel} ${activeTab === 'personal' ? styles.active : ''}`}>
              <div className={styles.card}>
                <div className={styles.avatarSection}>
                  <div className={styles.bigAvatar}>
                    {getInitials(`${formData.firstName} ${formData.lastName}`)}
                  </div>
                  <div>
                    <div className={styles.avatarName}>
                      {formData.firstName} {formData.lastName || 'Participante'}
                    </div>
                    <div className={styles.avatarTag}>
                      <IconCheck />
                      Participante activo
                    </div>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Nombre</label>
                    <div className={styles.fieldValue}>{formData.firstName || '—'}</div>
                  </div>

                  <div className={styles.field}>
                    <label>Apellidos</label>
                    <div className={styles.fieldValue}>{formData.lastName || '—'}</div>
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label>Email</label>
                    <div className={styles.fieldValue}>{formData.email}</div>
                  </div>

                </div>

              </div>
            </div>

            <div className={`${styles.tabPanel} ${activeTab === 'privacy' ? styles.active : ''}`}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Privacidad y datos</div>
                <div className={styles.cardSub}>
                  Gestiona cómo se utilizan tus datos en los estudios en los que participas.
                </div>

                <div className={styles.dataRow}>
                  <div className={styles.dataLabel}>Datos compartidos</div>
                  <div className={styles.dataVal}>Solo con investigadores autorizados</div>
                </div>
                <div className={styles.dataRow}>
                  <div className={styles.dataLabel}>Anonimización</div>
                  <div className={styles.dataVal}>Tus respuestas son anónimas</div>
                </div>
                <div className={styles.dataRow}>
                  <div className={styles.dataLabel}>Retención de datos</div>
                  <div className={styles.dataVal}>Según política del estudio</div>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <div className={styles.dangerTitle}>Eliminar cuenta</div>
                <div className={styles.dangerText}>
                  Al eliminar tu cuenta, se borrarán todos tus datos personales y tus inscripciones en estudios. Esta acción no se puede deshacer.
                </div>
                <button className={styles.btnDanger} onClick={() => { setDeleteConfirm(''); setDeleteModal(true) }}>
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardTitle}>Información de cuenta</div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Usuario desde</div>
                <div className={styles.dataVal}>Marzo 2026</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Estudios activos</div>
                <div className={styles.dataVal}>1</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Respuestas enviadas</div>
                <div className={styles.dataVal}>12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => e.target === e.currentTarget && setDeleteModal(false)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 28px 24px', width: 400, maxWidth: '90vw' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--danger,#f87171)' }}>Eliminar cuenta</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Esta acción es permanente e irreversible. Para confirmar, escribe tu correo electrónico.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Confirma tu correo</label>
              <input
                type="email"
                placeholder={formData.email}
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 13 }}>
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== formData.email || deleting}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: deleteConfirm === formData.email ? 'var(--danger,#f87171)' : 'var(--surface-2,#333)', color: 'white', cursor: deleteConfirm === formData.email ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600 }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
