import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as experimentsApi from '../../api/experiments'
import * as phasesApi      from '../../api/phases'
import * as groupsApi      from '../../api/groups'
import * as enrollmentsApi from '../../api/enrollments'
import * as questionsApi   from '../../api/questions'
import * as responsesApi   from '../../api/responses'
import styles from './ResponsesAnalytics.module.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0D1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: '#E8EEF8' },
  itemStyle:    { color: '#A0AEC0' }
}
const TICK   = { fill: '#6B7A99', fontSize: 12 }
const COLORS = ['#6C4DE6', '#00D4AA', '#60A5FA', '#F472B6']

/* ─── Gráfico de barras: media por grupo ─── */
function ComparisonChart({ question, responses, enrollmentMap, groupMap }) {
  const grupos = Object.values(groupMap)
  const datos  = []

  for (let i = 0; i < grupos.length; i++) {
    const g = grupos[i]
    let suma  = 0
    let cuenta = 0
    for (const r of responses) {
      if (r.question_id !== question.id) continue
      const inscripcion = enrollmentMap[r.enrollment_id]
      if (!inscripcion || inscripcion.group_id !== g.id) continue
      const num = parseFloat(r.value)
      if (!isNaN(num)) { suma += num; cuenta++ }
    }
    let media = 0
    if (cuenta > 0) {
      media = parseFloat((suma / cuenta).toFixed(2))
    }
    datos.push({ grupo: g.name, media: media, color: g.color || COLORS[i] })
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={datos} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis dataKey="grupo" tick={TICK} />
        <YAxis domain={[0, 10]} tick={TICK} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Bar dataKey="media" radius={[4, 4, 0, 0]} name="Media">
          {datos.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Gráfico de opción múltiple ─── */
function MultipleChoiceChart({ question, responses }) {
  const conteos = {}
  for (const r of responses) {
    if (r.question_id !== question.id) continue
    const opcion = String(r.value)
    if (conteos[opcion] === undefined) conteos[opcion] = 0
    conteos[opcion]++
  }

  const datos = []
  for (const opcion in conteos) {
    datos.push({ opcion: opcion, count: conteos[opcion] })
  }
  datos.sort((a, b) => b.count - a.count)

  if (datos.length === 0) {
    return <p className={styles.empty}>Sin respuestas aún</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, datos.length * 44)}>
      <BarChart data={datos} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
        <XAxis type="number" tick={TICK} allowDecimals={false} />
        <YAxis type="category" dataKey="opcion" tick={TICK} width={75} />
        <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} respuestas`]} />
        <Bar dataKey="count" fill="#00D4AA" radius={[0, 4, 4, 0]} name="Respuestas" />
      </BarChart>
    </ResponsiveContainer>
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
    const blob   = new Blob([csv], { type: 'text/csv' })
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
                  <div className={styles.chartLegend}>
                    {groups.slice(0, 3).map((g, i) => (
                      <div key={g.id} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: g.color || COLORS[i] }} />
                        {g.name}
                      </div>
                    ))}
                  </div>
                </div>
                <ComparisonChart question={q} responses={filteredResponses}
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
                <MultipleChoiceChart question={q} responses={filteredResponses} />
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
