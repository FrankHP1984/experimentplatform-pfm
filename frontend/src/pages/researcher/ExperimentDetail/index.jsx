import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as experimentsApi from '../../../api/experiments'
import * as phasesApi      from '../../../api/phases'
import * as groupsApi      from '../../../api/groups'
import * as questionsApi   from '../../../api/questions'
import * as enrollmentsApi from '../../../api/enrollments'
import { assignGroup, forceDeleteEnrollment } from '../../../api/enrollments'
import { getExperimentInvitations } from '../../../api/invitations'
import styles from './ExperimentDetail.module.css'

// Modales extraidos a archivos separados
import ConfirmModal from './modals/ConfirmModal'
import PhaseModal from './modals/PhaseModal'
import GroupModal from './modals/GroupModal'
import QuestionModal from './modals/QuestionModal'
import InviteLinkModal from './modals/InviteLinkModal'

/* ─── SVG Icons ─── */
// Atributos comunes para los iconos (copiados de Lucide Icons)
const S = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round', style: { width: 16, height: 16, flexShrink: 0 } }

const IcoPlus     = () => <svg {...S}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IcoEdit     = () => <svg {...S}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash    = () => <svg {...S}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const IcoLink     = () => <svg {...S}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const IcoPlay     = () => <svg {...S}><circle cx="12" cy="12" r="10"/><polyline points="10 8 16 12 10 16"/></svg>
const IcoPause    = () => <svg {...S}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
const IcoCal      = () => <svg {...S}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IcoChev     = () => <svg {...S}><polyline points="9 18 15 12 9 6"/></svg>
const IcoDoc      = () => <svg {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IcoList     = () => <svg {...S}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const IcoPeople   = () => <svg {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoPerson   = () => <svg {...S}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
const IcoWave     = () => <svg {...S}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IcoCopy     = () => <svg {...S}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const IcoDownload = () => <svg {...S}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IcoDots     = () => <svg {...S}><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/></svg>
const IcoX        = () => <svg {...S}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoDrag     = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
    <circle cx="9" cy="5" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="9" cy="19" r="1.2"/>
    <circle cx="15" cy="5" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="15" cy="19" r="1.2"/>
  </svg>
)

/* ─── Status helpers ─── */
const STATUS_LABEL = { DRAFT: 'Borrador', ACTIVE: 'Activo', PAUSED: 'Pausado', FINISHED: 'Finalizado' }
const STATUS_CSS   = { DRAFT: 'draft', ACTIVE: 'active', PAUSED: 'paused', FINISHED: 'finished' }

const DESIGN_LABEL = {
  PRETEST_POSTTEST:  'Pretest–Postest',
  BETWEEN_SUBJECTS: 'Entre grupos',
  WITHIN_SUBJECTS:  'Intra sujeto',
  LONGITUDINAL:     'Longitudinal',
  CROSS_SECTIONAL:  'Transversal',
}

const Q_TYPE_LABEL = {
  TEXT: 'Texto', NUMBER: 'Numerica', SCALE: 'Escala',
  MULTIPLE_CHOICE: 'Multiple', BOOLEAN: 'Si / No',
}
const Q_TYPE_CSS = {
  TEXT: 'typeText', NUMBER: 'typeNumber', SCALE: 'typeScale',
  MULTIPLE_CHOICE: 'typeMultiple', BOOLEAN: 'typeBoolean',
}

const ENROLL_STATUS_LABEL = { ACTIVE: 'Activo', PENDING: 'Pendiente', COMPLETED: 'Completado', WITHDRAWN: 'Retirado' }
const ENROLL_STATUS_CSS   = { ACTIVE: 'eActive', PENDING: 'ePending', COMPLETED: 'eCompleted', WITHDRAWN: 'eWithdrawn' }

const DESIGN_PHASE_DESC = {
  PRETEST_POSTTEST:  'Medicion inicial y final en los mismos participantes.',
  BETWEEN_SUBJECTS:  'Cada fase puede asignarse a un grupo concreto o ser comun para todos.',
  LONGITUDINAL:      'Cada fase es un punto temporal del seguimiento (T1, T2...).',
  WITHIN_SUBJECTS:   'Todos los participantes pasan por todas las condiciones en orden.',
  CROSS_SECTIONAL:   'Medicion en un unico momento. Suele bastar con una sola fase.',
}

function getPhaseBadge(designType, index) {
  if (designType === 'WITHIN_SUBJECTS') {
    const colores = ['#F472B6', '#6C4DE6', '#00D4AA', '#60A5FA', '#FB923C']
    const color = colores[index % colores.length]
    return { label: `Condicion ${index + 1}`, bg: color + '22', color: color }
  }
  if (designType === 'LONGITUDINAL') {
    return { label: `T${index + 1}`, bg: '#60A5FA22', color: '#60A5FA' }
  }
  if (designType === 'CROSS_SECTIONAL' && index === 0) {
    return { label: 'Medicion', bg: '#FB923C22', color: '#FB923C' }
  }
  return null
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── Helpers para Longitudinal ─── */

// Devuelve el estado temporal de una fase basándose en la fecha actual
function obtenerEstadoFase(phase) {
  if (!phase.startDate) {
    return 'sin-fecha'
  }

  const ahora = new Date()
  const inicio = new Date(phase.startDate)

  if (inicio > ahora) {
    return 'proxima'
  }

  if (phase.endDate) {
    const fin = new Date(phase.endDate)
    if (fin < ahora) {
      return 'pasada'
    }
  }

  return 'activa'
}

const ESTADO_FASE_CONFIG = {
  activa:    { label: 'Ventana abierta', bg: '#00D4AA22', color: '#00D4AA' },
  proxima:   { label: 'Próxima',         bg: '#60A5FA22', color: '#60A5FA' },
  pasada:    { label: 'Cerrada',         bg: '#6B7A9922', color: '#6B7A99' },
  'sin-fecha': { label: null,            bg: null,        color: null      },
}

/* ─── Helpers para Within-Subjects ─── */

// Convierte "3,1,2" en "Condicion B → Condicion A → Condicion C" usando los nombres de las fases
function mostrarSecuencia(phaseSequence, phases) {
  if (!phaseSequence) {
    return '—'
  }

  const ids = phaseSequence.split(',').map(id => parseInt(id))
  const nombres = []

  for (const id of ids) {
    const fase = phases.find(p => p.id === id)
    if (fase) {
      nombres.push(fase.name)
    }
  }

  if (nombres.length === 0) {
    return '—'
  }

  return nombres.join(' → ')
}

/* ─── Helpers para Between-Subjects ─── */

// Calcula cuántos participantes tiene cada grupo y si están equilibrados
function calcularDistribucion(grupos, enrollments) {
  const resultado = []
  const total = enrollments.length

  for (const g of grupos) {
    const cuenta = enrollments.filter(e => e.groupId === g.id).length
    let porcentaje = 0
    if (total > 0) {
      porcentaje = Math.round((cuenta / total) * 100)
    }
    resultado.push({ grupo: g, cuenta: cuenta, porcentaje: porcentaje })
  }

  return resultado
}

// Devuelve true si todos los grupos tienen diferencia de <= 1 participante entre ellos
function gruposEquilibrados(grupos, enrollments) {
  if (grupos.length < 2) {
    return true
  }
  if (enrollments.length === 0) {
    return true
  }

  let minimo = Infinity
  let maximo = 0

  for (const g of grupos) {
    const cuenta = enrollments.filter(e => e.groupId === g.id).length
    if (cuenta < minimo) {
      minimo = cuenta
    }
    if (cuenta > maximo) {
      maximo = cuenta
    }
  }

  return (maximo - minimo) <= 1
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function ExperimentDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  /* ─── State ─── */
  const [exp,          setExp]          = useState(null)
  const [phases,       setPhases]       = useState([])
  const [groups,       setGroups]       = useState([])
  const [questions,    setQuestions]    = useState({})   // { phaseId: [...] }
  const [enrollments,  setEnrollments]  = useState([])
  const [invitations,  setInvitations]  = useState([])
  const [activeTab,    setActiveTab]    = useState('phases')
  const [activePhaseQ, setActivePhaseQ] = useState(null)  // for questions tab
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  /* modals */
  const [phaseModal,   setPhaseModal]   = useState({ open: false, initial: null })
  const [groupModal,   setGroupModal]   = useState({ open: false, initial: null })
  const [questionModal,setQuestionModal]= useState({ open: false, initial: null })
  const [inviteModal,  setInviteModal]  = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', desc: '', danger: false, onConfirm: null })
  const [statusLoading,setStatusLoading]= useState(false)
  const [groupFilter,  setGroupFilter]  = useState(null)
  const [launchError,  setLaunchError]  = useState(null)  // array of strings | null

  /* ─── Load experiment + phases + groups + enrollments ─── */
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      setError('')
      try {
        const [expData, phasesData, groupsData, enrollData, invData] = await Promise.all([
          experimentsApi.getExperiment(id),
          phasesApi.getPhases(id),
          groupsApi.getGroups(id),
          enrollmentsApi.getEnrollments(id),
          getExperimentInvitations(id),
        ])
        setExp(expData)
        setPhases(phasesData)
        setGroups(groupsData)
        setEnrollments(enrollData?.content || [])
        setInvitations(invData || [])
        if (phasesData.length > 0) setActivePhaseQ(phasesData[0].id)
      } catch (error) {
        console.log('Error:', error)
        setError('Error cargando datos del experimento')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [id])

  /* ─── Load questions for a phase ─── */
  const loadQuestions = async (phaseId) => {
    if (questions[phaseId]) return
    try {
      const data = await questionsApi.getQuestions(phaseId)
      setQuestions(q => ({ ...q, [phaseId]: data }))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'questions' && activePhaseQ) {
      loadQuestions(activePhaseQ)
    }
  }, [activeTab, activePhaseQ])

  /* ─── Computed ─── */
  const totalQuestions = phases.reduce((s, p) => {
    const loaded = questions[p.id]
    return s + (loaded ? loaded.length : (p.questionCount || 0))
  }, 0)
  const currentQuestions = activePhaseQ ? (questions[activePhaseQ] || []) : []

  /* ─── Delete experiment ─── */
  const handleDeleteExperiment = () => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar experimento',
      desc: `¿Eliminar "${exp.title}"? Esta acción no se puede deshacer. Se borrarán todas sus fases, grupos y preguntas.`,
      onConfirm: async () => {
        await experimentsApi.deleteExperiment(id)
        navigate('/dashboard')
      },
    })
  }

  /* ─── Launch validation ─── */
  const validarLanzamiento = () => {
    const errores = []
    const design  = exp?.designType
    const nFases  = phases.length
    const nGrupos = groups.length
    const nPregs  = phases.reduce((s, p) => s + (questions[p.id]?.length ?? p.questionCount ?? 0), 0)
    const fasesSinPreguntas = phases.filter(p => (questions[p.id]?.length ?? p.questionCount ?? 0) === 0)

    if (design === 'PRETEST_POSTTEST') {
      if (nFases < 2)
        errores.push(`Faltan fases: este diseño necesita exactamente 2 (Pretest y Postest), y solo tiene ${nFases}.`)
    }

    if (design === 'BETWEEN_SUBJECTS') {
      if (nGrupos < 2)
        errores.push(`Faltan grupos: necesitas al menos 2 grupos (uno por condición experimental), y solo tiene ${nGrupos}.`)
      if (nFases < 1)
        errores.push('Falta al menos una fase con preguntas.')
    }

    if (design === 'LONGITUDINAL') {
      if (nFases < 2)
        errores.push(`Faltan fases: un diseño longitudinal necesita al menos 2 puntos temporales, y solo tiene ${nFases}.`)
      const fasesSinFecha = phases.filter(p => !p.startDate)
      if (fasesSinFecha.length > 0)
        errores.push(`${fasesSinFecha.length === phases.length ? 'Ninguna' : `${fasesSinFecha.length}`} fase${fasesSinFecha.length > 1 ? 's' : ''} tiene fecha de inicio configurada. Sin fechas no se controlan las ventanas temporales.`)
    }

    if (design === 'WITHIN_SUBJECTS') {
      if (nFases < 2)
        errores.push(`Faltan fases: cada condición experimental necesita su propia fase, y solo tienes ${nFases}.`)
    }

    if (design === 'CROSS_SECTIONAL') {
      if (nFases < 1)
        errores.push('Falta al menos una fase con las preguntas del estudio.')
    }

    if (nPregs === 0)
      errores.push('Ninguna fase tiene preguntas configuradas. Los participantes no tendrían nada que responder.')
    else if (fasesSinPreguntas.length > 0)
      errores.push(`${fasesSinPreguntas.length === 1 ? 'La fase' : `${fasesSinPreguntas.length} fases`} "${fasesSinPreguntas.map(f => f.name).join('", "')}" no tiene${fasesSinPreguntas.length > 1 ? 'n' : ''} preguntas.`)

    return errores
  }

  /* ─── Status change ─── */
  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'ACTIVE') {
      const errores = validarLanzamiento()
      if (errores.length > 0) {
        setLaunchError(errores)
        return
      }
    }
    setStatusLoading(true)
    try {
      const updated = await experimentsApi.patchExperimentStatus(id, newStatus)
      setExp(updated)
    } catch (error) {
      alert('No se pudo cambiar el estado')
    } finally {
      setStatusLoading(false)
    }
  }

  /* ─── Phases CRUD ─── */
  const savePhase = async (data) => {
    if (phaseModal.initial?.id) {
      const updatePayload = { ...data }
      if (exp?.designType === 'BETWEEN_SUBJECTS' && data.groupId === null) {
        updatePayload.clearGroup = true
        delete updatePayload.groupId
      }
      const updated = await phasesApi.updatePhase(id, phaseModal.initial.id, updatePayload)
      setPhases(ps => ps.map(p => p.id === updated.id ? updated : p))
    } else {
      const payload = { ...data, phaseOrder: phases.length + 1 }
      const created = await phasesApi.createPhase(id, payload)
      setPhases(ps => [...ps, created])
      setActivePhaseQ(created.id)
    }
  }

  const deletePhase = (phase) => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar fase',
      desc: `¿Eliminar "${phase.name}"? Se borrarán también sus preguntas.`,
      onConfirm: async () => {
        await phasesApi.deletePhase(id, phase.id)
        setPhases(ps => ps.filter(p => p.id !== phase.id))
        setQuestions(q => { const next = {...q}; delete next[phase.id]; return next })
        if (activePhaseQ === phase.id) setActivePhaseQ(phases.find(p => p.id !== phase.id)?.id || null)
        setConfirmModal(c => ({ ...c, open: false }))
      },
    })
  }

  /* ─── Groups CRUD ─── */
  const saveGroup = async (data) => {
    if (groupModal.initial?.id) {
      const updated = await groupsApi.updateGroup(id, groupModal.initial.id, data)
      setGroups(gs => gs.map(g => g.id === updated.id ? updated : g))
    } else {
      const created = await groupsApi.createGroup(id, data)
      setGroups(gs => [...gs, created])
    }
  }

  const deleteGroup = (group) => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar grupo',
      desc: `¿Eliminar "${group.name}"? Los participantes asignados quedaran sin grupo.`,
      onConfirm: async () => {
        await groupsApi.deleteGroup(id, group.id)
        setGroups(gs => gs.filter(g => g.id !== group.id))
        setConfirmModal(c => ({ ...c, open: false }))
      },
    })
  }

  /* ─── Questions CRUD ─── */
  const saveQuestion = async ({ phaseId, ...data }) => {
    if (questionModal.initial?.id) {
      const updated = await questionsApi.updateQuestion(phaseId, questionModal.initial.id, data)
      setQuestions(q => ({ ...q, [phaseId]: (q[phaseId] || []).map(x => x.id === updated.id ? updated : x) }))
    } else {
      const payload = { ...data, questionOrder: (questions[phaseId] || []).length + 1 }
      const created = await questionsApi.createQuestion(phaseId, payload)
      setQuestions(q => ({ ...q, [phaseId]: [...(q[phaseId] || []), created] }))
    }
  }

  const deleteQuestion = (phaseId, question) => {
    setConfirmModal({
      open: true, danger: true,
      title: 'Eliminar pregunta',
      desc: `¿Eliminar "${question.text}"?`,
      onConfirm: async () => {
        await questionsApi.deleteQuestion(phaseId, question.id)
        setQuestions(q => ({ ...q, [phaseId]: (q[phaseId] || []).filter(x => x.id !== question.id) }))
        setConfirmModal(c => ({ ...c, open: false }))
      },
    })
  }

  /* ─── Render helpers ─── */
  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.loadingText}>Cargando experimento...</div>
    </div>
  )

  if (error || !exp) return (
    <div className={styles.loadingState}>
      <div className={styles.loadingText} style={{ color: 'var(--danger)' }}>{error || 'Experimento no encontrado'}</div>
      <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`} onClick={() => navigate('/experiments')} style={{ marginTop: 16 }}>
        Volver
      </button>
    </div>
  )

  const statusCss = STATUS_CSS[exp.status] || 'draft'
  const isActive  = exp.status === 'ACTIVE'
  const isDraft   = exp.status === 'DRAFT'

  const activeEnrollments     = enrollments.filter(e => e.status === 'ACTIVE').length
  const pendingEnrollments    = enrollments.filter(e => e.status === 'PENDING').length
  const completedEnrollments  = enrollments.filter(e => e.status === 'COMPLETED' || e.status === 'ACTIVE').length
  const displayedEnrollments  = groupFilter
    ? enrollments.filter(e => e.groupId === groupFilter)
    : enrollments

  const tabs = [
    { id: 'phases',       label: 'Fases',         icon: <IcoList />,   count: phases.length },
    { id: 'groups',       label: 'Grupos',         icon: <IcoPeople />, count: groups.length },
    { id: 'questions',    label: 'Preguntas',      icon: <IcoDoc />,    count: totalQuestions },
    { id: 'participants', label: 'Participantes',  icon: <IcoPerson />, count: enrollments.length },
    { id: 'responses',    label: 'Respuestas',     icon: <IcoWave />,   count: null },
  ]

  return (
    <>
      {/* ─── Topbar ─── */}
      <div className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Link to="/dashboard" className={styles.breadcrumbItem}>Experimentos</Link>
          <span className={styles.breadcrumbSep}><IcoChev /></span>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
            {exp.title.length > 40 ? exp.title.slice(0, 40) + '...' : exp.title}
          </span>
        </div>
        <div className={styles.topbarActions}>
          <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
            onClick={() => navigate(`/experiments/${id}/wizard`)}>
            <IcoEdit />
            Editar
          </button>
          <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
            onClick={() => setInviteModal(true)}>
            <IcoLink />
            Enlace de invitacion
          </button>
          {isDraft && (
            <button className={`${styles.topbarBtn} ${styles.topbarBtnDanger}`}
              onClick={handleDeleteExperiment}>
              <IcoTrash />
              Eliminar
            </button>
          )}
          {isDraft && (
            <button className={`${styles.topbarBtn} ${styles.topbarBtnSuccess}`}
              onClick={() => handleStatusChange('ACTIVE')} disabled={statusLoading}>
              <IcoPlay />
              Activar experimento
            </button>
          )}
          {isActive && (
            <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
              onClick={() => handleStatusChange('FINISHED')} disabled={statusLoading}>
              <IcoPause />
              Finalizar
            </button>
          )}
        </div>
      </div>

      {/* ─── Scrollable content ─── */}
      <div className={styles.content}>

        {/* Experiment header */}
        <div className={styles.expHeader}>
          <div className={styles.expHeaderTop}>
            <div className={styles.expHeaderLeft}>
              <div className={styles.expStatusRow}>
                <span className={`${styles.statusBadge} ${styles[statusCss]}`}>
                  <span className={`${styles.statusDot} ${isActive ? styles.statusDotPulse : ''}`} />
                  {STATUS_LABEL[exp.status] || exp.status}
                </span>
                <span className={styles.designTag}>{DESIGN_LABEL[exp.designType] || exp.designType}</span>
              </div>
              <h1 className={styles.expTitle}>{exp.title}</h1>
              <div className={styles.expDates}>
                <IcoCal />
                {exp.startDate ? fmtDate(exp.startDate) : 'Sin fecha de inicio'}
                {exp.endDate ? ` — ${fmtDate(exp.endDate)}` : ''}
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className={styles.miniStats}>
            {[
              { val: phases.length,       label: 'Fases' },
              { val: groups.length,       label: 'Grupos' },
              { val: totalQuestions,      label: 'Preguntas' },
              { val: enrollments.length,  label: 'Participantes' },
              { val: completedEnrollments,label: 'Respuestas', cyan: true },
            ].map(s => (
              <div key={s.label} className={styles.miniStat}>
                <div className={`${styles.miniStatVal} ${s.cyan ? styles.miniStatCyan : ''}`}>{s.val}</div>
                <div className={styles.miniStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className={styles.tabBar}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon}
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span className={styles.tabCount}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Tab content ─── */}
        <div className={styles.tabContent}>

          {/* FASES */}
          {activeTab === 'phases' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Fases del experimento</div>
                  <div className={styles.sectionDesc}>{DESIGN_PHASE_DESC[exp.designType] || 'Define las etapas temporales del estudio.'}</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                  onClick={() => setPhaseModal({ open: true, initial: null })}>
                  <IcoPlus />
                  Añadir fase
                </button>
              </div>

              {/* Banner — Pretest–Postest */}
              {exp.designType === 'PRETEST_POSTTEST' && (
                <div style={{ marginBottom: 20, padding: '16px 20px', background: '#00D4AA10', borderRadius: 10, border: '1px solid #00D4AA33' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#00D4AA', marginBottom: 8 }}>
                    Diseño Pretest–Postest
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    En este diseño los <strong>mismos participantes</strong> son medidos en dos momentos: antes y después de una intervención.
                    El objetivo es detectar el cambio producido por dicha intervención comparando ambas mediciones.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--fg)' }}>Qué necesitas configurar:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      <li><strong>2 fases obligatorias.</strong> La primera se etiqueta automáticamente como <em>Pretest</em> y la segunda como <em>Postest</em>. El orden de creación importa.</li>
                      <li>Cada fase debe tener sus propias <strong>preguntas</strong>. Pueden ser iguales en ambas fases (para comparar directamente) o distintas según tu hipótesis.</li>
                      <li>La <strong>intervención</strong> ocurre fuera de la plataforma, entre las dos fases. La plataforma no la gestiona, solo recoge las mediciones antes y después.</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#00D4AA99' }}>
                    Consejo: activa el experimento cuando todos los participantes estén inscritos y hayas verificado que el Pretest está bien configurado antes de lanzarlo.
                  </div>
                </div>
              )}

              {/* Banner — Entre grupos */}
              {exp.designType === 'BETWEEN_SUBJECTS' && (
                <div style={{ marginBottom: 20, padding: '16px 20px', background: '#6C4DE610', borderRadius: 10, border: '1px solid #6C4DE633' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#A78BF9', marginBottom: 8 }}>
                    Diseño Entre grupos (Between-Subjects)
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Diferentes grupos de participantes reciben diferentes condiciones experimentales. Ningún participante está en más de un grupo,
                    por lo que no hay efecto de aprendizaje o contaminación entre condiciones.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--fg)' }}>Qué necesitas configurar:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      <li><strong>Al menos 2 grupos</strong> (ej. "Control" y "Experimental"). Créalos primero en la pestaña <strong>Grupos</strong> antes de invitar participantes.</li>
                      <li><strong>Al menos una fase</strong> con sus preguntas. Puedes asignar cada fase a un grupo concreto (solo la ve ese grupo) o dejarla como común (la ven todos).</li>
                      <li>Los participantes se asignan a un grupo al aceptar la invitación. Una vez asignados, <strong>solo responden las fases de su grupo</strong> más las fases comunes.</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#A78BF999' }}>
                    Consejo: crea los grupos con nombres claros que identifiquen la condición (ej. "Grupo A — sin instrucciones", "Grupo B — con instrucciones") para facilitar el análisis posterior.
                  </div>
                </div>
              )}

              {/* Banner — Transversal */}
              {exp.designType === 'CROSS_SECTIONAL' && (
                <div style={{ marginBottom: 20, padding: '16px 20px', background: '#FB923C10', borderRadius: 10, border: '1px solid #FB923C33' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#FB923C', marginBottom: 8 }}>
                    Diseño Transversal (Cross-Sectional)
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Todos los participantes son medidos en un <strong>único momento</strong>, sin seguimiento temporal ni condiciones distintas por grupo.
                    Es el diseño más sencillo: ideal para encuestas, cuestionarios de perfil o estudios de prevalencia.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--fg)' }}>Qué necesitas configurar:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      <li><strong>Una sola fase</strong> con todas las preguntas del estudio. Técnicamente puedes crear más de una fase, pero este diseño no implica seguimiento temporal.</li>
                      <li>No es necesario configurar grupos ni fechas. Todos los participantes ven exactamente el mismo cuestionario.</li>
                      <li>En cuanto un participante responde <strong>todas las preguntas</strong>, su inscripción pasa automáticamente a <em>Completada</em>. No puede modificar sus respuestas después.</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#FB923C99' }}>
                    Consejo: revisa el orden de las preguntas antes de activar el experimento, ya que los participantes no podrán volver atrás una vez completada la sesión.
                  </div>
                </div>
              )}

              {/* Banner — Longitudinal */}
              {exp.designType === 'LONGITUDINAL' && (
                <div style={{ marginBottom: 20, padding: '16px 20px', background: '#60A5FA10', borderRadius: 10, border: '1px solid #60A5FA33' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#60A5FA', marginBottom: 8 }}>
                    Diseño Longitudinal
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Los <strong>mismos participantes</strong> son seguidos a lo largo del tiempo y medidos en múltiples momentos (T1, T2, T3…).
                    Permite estudiar cómo evolucionan las variables de interés a lo largo de semanas, meses o años.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--fg)' }}>Qué necesitas configurar:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      <li><strong>Al menos 2 fases</strong>, cada una representando un punto temporal (ej. T1 = semana 0, T2 = semana 4, T3 = semana 8).</li>
                      <li>Cada fase debe tener <strong>fecha de inicio y fecha de cierre</strong>. Los participantes solo pueden responder esa fase dentro de esa ventana de tiempo.</li>
                      <li>El badge de estado de cada fase (<em>Próxima / Ventana abierta / Cerrada</em>) se actualiza automáticamente en función de la fecha actual.</li>
                      <li>Si una fase no tiene fechas configuradas, <strong>no se controla la ventana</strong> y los participantes podrían responderla en cualquier momento.</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#60A5FA99' }}>
                    Consejo: planifica las fechas con margen suficiente para que todos los participantes puedan responder dentro de cada ventana, especialmente en estudios con alta carga de seguimiento.
                  </div>
                </div>
              )}

              {/* Banner — Intra-sujeto */}
              {exp.designType === 'WITHIN_SUBJECTS' && (
                <div style={{ marginBottom: 20, padding: '16px 20px', background: '#F472B610', borderRadius: 10, border: '1px solid #F472B633' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#EC4899', marginBottom: 8 }}>
                    Diseño Intra-sujeto (Within-Subjects)
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Los <strong>mismos participantes</strong> pasan por <strong>todas las condiciones</strong> experimentales, cada una representada por una fase.
                    Al exponer a todos al mismo conjunto de condiciones se eliminan las diferencias individuales como variable de confusión.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--fg)' }}>Qué necesitas configurar:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      <li><strong>Al menos 2 fases</strong>, una por condición experimental (ej. "Condición A — con música", "Condición B — en silencio").</li>
                      <li>No necesitas crear grupos. El sistema asigna automáticamente a cada participante una <strong>secuencia rotada</strong> de condiciones al inscribirse (contrabalanceo).</li>
                      <li>El contrabalanceo sigue un esquema de rotación: participante 1 → A-B-C, participante 2 → B-C-A, participante 3 → C-A-B, etc. Esto neutraliza el <em>efecto de orden</em>.</li>
                      <li>Puedes consultar la secuencia asignada a cada participante en la pestaña <strong>Participantes</strong>.</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#EC489999' }}>
                    Consejo: asegúrate de que haya suficiente tiempo o separación entre condiciones para evitar el efecto de arrastre (carry-over effect), especialmente si las condiciones implican aprendizaje o fatiga.
                  </div>
                </div>
              )}

              {phases.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoList /></div>
                  <div className={styles.emptyTitle}>Sin fases todavia</div>
                  <div className={styles.emptyDesc}>Crea la primera fase para organizar las etapas de tu experimento.</div>
                  <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                    onClick={() => setPhaseModal({ open: true, initial: null })}>
                    <IcoPlus />
                    Añadir primera fase
                  </button>
                </div>
              ) : (
                <div className={styles.phasesList}>
                  {phases.map((phase, i) => {
                    const pretestLabel = exp.designType === 'PRETEST_POSTTEST'
                      ? (i === 0 ? 'Pretest' : 'Postest')
                      : null
                    return (
                    <div key={phase.id}>
                      <div className={styles.phaseCard}>
                        <div className={styles.phaseNum}>{i + 1}</div>
                        <div className={styles.phaseInfo}>
                          <div className={styles.phaseName}>
                            {phase.name}
                            {pretestLabel && (
                              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: i === 0 ? 'var(--violet)22' : 'var(--cyan)22', color: i === 0 ? 'var(--violet)' : 'var(--cyan)' }}>
                                {pretestLabel}
                              </span>
                            )}
                            {exp.designType === 'BETWEEN_SUBJECTS' && (() => {
                              const phaseGroup = groups.find(g => g.id === phase.groupId)
                              if (phaseGroup) {
                                return (
                                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: (phaseGroup.color || '#6C4DE6') + '22', color: phaseGroup.color || '#6C4DE6' }}>
                                    {phaseGroup.name}
                                  </span>
                                )
                              }
                              return (
                                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 4, background: 'var(--surface)', color: 'var(--muted)' }}>
                                  Común
                                </span>
                              )
                            })()}
                          {(() => {
                            const badge = getPhaseBadge(exp.designType, i)
                            if (!badge) return null
                            return (
                              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            )
                          })()}
                          {exp.designType === 'LONGITUDINAL' && (() => {
                            const estado = obtenerEstadoFase(phase)
                            const config = ESTADO_FASE_CONFIG[estado]
                            if (!config.label) return null
                            return (
                              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: config.bg, color: config.color }}>
                                {config.label}
                              </span>
                            )
                          })()}
                          </div>
                          <div className={styles.phaseMeta}>
                            {phase.startDate && <span>{fmtDate(phase.startDate)} — {fmtDate(phase.endDate)}</span>}
                            {phase.startDate && <span>·</span>}
                            <span>{questions[phase.id] ? questions[phase.id].length : phase.questionCount} preguntas</span>
                          </div>
                        </div>
                        <div className={styles.phaseRight}>
                          <button className={styles.phaseQBtn}
                            onClick={() => { setActiveTab('questions'); setActivePhaseQ(phase.id) }}>
                            <IcoDoc />
                            Ver preguntas
                          </button>
                          <button className={styles.iconBtn}
                            onClick={() => setPhaseModal({ open: true, initial: phase })}>
                            <IcoEdit />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                            onClick={() => deletePhase(phase)}>
                            <IcoTrash />
                          </button>
                        </div>
                      </div>
                      {i < phases.length - 1 && (
                        <div className={styles.phaseConnector}>
                          <div className={styles.phaseConnectorLine} />
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {/* GRUPOS */}
          {activeTab === 'groups' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Grupos de participantes</div>
                  <div className={styles.sectionDesc}>Organiza los participantes en grupos para comparar resultados entre ellos.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                  onClick={() => setGroupModal({ open: true, initial: null })}>
                  <IcoPlus />
                  Añadir grupo
                </button>
              </div>

              {/* Banner de asignacion automatica — solo para Between-Subjects */}
              {exp.designType === 'BETWEEN_SUBJECTS' && groups.length > 0 && (
                <div style={{ marginBottom: 20, padding: '14px 18px', background: '#6C4DE610', borderRadius: 10, border: '1px solid #6C4DE633' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--violet)' }}>Asignacion automatica activa</div>
                    {gruposEquilibrados(groups, enrollments) && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#00D4AA22', color: '#00D4AA' }}>
                        Grupos equilibrados
                      </span>
                    )}
                    {!gruposEquilibrados(groups, enrollments) && enrollments.length > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#F59E0B22', color: '#F59E0B' }}>
                        Grupos desequilibrados
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: enrollments.length > 0 ? 12 : 0 }}>
                    Los nuevos participantes se asignan automaticamente al grupo con menos miembros.
                    Puedes reasignarlos manualmente en la pestana Participantes.
                  </div>

                  {/* Barras de distribucion — solo si hay participantes */}
                  {enrollments.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Distribucion actual
                      </div>
                      {calcularDistribucion(groups, enrollments).map(item => (
                        <div key={item.grupo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.grupo.color || '#6C4DE6', flexShrink: 0 }} />
                          <div style={{ fontSize: 12, width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.grupo.name}
                          </div>
                          <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 6 }}>
                            <div style={{
                              width: item.porcentaje + '%',
                              background: item.grupo.color || '#6C4DE6',
                              height: '100%',
                              borderRadius: 4,
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', width: 70, textAlign: 'right', flexShrink: 0 }}>
                            {item.cuenta} ({item.porcentaje}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.groupsGrid}>
                {groups.map(group => (
                  <div key={group.id} className={styles.groupCard}>
                    <div className={styles.groupCardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={styles.groupColorDot} style={{ background: group.color || '#6C4DE6' }} />
                        <div className={styles.groupName}>{group.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={styles.iconBtn}
                          onClick={() => setGroupModal({ open: true, initial: group })}>
                          <IcoEdit />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                          onClick={() => deleteGroup(group)}>
                          <IcoTrash />
                        </button>
                      </div>
                    </div>
                    {group.description && (
                      <div className={styles.groupDesc}>{group.description}</div>
                    )}
                    <div className={styles.groupFooter}>
                      <div className={styles.groupCount}>
                        <strong>{enrollments.filter(e => e.groupId === group.id).length}</strong> participantes
                      </div>
                      <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                        style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => { setGroupFilter(group.id); setActiveTab('participants') }}>
                        Ver participantes
                      </button>
                    </div>
                  </div>
                ))}

                <button className={styles.groupCardAdd}
                  onClick={() => setGroupModal({ open: true, initial: null })}>
                  <IcoPlus />
                  <span>Añadir otro grupo</span>
                </button>
              </div>

              {groups.length === 0 && (
                <div className={styles.emptyState} style={{ marginTop: 0 }}>
                  <div className={styles.emptyIcon}><IcoPeople /></div>
                  <div className={styles.emptyTitle}>Sin grupos todavia</div>
                  <div className={styles.emptyDesc}>Crea grupos para comparar diferentes subconjuntos de participantes.</div>
                </div>
              )}
            </div>
          )}

          {/* PREGUNTAS */}
          {activeTab === 'questions' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Preguntas por fase</div>
                  <div className={styles.sectionDesc}>Selecciona una fase para ver y editar sus preguntas.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                  onClick={() => setQuestionModal({ open: true, initial: null })}
                  disabled={phases.length === 0}>
                  <IcoPlus />
                  Añadir pregunta
                </button>
              </div>

              {phases.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoDoc /></div>
                  <div className={styles.emptyTitle}>Primero crea fases</div>
                  <div className={styles.emptyDesc}>Las preguntas pertenecen a fases. Crea al menos una fase primero.</div>
                  <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                    onClick={() => setActiveTab('phases')}>
                    Ir a Fases
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.phasePills}>
                    {phases.map(phase => (
                      <button
                        key={phase.id}
                        className={`${styles.phasePill} ${activePhaseQ === phase.id ? styles.phasePillActive : ''}`}
                        onClick={() => { setActivePhaseQ(phase.id); loadQuestions(phase.id) }}
                      >
                        {phase.name}
                        <span className={styles.phasePillCount}>{(questions[phase.id] || []).length}</span>
                      </button>
                    ))}
                  </div>

                  {currentQuestions.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><IcoDoc /></div>
                      <div className={styles.emptyTitle}>Sin preguntas en esta fase</div>
                      <div className={styles.emptyDesc}>Añade la primera pregunta a esta fase del experimento.</div>
                      <button className={`${styles.topbarBtn} ${styles.topbarBtnPrimary}`}
                        onClick={() => setQuestionModal({ open: true, initial: null })}>
                        <IcoPlus />
                        Añadir pregunta
                      </button>
                    </div>
                  ) : (
                    <div className={styles.questionsList}>
                      {currentQuestions.map((q, i) => (
                        <div key={q.id} className={styles.questionRow}>
                          <div className={styles.questionDrag}><IcoDrag /></div>
                          <div className={styles.questionOrder}>{i + 1}</div>
                          <div className={styles.questionBody}>
                            <div className={styles.questionText}>{q.text}</div>
                            <div className={styles.questionTags}>
                              <span className={`${styles.qTypeBadge} ${styles[Q_TYPE_CSS[q.type] || 'typeText']}`}>
                                {Q_TYPE_LABEL[q.type] || q.type}
                              </span>
                              {q.required && <span className={styles.qRequiredBadge}>Obligatoria</span>}
                            </div>
                          </div>
                          <div className={styles.questionActions}>
                            <button className={styles.iconBtn}
                              onClick={() => setQuestionModal({ open: true, initial: { ...q, phaseId: activePhaseQ } })}>
                              <IcoEdit />
                            </button>
                            <button className={`${styles.iconBtn} ${styles.iconBtnRed}`}
                              onClick={() => deleteQuestion(activePhaseQ, q)}>
                              <IcoTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PARTICIPANTES */}
          {activeTab === 'participants' && (
              <div>

                {/* Aviso de asignacion automatica para Between-Subjects */}
                {exp.designType === 'BETWEEN_SUBJECTS' && groups.length > 0 && (
                  <div style={{ marginBottom: 16, padding: '10px 14px', background: '#6C4DE608', borderRadius: 8, border: '1px solid #6C4DE622', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IcoPeople />
                    <span>
                      Experimento <strong>entre grupos</strong>: cada participante se asigna automaticamente al grupo con menos miembros al inscribirse.
                      Puedes cambiar el grupo de cualquier participante usando el selector de la columna Grupo.
                    </span>
                  </div>
                )}

                <div className={styles.participantsStats}>
                  {[
                    { val: enrollments.length,  label: 'Total inscritos' },
                    { val: pendingEnrollments,  label: 'Pendientes de confirmar', cyan: true },
                    { val: completedEnrollments,label: 'Completados' },
                  ].map(s => (
                    <div key={s.label} className={styles.pStatCard}>
                      <div className={`${styles.pStatVal} ${s.cyan ? styles.pStatCyan : ''}`}>{s.val}</div>
                      <div className={styles.pStatLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {groupFilter && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '6px 12px', background: 'var(--surface)', borderRadius: 8, width: 'fit-content' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: groups.find(g => g.id === groupFilter)?.color || 'var(--violet)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>
                      Filtrado por: <strong>{groups.find(g => g.id === groupFilter)?.name}</strong>
                    </span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 2 }} onClick={() => setGroupFilter(null)}>
                      <IcoX />
                    </button>
                  </div>
                )}

                {invitations.filter(inv => inv.status === 'PENDING').length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className={styles.sectionTitle} style={{ fontSize: 13, marginBottom: 8 }}>
                      Invitaciones pendientes de aceptar
                    </div>
                    {invitations.filter(inv => inv.status === 'PENDING').map(inv => (
                      <div key={inv.id} className={styles.inviteBanner} style={{ marginBottom: 8 }}>
                        <div className={styles.inviteBannerLeft}>
                          <div className={styles.inviteBannerTitle}>{inv.invitedEmail}</div>
                          <div className={styles.inviteBannerDesc}>Enviada el {fmtDate(inv.createdAt)}</div>
                        </div>
                        <div className={styles.inviteRow}>
                          <button
                            className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`)}
                          >
                            <IcoCopy />
                            Copiar enlace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.sectionHead}>
                  <div className={styles.sectionTitle}>
                    Participantes inscritos
                    {groupFilter && <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--muted)', marginLeft: 8 }}>({displayedEnrollments.length} de {enrollments.length})</span>}
                  </div>
                </div>

                {enrollments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><IcoPerson /></div>
                    <div className={styles.emptyTitle}>Sin participantes todavia</div>
                    <div className={styles.emptyDesc}>Comparte el enlace de invitacion para que los participantes puedan unirse.</div>
                    <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                      onClick={() => setInviteModal(true)}>
                      <IcoLink />
                      Ver enlace de invitacion
                    </button>
                  </div>
                ) : displayedEnrollments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><IcoPerson /></div>
                    <div className={styles.emptyTitle}>Sin participantes en este grupo</div>
                    <div className={styles.emptyDesc}>
                      Los participantes inscritos sin grupo pueden ser asignados desde la tabla completa.
                    </div>
                    <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`} onClick={() => setGroupFilter(null)}>
                      Ver todos
                    </button>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Participante</th>
                          {exp.designType === 'WITHIN_SUBJECTS' && <th>Secuencia asignada</th>}
                          {exp.designType !== 'WITHIN_SUBJECTS' && <th>Grupo</th>}
                          <th>Estado</th>
                          <th>Fecha inscripcion</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedEnrollments.map(enroll => {
                          const assignedGroup = groups.find(g => g.id === enroll.groupId)
                          return (
                            <tr key={enroll.id}>
                              <td>
                                <div className={styles.participantName}>Participante #{enroll.participantId}</div>
                                <div className={styles.participantEmail}>{enroll.consentSignedAt ? `Consentimiento: ${fmtDate(enroll.consentSignedAt)}` : '—'}</div>
                              </td>
                              {exp.designType === 'WITHIN_SUBJECTS' && (
                                <td style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 200 }}>
                                  {mostrarSecuencia(enroll.phaseSequence, phases)}
                                </td>
                              )}
                              {exp.designType !== 'WITHIN_SUBJECTS' && (
                                <td>
                                  <select
                                    style={{ fontSize: 12.5, padding: '3px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: assignedGroup ? assignedGroup.color || 'var(--violet)' : 'var(--muted)', cursor: 'pointer' }}
                                    value={enroll.groupId || ''}
                                    onChange={async (e) => {
                                      const newGroupId = e.target.value ? parseInt(e.target.value) : null
                                      try {
                                        const updated = await assignGroup(enroll.id, newGroupId)
                                        setEnrollments(prev => prev.map(en => en.id === updated.id ? updated : en))
                                      } catch {
                                        alert('Error al cambiar el grupo')
                                      }
                                    }}
                                  >
                                    <option value="">Sin grupo</option>
                                    {groups.map(g => (
                                      <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                  </select>
                                </td>
                              )}
                              <td>
                                <span className={`${styles.pStatusBadge} ${styles[ENROLL_STATUS_CSS[enroll.status] || 'ePending']}`}>
                                  {ENROLL_STATUS_LABEL[enroll.status] || enroll.status}
                                </span>
                              </td>
                              <td className={styles.tdMuted}>
                                {enroll.enrolledAt ? fmtDate(enroll.enrolledAt) : '—'}
                              </td>
                              <td style={{ display: 'flex', gap: 4 }}>
                                <button className={styles.iconBtn}
                                  onClick={() => navigate(`/experiments/${id}/participants/${enroll.id}`)}>
                                  <IcoDots />
                                </button>
                                <button
                                  className={styles.iconBtn}
                                  style={{ color: 'var(--red, #f87171)' }}
                                  title="Eliminar participante"
                                  onClick={() => setConfirmModal({
                                    open: true,
                                    title: 'Eliminar participante',
                                    desc: `¿Seguro que quieres eliminar al participante #${enroll.participantId} del estudio? Se borrarán también todas sus respuestas. Esta acción no se puede deshacer.`,
                                    danger: true,
                                    onConfirm: async () => {
                                      await forceDeleteEnrollment(enroll.id)
                                      setEnrollments(prev => prev.filter(e => e.id !== enroll.id))
                                      setConfirmModal(c => ({ ...c, open: false }))
                                    }
                                  })}
                                >
                                  <IcoTrash />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
          )}

          {/* RESPUESTAS */}
          {activeTab === 'responses' && (
            <div>
              <div className={styles.sectionHead}>
                <div>
                  <div className={styles.sectionTitle}>Respuestas recogidas</div>
                  <div className={styles.sectionDesc}>Datos acumulados de todos los participantes en todas las fases.</div>
                </div>
                <button className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`}
                  onClick={() => navigate(`/experiments/${id}/analytics`)}>
                  <IcoDownload />
                  Ver analytics completo
                </button>
              </div>

              {completedEnrollments === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><IcoWave /></div>
                  <div className={styles.emptyTitle}>Sin respuestas todavia</div>
                  <div className={styles.emptyDesc}>
                    Las respuestas apareceran aqui cuando los participantes completen las fases del estudio.
                  </div>
                </div>
              ) : (
                <div className={styles.responsesTop}>
                  {[
                    { val: completedEnrollments * totalQuestions, label: 'Respuestas totales' },
                    { val: `${Math.round((completedEnrollments / Math.max(enrollments.length,1)) * 100)}%`, label: 'Tasa de completado', cyan: true },
                    { val: `${activeEnrollments}/${enrollments.length}`, label: 'Participantes activos' },
                    { val: phases[0]?.name || '—', label: 'Fase actual' },
                  ].map(s => (
                    <div key={s.label} className={styles.rStatCard}>
                      <div className={`${styles.rStatVal} ${s.cyan ? styles.rStatCyan : ''}`}>{s.val}</div>
                      <div className={styles.rStatLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
        {/* / Tab content */}
      </div>

      {/* ─── Modals ─── */}
      <PhaseModal
        open={phaseModal.open}
        initial={phaseModal.initial}
        designType={exp?.designType}
        groups={groups}
        onClose={() => setPhaseModal({ open: false, initial: null })}
        onSave={savePhase}
      />
      <GroupModal
        open={groupModal.open}
        initial={groupModal.initial}
        onClose={() => setGroupModal({ open: false, initial: null })}
        onSave={saveGroup}
      />
      <QuestionModal
        open={questionModal.open}
        initial={questionModal.initial}
        phases={phases}
        defaultPhaseId={activePhaseQ}
        onClose={() => setQuestionModal({ open: false, initial: null })}
        onSave={saveQuestion}
      />
      <InviteLinkModal
        open={inviteModal}
        experimentId={id}
        onClose={() => setInviteModal(false)}
        onCreated={(inv) => setInvitations(prev => [...prev, inv])}
      />
      <ConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal(c => ({ ...c, open: false }))}
      />

      {/* ─── Modal de error de lanzamiento ─── */}
      {launchError && (
        <div className={styles.overlay} onClick={() => setLaunchError(null)}>
          <div className={styles.modal} style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span className={styles.modalTitle}>No se puede activar el experimento</span>
              <button className={styles.modalClose} onClick={() => setLaunchError(null)}><IcoX /></button>
            </div>
            <p className={styles.modalSub} style={{ marginBottom: 12 }}>
              Antes de lanzar el experimento hay que resolver lo siguiente:
            </p>
            <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {launchError.map((msg, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {msg}
                </li>
              ))}
            </ul>
            <div className={styles.modalFooter}>
              <button className={`${styles.btnModal} ${styles.btnPrimary}`} onClick={() => setLaunchError(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
