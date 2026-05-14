import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import { useAuthContext } from '../../context/AuthContext'
import { getMyEnrollments } from '../../api/enrollments'
import { getEnrollmentResponses } from '../../api/responses'
import styles from './DashboardParticipant.module.css'

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconActivity = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)

export default function DashboardParticipant() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [enrichedEnrollments, setEnrichedEnrollments] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const enrollmentsData = await getMyEnrollments()
        const enrollmentsList = enrollmentsData.content || enrollmentsData
        setEnrollments(enrollmentsList)

        // Enriquecer con respuestas
        const enriched = await Promise.all(
          enrollmentsList.map(async (enrollment) => {
            try {
              const responses = await getEnrollmentResponses(enrollment.id).catch(() => [])
              return {
                ...enrollment,
                responseCount: responses.length || 0
              }
            } catch {
              return { ...enrollment, responseCount: 0 }
            }
          })
        )
        setEnrichedEnrollments(enriched)
      } catch (error) {
        console.error('Error loading enrollments:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getUserName = () => {
    if (user?.firstName) return user.firstName
    return user?.email?.split('@')[0] || 'Participante'
  }

  const getStatusClass = (status) => {
    if (status === 'ACTIVE') return 'active'
    if (status === 'COMPLETED') return 'finished'
    return 'pending'
  }

  const getStatusLabel = (status) => {
    if (status === 'ACTIVE') return 'Activo'
    if (status === 'COMPLETED') return 'Finalizado'
    if (status === 'WITHDRAWN') return 'Retirado'
    return 'Pendiente'
  }

  const pendingEnrollments = enrichedEnrollments.filter(e => e.status === 'ACTIVE')

  if (loading) {
    return (
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.mainArea}>
          <div style={{ padding: '2rem', color: 'var(--text)' }}>
            Cargando estudios...
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
          <div className={styles.topbarTitle}>Panel principal</div>
        </div>

        <div className={styles.content}>
          <div className={styles.greeting}>
            <div className={styles.greetingTitle}>
              {getGreeting()}, {getUserName()}
            </div>
            <div className={styles.greetingSub}>
              Aquí puedes ver tus estudios activos y completar cuestionarios pendientes.
            </div>
          </div>

          {pendingEnrollments.length > 0 && (
            <div 
              className={styles.pendingAlert}
              onClick={() => navigate(`/participant/study/${pendingEnrollments[0].id}/questionnaire`)}
            >
              <div className={styles.pendingAlertLeft}>
                <div className={styles.pendingIcon}>
                  <IconBell />
                </div>
                <div>
                  <div className={styles.pendingTitle}>
                    Tienes {pendingEnrollments.length} cuestionario{pendingEnrollments.length > 1 ? 's' : ''} pendiente{pendingEnrollments.length > 1 ? 's' : ''}
                  </div>
                  <div className={styles.pendingDesc}>
                    Completa tus respuestas para continuar con el estudio
                  </div>
                </div>
              </div>
              <div className={styles.pendingArrow}>
                <IconArrowRight />
              </div>
            </div>
          )}

          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>Mis estudios</div>
          </div>

          {enrichedEnrollments.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No tienes estudios activos</h3>
              <p>Cuando aceptes una invitación a un estudio, aparecerá aquí.</p>
            </div>
          ) : (
            <div className={styles.studiesList}>
              {enrichedEnrollments.map((enrollment) => (
                <div key={enrollment.id} className={styles.studyCard}>
                  <div className={styles.studyCardHeader}>
                    <div className={styles.studyCardLeft}>
                      <div className={styles.studyMeta}>
                        <span className={`${styles.studyStatus} ${styles[getStatusClass(enrollment.status)]}`}>
                          {getStatusLabel(enrollment.status)}
                        </span>
                      </div>
                      <div className={styles.studyName}>
                        {enrollment.experimentTitle || 'Estudio sin nombre'}
                      </div>
                    </div>
                  </div>

                  <div className={styles.studyCardFooter}>
                    <div className={styles.studyCardFooterLeft}>
                      <div className={styles.footerStat}>
                        <IconActivity />
                        <strong>{enrollment.responseCount || 0}</strong> respuestas
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
