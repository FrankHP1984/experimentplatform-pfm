import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEnrollment, completeEnrollment, signConsent } from '../../api/enrollments'
import { getExperiment } from '../../api/experiments'
import { getPhases } from '../../api/phases'
import { getPhaseQuestions, submitQuestionResponse, getEnrollmentResponses } from '../../api/responses'
import styles from './Questionnaire.module.css'

const IconCheckCircle = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const IconClock = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

function fmtDatetime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function Questionnaire() {
  const { enrollmentId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [waitingFor, setWaitingFor] = useState(null)
  const [nextPhase, setNextPhase] = useState(null)
  const [designType, setDesignType] = useState(null)

  // Consentimiento
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false)
  const [textoConsentimiento, setTextoConsentimiento] = useState('')
  const [consentLeido, setConsentLeido] = useState(false)
  const [firmandoConsentimiento, setFirmandoConsentimiento] = useState(false)

  // IDs de preguntas ya respondidas (no re-enviar al enviar formulario)
  const [yaRespondidas, setYaRespondidas] = useState(new Set())

  const [debriefingText, setDebriefingText] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const enrollmentData = await getEnrollment(enrollmentId)
        setEnrollment(enrollmentData)

        if (enrollmentData.status === 'COMPLETED') {
          setCompleted(true)
          setLoading(false)
          return
        }

        const experimentData = await getExperiment(enrollmentData.experimentId)
        setDesignType(experimentData.designType)

        if (experimentData.debriefingText) {
          setDebriefingText(experimentData.debriefingText)
        }

        // Mostrar consentimiento si el experimento tiene texto y el participante no lo ha firmado
        if (experimentData.consentText && !enrollmentData.consentSignedAt) {
          setTextoConsentimiento(experimentData.consentText)
          setMostrarConsentimiento(true)
          setLoading(false)
          return
        }

        const now = new Date()

        // Si el investigador activó el experimento manualmente, eso prevalece sobre la fecha
        const experimentNotStarted =
          experimentData.status !== 'ACTIVE' &&
          experimentData.startDate &&
          new Date(experimentData.startDate) > now
        if (experimentNotStarted) {
          setWaitingFor({ reason: 'experiment', label: experimentData.title, startDate: experimentData.startDate })
          return
        }

        const phases = await getPhases(enrollmentData.experimentId)
        const sorted = [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder)

        // Para WITHIN_SUBJECTS reordenamos las fases segun la secuencia asignada al participante
        let fasesOrdenadas = sorted
        if (experimentData.designType === 'WITHIN_SUBJECTS' && enrollmentData.phaseSequence) {
          const secuenciaIds = enrollmentData.phaseSequence.split(',').map(id => parseInt(id))
          const fasesReordenadas = []

          for (const phaseId of secuenciaIds) {
            const fase = sorted.find(p => p.id === phaseId)
            if (fase) {
              fasesReordenadas.push(fase)
            }
          }

          // Si hay fases que no estan en la secuencia (por ejemplo recien creadas), las annadimos al final
          for (const fase of sorted) {
            const estaIncluida = fasesReordenadas.some(f => f.id === fase.id)
            if (!estaIncluida) {
              fasesReordenadas.push(fase)
            }
          }

          fasesOrdenadas = fasesReordenadas
        }

        // Para BETWEEN_SUBJECTS filtramos por grupo del participante:
        // solo vemos fases sin grupo asignado (comunes) o las del propio grupo
        const participantPhases = fasesOrdenadas.filter(phase => {
          if (experimentData.designType !== 'BETWEEN_SUBJECTS') return true
          if (phase.groupId === null || phase.groupId === undefined) return true
          return phase.groupId === enrollmentData.groupId
        })

        // ─── PRETEST_POSTTEST: mostrar solo la primera fase sin completar ───
        if (experimentData.designType === 'PRETEST_POSTTEST') {
          const respuestasExistentes = await getEnrollmentResponses(enrollmentId)
          const idsRespondidos = new Set(respuestasExistentes.map(r => r.questionId))
          setYaRespondidas(idsRespondidos)

          let faseActual = null
          let indiceFaseActual = -1

          for (let i = 0; i < participantPhases.length; i++) {
            const fase = participantPhases[i]
            const preguntasFase = await getPhaseQuestions(fase.id)

            if (!preguntasFase || preguntasFase.length === 0) {
              continue
            }

            let todasRespondidas = true
            for (const pregunta of preguntasFase) {
              if (!idsRespondidos.has(pregunta.id)) {
                todasRespondidas = false
                break
              }
            }

            if (!todasRespondidas) {
              faseActual = fase
              indiceFaseActual = i
              break
            }
          }

          if (faseActual === null) {
            await completeEnrollment(enrollmentId).catch(() => {})
            setCompleted(true)
            return
          }

          if (indiceFaseActual + 1 < participantPhases.length) {
            setNextPhase(participantPhases[indiceFaseActual + 1])
          }

          const preguntasFaseActual = await getPhaseQuestions(faseActual.id)
          const allQuestions = preguntasFaseActual.map(q => ({ ...q, phaseName: faseActual.name }))
          setQuestions(allQuestions)
          setLoading(false)
          return
        }

        const activePhasesNow = participantPhases.filter(phase => {
          if (!phase.startDate) return true
          const start = new Date(phase.startDate)
          if (start > now) return false
          if (phase.endDate && new Date(phase.endDate) < now) return false
          return true
        })

        const futurePhasesAhead = participantPhases.filter(phase =>
          phase.startDate && new Date(phase.startDate) > now
        )

        if (activePhasesNow.length === 0 && futurePhasesAhead.length > 0) {
          const next = futurePhasesAhead[0]
          setWaitingFor({ reason: 'phase', label: next.name, startDate: next.startDate })
          return
        }

        // Todas las fases han terminado
        if (activePhasesNow.length === 0 && futurePhasesAhead.length === 0) {
          await completeEnrollment(enrollmentId).catch(() => {})
          setCompleted(true)
          return
        }

        if (futurePhasesAhead.length > 0) {
          setNextPhase(futurePhasesAhead[0])
        }

        const allQuestions = []
        for (const phase of activePhasesNow) {
          const phaseQuestions = await getPhaseQuestions(phase.id)
          if (phaseQuestions && phaseQuestions.length > 0) {
            phaseQuestions.forEach(q => allQuestions.push({ ...q, phaseName: phase.name }))
          }
        }

        // Cargar respuestas ya enviadas para no re-enviarlas (respuestas son inmutables)
        const respExistentes = await getEnrollmentResponses(enrollmentId)
        setYaRespondidas(new Set(respExistentes.map(r => r.questionId)))

        setQuestions(allQuestions)
        setLoading(false)
      } catch (error) {
        console.log('Error cargando cuestionario:', error)
        setError('Error al cargar las preguntas')
        setLoading(false)
      }
    }

    if (enrollmentId) {
      loadData()
    }
  }, [enrollmentId])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      await handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      for (const [questionId, value] of Object.entries(answers)) {
        // Si ya fue respondida antes, saltamos (las respuestas son inmutables)
        if (yaRespondidas.has(parseInt(questionId))) {
          continue
        }
        const question = questions.find(q => q.id === parseInt(questionId))
        const payload = { questionId: parseInt(questionId) }
        if (question?.type === 'BOOLEAN') {
          payload.booleanValue = Boolean(value)
        } else if (question?.type === 'NUMBER' || question?.type === 'SCALE') {
          payload.numericValue = parseInt(value)
        } else {
          payload.textValue = String(value)
        }
        await submitQuestionResponse(enrollmentId, payload)
      }

      if (!nextPhase) {
        await completeEnrollment(enrollmentId).catch(() => {})
      }
      setCompleted(true)
    } catch (error) {
      console.error('Error enviando respuestas:', error)
      setError('No se pudieron enviar las respuestas')
      setSubmitting(false)
    }
  }

  const handleAceptarConsentimiento = async () => {
    setFirmandoConsentimiento(true)
    try {
      await signConsent(enrollmentId)
      setMostrarConsentimiento(false)
    } catch (e) {
      console.error('Error al firmar consentimiento:', e)
      setFirmandoConsentimiento(false)
    }
  }

  const getTypeBadgeClass = (type) => {
    const typeMap = {
      NUMBER: styles.typeNumber,
      SCALE: styles.typeScale,
      TEXT: styles.typeText,
      BOOLEAN: styles.typeBoolean,
      MULTIPLE_CHOICE: styles.typeMultiple,
    }
    return typeMap[type] || styles.typeText
  }

  const getTypeLabel = (type) => {
    const labels = {
      NUMBER: 'Numérica',
      SCALE: 'Escala',
      TEXT: 'Texto',
      BOOLEAN: 'Sí/No',
      MULTIPLE_CHOICE: 'Opción múltiple',
    }
    return labels[type] || type
  }

  const renderInput = () => {
    if (!currentQuestion) return null
    const val = answers[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'NUMBER':
        return (
          <div className={styles.numberInputWrap}>
            <input
              type="number"
              className={styles.numberInput}
              value={val || ''}
              onChange={e => handleAnswer(e.target.value)}
              placeholder="0"
            />
            {currentQuestion.unit && <span className={styles.numberUnit}>{currentQuestion.unit}</span>}
          </div>
        )

      case 'SCALE': {
        const min = currentQuestion.minValue ?? 1
        const max = currentQuestion.maxValue ?? 10
        const values = []
        for (let v = min; v <= max; v++) values.push(v)
        return (
          <div className={styles.scaleWrap}>
            <div className={styles.scaleLabels}>
              <span>{min}</span>
              <span>{max}</span>
            </div>
            <div className={styles.scaleTrack}>
              {values.map(v => (
                <button
                  key={v}
                  className={`${styles.scaleBtn} ${val === v ? styles.selected : ''}`}
                  onClick={() => handleAnswer(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )
      }

      case 'TEXT':
        return (
          <textarea
            className={styles.textInput}
            value={val || ''}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
          />
        )

      case 'BOOLEAN':
        return (
          <div className={styles.booleanOptions}>
            <button
              className={`${styles.booleanBtn} ${val === true ? styles.selected : ''}`}
              onClick={() => handleAnswer(true)}
            >
              Sí
            </button>
            <button
              className={`${styles.booleanBtn} ${val === false ? styles.selected : ''}`}
              onClick={() => handleAnswer(false)}
            >
              No
            </button>
          </div>
        )

      case 'MULTIPLE_CHOICE':
        return (
          <div className={styles.multipleOptions}>
            {(currentQuestion.options || []).map((option, idx) => (
              <div
                key={idx}
                className={`${styles.multipleOption} ${val === option ? styles.selected : ''}`}
                onClick={() => handleAnswer(option)}
              >
                <div className={styles.optionRadio}></div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        )

      default:
        return <div>Tipo de pregunta no soportado</div>
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
        Cargando cuestionario...
      </div>
    )
  }

  if (error && !enrollment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', flexDirection: 'column', gap: '1rem' }}>
        <p>{error}</p>
        <button className={styles.btnPrimary} onClick={() => navigate('/participant/dashboard')}>Volver al panel</button>
      </div>
    )
  }

  // Pantalla de espera temporal
  if (waitingFor) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>Empiri<span>a</span></div>
          <div className={styles.headerActions}>
            <button className={styles.btnGhostSm} onClick={() => navigate('/participant/dashboard')}>Salir</button>
          </div>
        </div>
        <div className={styles.main}>
          <div className={styles.qWrapper}>
            <div className={styles.qCard}>
              <div className={styles.completionCard}>
                <div className={styles.completionIcon}><IconClock /></div>
                <div className={styles.completionTitle}>
                  {waitingFor.reason === 'experiment'
                    ? 'El estudio aún no ha comenzado'
                    : `La fase "${waitingFor.label}" aún no ha comenzado`}
                </div>
                <div className={styles.completionDesc}>
                  Podrás acceder a las preguntas a partir del<br />
                  <strong>{fmtDatetime(waitingFor.startDate)}</strong>
                </div>
                <button className={styles.btnPrimary} onClick={() => navigate('/participant/dashboard')}>
                  Volver al panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mostrarConsentimiento) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>Empiri<span>a</span></div>
          <div className={styles.headerActions}>
            <button className={styles.btnGhostSm} onClick={() => navigate('/participant/dashboard')}>Salir</button>
          </div>
        </div>
        <div className={styles.main}>
          <div className={styles.qWrapper}>
            <div className={styles.qCard}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Consentimiento informado
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
                  Antes de continuar, lee y acepta el consentimiento
                </div>
              </div>

              <div style={{
                maxHeight: 320, overflowY: 'auto', padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 14, lineHeight: 1.7, color: 'var(--muted)',
                marginBottom: 20, whiteSpace: 'pre-wrap'
              }}>
                {textoConsentimiento}
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 24 }}>
                <input
                  type="checkbox"
                  checked={consentLeido}
                  onChange={e => setConsentLeido(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--cyan)', width: 16, height: 16, flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, color: 'var(--text)' }}>
                  He leído el consentimiento informado y acepto participar en este estudio voluntariamente.
                </span>
              </label>

              <div className={styles.qNav}>
                <button className={styles.btnSecondary} onClick={() => navigate('/participant/dashboard')}>
                  Declinar y salir
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleAceptarConsentimiento}
                  disabled={!consentLeido || firmandoConsentimiento}
                >
                  {firmandoConsentimiento ? 'Guardando...' : 'Acepto y continúo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0 && !loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', flexDirection: 'column', gap: '1rem' }}>
        <p>Esta fase no tiene preguntas todavía.</p>
        <button className={styles.btnPrimary} onClick={() => navigate('/participant/dashboard')}>Volver al panel</button>
      </div>
    )
  }

  if (completed) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>Empiri<span>a</span></div>
        </div>
        <div className={styles.main}>
          <div className={styles.qWrapper}>
            <div className={styles.qCard}>
              <div className={styles.completionCard}>
                <div className={styles.completionIcon}><IconCheckCircle /></div>
                <div className={styles.completionTitle}>
                  {nextPhase ? '¡Fase completada!' : '¡Cuestionario completado!'}
                </div>
                <div className={styles.completionDesc}>
                  {nextPhase
                    ? <>Tus respuestas han sido guardadas. La siguiente fase, <strong>{nextPhase.name}</strong>, comenzará el <strong>{fmtDatetime(nextPhase.startDate)}</strong>.</>
                    : 'Gracias por completar este cuestionario. Tus respuestas han sido guardadas correctamente.'
                  }
                </div>
                {debriefingText && !nextPhase && (
                  <div style={{
                    marginTop: 24, textAlign: 'left', padding: '16px 18px',
                    background: 'rgba(0,212,170,0.06)', borderRadius: 10,
                    border: '1px solid rgba(0,212,170,0.2)', fontSize: 14,
                    lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-wrap',
                    maxHeight: 280, overflowY: 'auto'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Información sobre el estudio
                    </div>
                    {debriefingText}
                  </div>
                )}
                <button className={styles.btnPrimary} onClick={() => navigate('/participant/dashboard')}>
                  Volver al panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>Empiri<span>a</span></div>

        <div className={styles.studyContext}>
          <div className={styles.studyName}>{enrollment?.experimentTitle || 'Cuestionario'}</div>
          {currentQuestion?.phaseName && (
            <div className={styles.phaseLabel}>{currentQuestion.phaseName}</div>
          )}
        </div>

        <div className={styles.headerActions}>
          <button className={styles.btnGhostSm} onClick={() => navigate('/participant/dashboard')}>
            Salir
          </button>
        </div>
      </div>

      <div className={styles.progressBand}>
        <div className={styles.progressLabel}>
          Pregunta {currentIndex + 1} de {questions.length}
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.qDots}>
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.qDot} ${
                idx < currentIndex ? styles.done : idx === currentIndex ? styles.active : ''
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.qWrapper}>

          {/* Aviso de sesión única para Cross-Sectional */}
          {designType === 'CROSS_SECTIONAL' && currentIndex === 0 && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FB923C10', borderRadius: 8, border: '1px solid #FB923C33', fontSize: 13, color: '#FB923C', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600, flexShrink: 0 }}>Encuesta de sesión única.</span>
              <span style={{ color: 'var(--muted)' }}>Una vez enviadas tus respuestas no podrás modificarlas.</span>
            </div>
          )}

          {currentQuestion?.phaseName && (
            <div className={styles.phasePill}>
              <div className={styles.phasePillDot}></div>
              {currentQuestion.phaseName}
            </div>
          )}

          {currentQuestion && (
            <div className={styles.qCard}>
              {error && <div style={{ color: 'var(--red)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

              <div className={styles.qMeta}>
                <div className={styles.qNumber}>Pregunta {currentIndex + 1}/{questions.length}</div>
                <div className={`${styles.qTypeBadge} ${getTypeBadgeClass(currentQuestion.type)}`}>
                  {getTypeLabel(currentQuestion.type)}
                </div>
              </div>

              <div className={styles.qText}>{currentQuestion.text}</div>
              {currentQuestion.description && (
                <div className={styles.qSub}>{currentQuestion.description}</div>
              )}

              {renderInput()}

              <div className={styles.qNav}>
                <button
                  className={styles.btnSecondary}
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  style={{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }}
                >
                  Anterior
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleNext}
                  disabled={submitting || answers[currentQuestion.id] === undefined}
                >
                  {submitting ? 'Enviando...' : currentIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
