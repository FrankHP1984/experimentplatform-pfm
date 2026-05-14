import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { updateMe } from '../../api/users'
import styles from './Onboarding.module.css'

/* ─── SVG Icons ─── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

/* ─── Step data ─── */
const STEPS = [
  { number: 1, title: 'Tu rol',            subtitle: 'Una última cosa antes de empezar' },
  { number: 2, title: 'Tu investigación',  subtitle: 'Área y tipo de trabajo' },
  { number: 3, title: 'Todo listo',        subtitle: 'Empieza a investigar' },
]

const RESEARCH_AREAS = [
  'Psicología',
  'Neurociencia',
  'Educación',
  'Ciencias de la salud',
  'Ciencias sociales',
  'Economía conductual',
  'Ingeniería',
  'Otra',
]

const EXPERIMENT_TYPES = [
  { value: 'PRETEST_POSTTEST',    label: 'Pretest–Postest',   desc: 'Medición antes y después de una intervención' },
  { value: 'BETWEEN_SUBJECTS',  label: 'Entre grupos',      desc: 'Comparar grupos de participantes distintos' },
  { value: 'WITHIN_SUBJECTS',   label: 'Intra sujeto',      desc: 'El mismo participante en todas las condiciones' },
  { value: 'LONGITUDINAL',      label: 'Longitudinal',      desc: 'Seguimiento a lo largo del tiempo' },
  { value: 'CROSS_SECTIONAL',   label: 'Transversal',       desc: 'Muestra diversa en un único momento' },
]

export default function Onboarding() {
  const { user, setUser } = useAuthContext()
  const navigate          = useNavigate()

  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const [form, setForm] = useState({
    role_title:       '',
    research_area:    '',
    preferred_design: '',
  })

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  /* ─── Step validations ─── */
  const canContinueStep1 = true
  const canContinueStep2 = form.research_area !== ''

  /* ─── Submit final step ─── */
  const handleFinish = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        roleTitle:        form.role_title.trim(),
        researchArea:     form.research_area,
        preferredDesign:  form.preferred_design,
      }
      const updated = await updateMe(payload)
      setUser(updated)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al guardar tu perfil')
      setLoading(false)
    }
  }

  const handleSkip = () => navigate('/dashboard')

  return (
    <div className={styles.page}>
      {/* Background particles feel — subtle radial glow */}
      <div className={styles.glow} />

      {/* Logo */}
      <div className={styles.logoBar}>
        <div className={styles.logoIcon}>S</div>
        <span className={styles.logoText}>
          Sophe<span className={styles.logoAccent}>ron</span>
        </span>
      </div>

      {/* Step indicator */}
      <div className={styles.stepIndicator}>
        {STEPS.map((s, i) => (
          <div key={s.number} className={styles.stepIndicatorItem}>
            <div
              className={`${styles.stepDot} ${
                step > s.number  ? styles.stepDotDone   :
                step === s.number ? styles.stepDotActive :
                styles.stepDotPending
              }`}
            >
              {step > s.number ? <IconCheck /> : s.number}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${step > s.number ? styles.stepLineDone : ''}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h1 className={styles.cardTitle}>{STEPS[step - 1].title}</h1>
          <p className={styles.cardSubtitle}>{STEPS[step - 1].subtitle}</p>
        </div>

        {/* ── Step 1: Rol ── */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tu rol  <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                className={styles.input}
                value={form.role_title}
                onChange={e => set('role_title', e.target.value)}
                placeholder="Ej. Investigador principal, Doctorando, Estudiante de máster..."
                autoFocus
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Research area ── */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Área de investigación</label>
              <div className={styles.chipGrid}>
                {RESEARCH_AREAS.map(area => (
                  <button
                    key={area}
                    type="button"
                    className={`${styles.chip} ${form.research_area === area ? styles.chipActive : ''}`}
                    onClick={() => set('research_area', area)}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tipo de experimento favorito  <span className={styles.optional}>(opcional)</span>
              </label>
              <div className={styles.designList}>
                {EXPERIMENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`${styles.designOption} ${form.preferred_design === t.value ? styles.designOptionActive : ''}`}
                    onClick={() => set('preferred_design', t.value)}
                  >
                    <div className={styles.designOptionLabel}>{t.label}</div>
                    <div className={styles.designOptionDesc}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Ready ── */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.readyBlock}>
              <div className={styles.readyAvatar}>
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
                  || user?.email?.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.readyName}>
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email}
              </div>
              {user?.institution && (
                <div className={styles.readyInstitution}>{user.institution}</div>
              )}
              {form.research_area && (
                <span className={styles.readyBadge}>{form.research_area}</span>
              )}
            </div>

            <div className={styles.readyFeatures}>
              {[
                'Crea experimentos con diseno flexible',
                'Gestiona participantes y grupos',
                'Recoge y analiza respuestas en tiempo real',
              ].map(feat => (
                <div key={feat} className={styles.readyFeature}>
                  <div className={styles.readyFeatureIcon}><IconCheck /></div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        )}

        {/* Footer actions */}
        <div className={styles.cardFooter}>
          <div className={styles.footerLeft}>
            {step > 1 && (
              <button
                className={styles.btnBack}
                onClick={() => setStep(s => s - 1)}
                disabled={loading}
              >
                <IconArrowLeft />
                Atrás
              </button>
            )}
            {step === 1 && (
              <button className={styles.btnSkip} onClick={handleSkip}>
                Saltar por ahora
              </button>
            )}
          </div>

          <div className={styles.footerRight}>
            {step < 3 && (
              <button
                className={styles.btnNext}
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 ? !canContinueStep1 : !canContinueStep2}
              >
                Continuar
                <IconArrowRight />
              </button>
            )}
            {step === 3 && (
              <button
                className={styles.btnFinish}
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Ir al dashboard'}
                {!loading && <IconArrowRight />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step label */}
      <p className={styles.stepLabel}>
        Paso {step} de {STEPS.length}
      </p>
    </div>
  )
}
