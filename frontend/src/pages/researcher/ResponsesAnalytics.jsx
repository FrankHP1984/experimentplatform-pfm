import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as experimentsApi from '../../api/experiments'
import * as phasesApi      from '../../api/phases'
import * as groupsApi      from '../../api/groups'
import * as enrollmentsApi from '../../api/enrollments'
import * as questionsApi   from '../../api/questions'
import * as responsesApi   from '../../api/responses'
import styles from './ResponsesAnalytics.module.css'

const COLORS = ['#6C4DE6', '#00D4AA', '#60A5FA', '#F472B6']

/* ─── Media por grupo: barras CSS ─── */
function ComparisonStats({ question, responses, enrollmentMap, groupMap }) {
  const grupos = Object.values(groupMap)

  const datos = grupos.length > 0
    ? grupos.map((g, i) => {
        let suma = 0, cuenta = 0
        for (const r of responses) {
          if (r.question_id !== question.id) continue
          const insc = enrollmentMap[r.enrollment_id]
          if (!insc || insc.group_id !== g.id) continue
          const num = parseFloat(r.value)
          if (!isNaN(num)) { suma += num; cuenta++ }
        }
        return { label: g.name, color: g.color || COLORS[i], media: cuenta > 0 ? parseFloat((suma / cuenta).toFixed(2)) : null, n: cuenta }
      })
    : (() => {
        let suma = 0, cuenta = 0
        for (const r of responses) {
          if (r.question_id !== question.id) continue
          const num = parseFloat(r.value)
          if (!isNaN(num)) { suma += num; cuenta++ }
        }
        return [{ label: 'Todos', color: COLORS[0], media: cuenta > 0 ? parseFloat((suma / cuenta).toFixed(2)) : null, n: cuenta }]
      })()

  const maxVal = question.type === 'SCALE' ? 10 : Math.max(...datos.map(d => d.media || 0), 1)

  if (datos.every(d => d.n === 0)) return <p className={styles.empty}>Sin respuestas aún</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
      {datos.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{d.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
              {d.media !== null ? d.media : '—'}
              <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 11, marginLeft: 5 }}>({d.n} resp.)</span>
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
            <div style={{ height: '100%', width: `${d.media !== null ? Math.min((d.media / maxVal) * 100, 100) : 0}%`, background: d.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Opción múltiple: lista con barras CSS ─── */
function MultipleChoiceStats({ question, responses }) {
  const conteos = {}
  for (const r of responses) {
    if (r.question_id !== question.id) continue
    const opcion = String(r.value)
    conteos[opcion] = (conteos[opcion] || 0) + 1
  }

  const datos = Object.entries(conteos).map(([opcion, count]) => ({ opcion, count }))
  datos.sort((a, b) => b.count - a.count)
  const total = datos.reduce((s, d) => s + d.count, 0)

  if (datos.length === 0) return <p className={styles.empty}>Sin respuestas aún</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
      {datos.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1, marginRight: 12 }}>{d.opcion}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap' }}>
              {d.count}
              <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 11, marginLeft: 5 }}>({Math.round((d.count / total) * 100)}%)</span>
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
            <div style={{ height: '100%', width: `${(d.count / total) * 100}%`, background: '#00D4AA', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function ResponsesAnalytics() {
  const { id } = useParams()

  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [experiment,  setExperiment]  = useState(null)
  const [phases,      setPhases]      = useState([])
  const [groups,      setGroups]      = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [responses,   setResponses]   = useState([])
  const [questionMap, setQuestionMap] = useState({})
  const [filterPhase, setFilterPhase] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')
  const [exportMsg,   setExportMsg]   = useState('')

  useEffect(() => {
    async function cargarDatos() {
      try {
        const exp        = await experimentsApi.getExperiment(id)
        const phasesData = await phasesApi.getPhases(id)
        const groupsData = await groupsApi.getGroups(id)
        const enrollData = await enrollmentsApi.getEnrollments(id)
        const respData   = await responsesApi.getExperimentResponses(id)

        setExperiment(exp)
        setPhases(phasesData)
        setGroups(groupsData)

        const listaEnrollments = []
        if (enrollData && enrollData.content) {
          for (const e of enrollData.content) {
            listaEnrollments.push({ ...e, group_id: e.groupId })
          }
        }
        setEnrollments(listaEnrollments)

        const listaRespuestas = []
        for (const r of respData) {
          let valor = null
          if (r.numericValue !== null && r.numericValue !== undefined) {
            valor = r.numericValue
          } else if (r.textValue !== null && r.textValue !== undefined) {
            valor = r.textValue
          } else if (r.booleanValue !== null && r.booleanValue !== undefined) {
            valor = r.booleanValue
          }
          listaRespuestas.push({
            ...r,
            enrollment_id: r.enrollmentId,
            question_id:   r.questionId,
            value:         valor,
          })
        }
        setResponses(listaRespuestas)

        const mapaPreguntas = {}
        for (const fase of phasesData) {
          const preguntas = await questionsApi.getQuestions(fase.id)
          for (const q of preguntas) {
            mapaPreguntas[q.id] = { ...q, phase_id: fase.id, phase_name: fase.name }
          }
        }
        setQuestionMap(mapaPreguntas)

      } catch (err) {
        console.log('Error cargando analytics:', err)
        setError('No se pudo cargar el análisis')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [id])

  function exportarCSV() {
    const filas = [['Participante', 'Grupo', 'Pregunta', 'Fase', 'Tipo', 'Respuesta']]

    const respuestasIndex = {}
    for (const r of responses) {
      respuestasIndex[`${r.enrollment_id}_${r.question_id}`] = r
    }

    for (const e of enrollments) {
      const grupo  = groupMap[e.group_id] || {}
      const nombre = `Participante #${e.participantId}`
      for (const q of Object.values(questionMap)) {
        const r = respuestasIndex[`${e.id}_${q.id}`]
        if (r) {
          filas.push([nombre, grupo.name || '', q.text, q.phase_name || '', q.type || '', r.value])
        }
      }
    }

    const csv    = filas.map(fila => fila.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob   = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url    = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href     = url
    enlace.download = `respuestas-${id}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
    setExportMsg('CSV exportado correctamente')
    setTimeout(() => setExportMsg(''), 2500)
  }

  if (loading) return <div className={styles.loading}>Cargando análisis…</div>
  if (error)   return <div className={styles.loading}>{error}</div>

  const enrollmentMap = {}
  for (const e of enrollments) {
    enrollmentMap[e.id] = e
  }

  const groupMap = {}
  for (const g of groups) {
    groupMap[g.id] = g
  }

  const filteredResponses = []
  for (const r of responses) {
    const inscripcion = enrollmentMap[r.enrollment_id]
    if (!inscripcion) continue
    if (filterGroup !== 'all' && String(inscripcion.group_id) !== filterGroup) continue
    if (filterPhase !== 'all') {
      const pregunta = questionMap[r.question_id]
      if (!pregunta || String(pregunta.phase_id) !== filterPhase) continue
    }
    filteredResponses.push(r)
  }

  let participantesActivos = 0
  for (const e of enrollments) {
    if (e.status === 'ACTIVE' || e.status === 'COMPLETED') participantesActivos++
  }

  const totalQuestions = Object.values(questionMap).length
  const totalRespuestas = responses.length
  const totalEsperado   = enrollments.length * totalQuestions

  let tasaCompletado = 0
  if (totalEsperado > 0) {
    tasaCompletado = Math.round((totalRespuestas / totalEsperado) * 100)
  }

  const scaleQs    = []
  const multipleQs = []
  const textQs     = []

  for (const q of Object.values(questionMap)) {
    if (q.type === 'SCALE' || q.type === 'NUMBER') {
      scaleQs.push(q)
    } else if (q.type === 'MULTIPLE_CHOICE') {
      multipleQs.push(q)
    } else if (q.type === 'TEXT') {
      textQs.push(q)
    }
  }

  const idsTextQs = new Set()
  for (const q of textQs) {
    idsTextQs.add(q.id)
  }

  const textResponses = []
  for (const r of filteredResponses) {
    if (!idsTextQs.has(r.question_id) || !r.value) continue
    const inscripcion = enrollmentMap[r.enrollment_id] || {}
    const grupo       = groupMap[inscripcion.group_id] || {}
    textResponses.push({
      ...r,
      participantName: `Participante #${inscripcion.participantId || r.enrollment_id}`,
      groupName: grupo.name || '—',
    })
  }

  return (
    <div className={styles.page}>

      <div className={styles.topbar}>
        <nav className={styles.breadcrumb}>
          <Link to="/dashboard" className={styles.breadcrumbLink}>Dashboard</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to={`/experiments/${id}`} className={styles.breadcrumbLink}>
            {experiment?.title || 'Experimento'}
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Análisis de respuestas</span>
        </nav>
        <button className={styles.btnCyan} onClick={exportarCSV}>Exportar CSV</button>
      </div>

      {exportMsg && (
        <div className={styles.toast}>
          <span className={styles.toastDot} />{exportMsg}
        </div>
      )}

      <div className={styles.content}>

        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>Filtrar por:</span>
          <select className={styles.filterSelect} value={filterPhase} onChange={e => setFilterPhase(e.target.value)}>
            <option value="all">Todas las fases</option>
            {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
          </select>
          <select className={styles.filterSelect} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="all">Todos los grupos</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{participantesActivos}</div>
            <div className={styles.statLabel}>Participantes activos</div>
            <div className={styles.statDelta}>{enrollments.length} inscritos en total</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.valCyan}`}>{totalRespuestas}</div>
            <div className={styles.statLabel}>Respuestas totales</div>
            <div className={styles.statDelta}>{filteredResponses.length} en el filtro actual</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.valViolet}`}>{tasaCompletado}%</div>
            <div className={styles.statLabel}>Tasa de completación</div>
            <div className={styles.statDelta}>{totalQuestions} preguntas · {enrollments.length} participantes</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.valWarn}`}>{Math.max(0, totalEsperado - totalRespuestas)}</div>
            <div className={styles.statLabel}>Respuestas pendientes</div>
            <div className={styles.statDelta}>Estimado según fases activas</div>
          </div>
        </div>

        {totalQuestions === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Sin preguntas configuradas</div>
            <div className={styles.emptyDesc}>Define preguntas en las fases del experimento para ver el análisis aquí.</div>
            <Link to={`/experiments/${id}`} className={styles.emptyLink}>Ir al experimento →</Link>
          </div>
        ) : (
          <div className={styles.analysisGrid}>

            {scaleQs.map(q => (
              <div key={q.id} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>{q.text}</div>
                    <div className={styles.chartSub}>{q.type === 'SCALE' ? 'Escala 1-10' : 'Numérica'} · Media por grupo · {q.phase_name}</div>
                  </div>
                </div>
                <ComparisonStats question={q} responses={filteredResponses}
                  enrollmentMap={enrollmentMap} groupMap={groupMap} />
              </div>
            ))}

            {multipleQs.map(q => (
              <div key={q.id} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>{q.text}</div>
                    <div className={styles.chartSub}>Opción múltiple · {q.phase_name} · n={filteredResponses.filter(r => r.question_id === q.id).length}</div>
                  </div>
                </div>
                <MultipleChoiceStats question={q} responses={filteredResponses} />
              </div>
            ))}

            {textQs.length > 0 && (
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <div className={styles.chartTitle}>Comentarios cualitativos</div>
                    <div className={styles.chartSub}>Texto libre · {textResponses.length} respuestas</div>
                  </div>
                </div>
                {textResponses.length === 0 ? (
                  <p className={styles.empty}>Sin respuestas de texto aún</p>
                ) : (
                  <div className={styles.textResponseList}>
                    {textResponses.slice(0, 10).map((r, i) => (
                      <div key={r.id || i} className={styles.textResponseItem}>
                        <div className={styles.textRespMeta}>
                          <span className={styles.textRespName}>{r.participantName}</span>
                          <span className={styles.textRespGroup}>{r.groupName}</span>
                        </div>
                        <div className={styles.textRespBody}>"{r.value}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={`${styles.chartCard} ${styles.full}`}>
              <div className={styles.chartHeader}>
                <div>
                  <div className={styles.chartTitle}>Estado de participantes</div>
                  <div className={styles.chartSub}>Progreso individual por estado de inscripción</div>
                </div>
              </div>
              {enrollments.length === 0 ? (
                <p className={styles.empty}>Sin participantes inscritos aún</p>
              ) : (
                <table className={styles.partTable}>
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Grupo</th>
                      <th>Respuestas</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(e => {
                      const grupo = groupMap[e.group_id] || {}
                      let respondidasTotal = 0
                      for (const r of responses) {
                        if (r.enrollment_id === e.id) respondidasTotal++
                      }
                      return (
                        <tr key={e.id}>
                          <td>Participante #{e.participantId}</td>
                          <td>
                            {grupo.name && (
                              <>
                                <span className={styles.groupDot} style={{ background: grupo.color || '#A78BF9' }} />
                                {grupo.name}
                              </>
                            )}
                            {!grupo.name && '—'}
                          </td>
                          <td>{respondidasTotal} / {totalQuestions}</td>
                          <td>
                            <span className={
                              e.status === 'COMPLETED' ? styles.spComplete :
                              e.status === 'ACTIVE'    ? styles.spActive :
                              styles.spPending}>
                              {e.status === 'COMPLETED' ? 'Completado' :
                               e.status === 'ACTIVE'    ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
