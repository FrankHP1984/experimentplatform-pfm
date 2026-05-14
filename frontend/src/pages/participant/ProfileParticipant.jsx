import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import { useAuthContext } from '../../context/AuthContext'
import { fetchMe } from '../../api/users'
import styles from './ProfileParticipant.module.css'


const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function ProfileParticipant() {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState('personal')
  const [loadingData, setLoadingData] = useState(true)
  
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
                    <input type="text" value={formData.firstName} readOnly placeholder="Tu nombre" />
                  </div>

                  <div className={styles.field}>
                    <label>Apellidos</label>
                    <input type="text" value={formData.lastName} readOnly placeholder="Tus apellidos" />
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                    />
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
                  Al eliminar tu cuenta, se eliminarán todos tus datos personales. Tus respuestas en estudios activos se mantendrán de forma anónima.
                </div>
                <button className={styles.btnDanger}>
                  Solicitar eliminación de cuenta
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

    </div>
  )
}
