import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useExperiments } from '../../hooks/useExperiments'
import styles from './Dashboard.module.css'

/* ─── SVG icons ─── */
const IconExperiments = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
  </svg>
)
const IconParticipants = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconResponses = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
/* ─── Helpers ─── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

const STATUS_LABEL = {
  DRAFT:    'Borrador',
  ACTIVE:   'Activo',
  PAUSED:   'Pausado',
  FINISHED: 'Finalizado',
}
const STATUS_CLASS = {
  DRAFT:    'draft',
  ACTIVE:   'active',
  PAUSED:   'paused',
  FINISHED: 'finished',
}

/* ─── Onboarding steps computed from experiments data ─── */
function computeOnboardingSteps(experiments) {
  const hasExp = experiments.length > 0
  const hasActive = experiments.some(e => e.status === 'ACTIVE')

  const steps = [
    { key: 'account', label: 'Cuenta creada',        done: true,     active: false },
    { key: 'exp',     label: 'Experimento creado',   done: hasExp,   active: !hasExp },
    { key: 'active',  label: 'Activar experimento',  done: hasActive, active: hasExp && !hasActive },
  ]
  const allDone = steps.every(s => s.done)
  return { steps, allDone }
}

/* ─── New Experiment Modal ─── */
function NewExperimentModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    design: 'PRETEST_POSTTEST',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim()) { setError('El titulo es obligatorio'); return }
    setLoading(true)
    try {
      await onCreate({
        title: form.title.trim(),
        design: form.design,
        startDate: form.startDate ? form.startDate + 'T00:00:00' : undefined,
        endDate:   form.endDate   ? form.endDate   + 'T00:00:00' : undefined,
      })
      setForm({ title: '', design: 'PRETEST_POSTTEST', startDate: '', endDate: '' })
      onClose()
    } catch (error) {
      console.log('Error creando experimento:', error)
      setError('No se pudo crear el experimento')
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Nuevo experimento</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>
        <p className={styles.modalSub}>
          Crea un nuevo experimento y empieza a configurarlo paso a paso.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Titulo del experimento</label>
            <input
              className={styles.formInput}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej. Efecto del ejercicio en la atencion sostenida"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tipo de diseno</label>
            <select
              className={styles.formInput}
              name="design"
              value={form.design}
              onChange={handleChange}
            >
              <option value="PRETEST_POSTTEST">Pretest-Postest</option>
              <option value="BETWEEN_SUBJECTS">Entre grupos</option>
              <option value="WITHIN_SUBJECTS">Intra sujeto</option>
              <option value="LONGITUDINAL">Longitudinal</option>
              <option value="CROSS_SECTIONAL">Transversal</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de inicio</label>
              <input
                className={styles.formInput}
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de fin</label>
              <input
                className={styles.formInput}
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className={styles.formError}>{error}</p>}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.btnModal} ${styles.btnGhost}`}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btnModal} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear experimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Main Dashboard component ─── */
export default function Dashboard() {
  const { user }                        = useAuthContext()
  const { experiments, loading, create } = useExperiments()
  const navigate                        = useNavigate()
  const [showModal, setShowModal]       = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const firstName   = user?.name?.split(' ')[0] || 'Investigador'
  const greeting    = getGreeting()

  const totalExp    = experiments.length
  const activeExps  = experiments.filter(e => e.status === 'ACTIVE').length
  const finishedExps = experiments.filter(e => e.status === 'FINISHED').length

  const draftExps   = experiments.filter(e => e.status === 'DRAFT')
  const activeDraft = draftExps[0]

  const { steps: onboardingSteps, allDone: onboardingDone } = computeOnboardingSteps(experiments)

  const handleCreate = async (data) => {
    await create(data)
  }

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>Dashboard</span>
        </div>
        <div className={styles.topbarActions}>
          <button
            className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
            onClick={() => setShowModal(true)}
          >
            <IconPlus />
            Nuevo experimento
          </button>
          {activeDraft && (
            <button
              className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
              onClick={() => navigate(`/experiments/${activeDraft.id}`)}
            >
              <IconChevronRight />
              Continuar borrador
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className={styles.contenido}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <button className={styles.backLink} onClick={() => navigate('/')}>
              ← Volver al inicio
            </button>
            <h1 className={styles.title}>{greeting}, {firstName}</h1>
            <p className={styles.subtitulo}>Aquí tienes un resumen de tus experimentos activos</p>
          </div>
        </div>

        {/* Onboarding banner */}
        {!onboardingDone && !bannerDismissed && (
          <div className={styles.banner}>
            <div className={styles.bannerLeft}>
              <div className={styles.bannerTitle}>
                <div className={styles.bannerDot} />
                Completa la configuracion de tu primer experimento
              </div>
              <div className={styles.bannerSteps}>
                {onboardingSteps.map((step, i) => (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      className={`${styles.bannerStep} ${
                        step.done   ? styles.bannerStepDone   :
                        step.active ? styles.bannerStepActive :
                        styles.bannerStepPending
                      }`}
                    >
                      {step.done && <IconCheck />}
                      {step.label}
                    </div>
                    {i < onboardingSteps.length - 1 && (
                      <span className={styles.bannerArr}><IconChevronRight /></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              className={styles.bannerDismiss}
              onClick={() => setBannerDismissed(true)}
              aria-label="Cerrar"
            >
              <IconX />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Experimentos</span>
              <div className={`${styles.statIcon} ${styles.statIconViolet}`}>
                <IconExperiments />
              </div>
            </div>
            <div className={styles.statValue}>{totalExp}</div>
            <div className={styles.statDelta}>
              {totalExp === 0 ? 'Ningún experimento aún' : `${totalExp} en total`}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Activos</span>
              <div className={`${styles.statIcon} ${styles.statIconCyan}`}>
                <IconParticipants />
              </div>
            </div>
            <div className={styles.statValue}>{activeExps}</div>
            <div className={styles.statDelta}>
              {activeExps === 0 ? 'Ningún experimento activo' : 'en ejecución ahora'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Finalizados</span>
              <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                <IconResponses />
              </div>
            </div>
            <div className={styles.statValue}>{finishedExps}</div>
            <div className={styles.statDelta}>
              {finishedExps === 0 ? 'Ninguno completado aún' : 'experimentos completados'}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className={styles.statLabel}>Borradores</span>
              <div className={`${styles.statIcon} ${styles.statIconGray}`}>
                <IconShield />
              </div>
            </div>
            <div className={`${styles.statValue} ${styles.statValueCyan}`}>{draftExps.length}</div>
            <div className={styles.statDelta}>
              {draftExps.length === 0 ? 'Sin borradores pendientes' : 'pendientes de configurar'}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div>

          {/* Experiments card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Mis experimentos</span>
            </div>

            {loading ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyDesc}>Cargando...</p>
              </div>
            ) : experiments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><IconPlus /></div>
                <div className={styles.emptyTitle}>Crea tu primer experimento</div>
                <div className={styles.emptyDesc}>
                  Todavia no tienes ningun experimento. Empieza creando uno ahora.
                </div>
                <button
                  className={`${styles.btnSm} ${styles.btnSmPrimary}`}
                  onClick={() => setShowModal(true)}
                >
                  <IconPlus />
                  Nuevo experimento
                </button>
              </div>
            ) : (
              <>
                {experiments.map(exp => (
                  <div
                    key={exp.id}
                    className={styles.expItem}
                    onClick={() => navigate(`/experiments/${exp.id}`)}
                  >
                    <div
                      className={styles.expColor}
                      style={{
                        background: exp.status === 'ACTIVE' ? 'var(--cyan)' : 'var(--violet)',
                      }}
                    />
                    <div className={styles.expInfo}>
                      <div className={styles.expTitle}>{exp.title}</div>
                      <div className={styles.expMeta}>
                        <span>{exp.designType || 'Sin diseño'}</span>
                        {exp.startDate && (
                          <>
                            <span className={styles.expMetaSep}>·</span>
                            <span>{new Date(exp.startDate).toLocaleDateString('es-ES')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.expRight}>
                      <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[exp.status] || 'draft']}`}>
                        {STATUS_LABEL[exp.status] || exp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

        </div>
      </div>

      {/* New experiment modal */}
      <NewExperimentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
