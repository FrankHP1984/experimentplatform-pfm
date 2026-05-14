import { useState, useEffect } from 'react'
import styles from '../ExperimentDetail.module.css'

const IcoX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function QuestionModal({ open, initial, phases, defaultPhaseId, onClose, onSave }) {
  const defaultForm = { text: '', type: 'TEXT', required: true, phaseId: defaultPhaseId || '', minValue: 1, maxValue: 10, options: [] }
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const [optionInput, setOptionInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm({ ...defaultForm, ...initial })
      setOptionInput('')
      setError('')
    }
  }, [open, initial, defaultPhaseId])

  const addOption = () => {
    const val = optionInput.trim()
    if (!val) return
    setForm(f => ({ ...f, options: [...(f.options || []), val] }))
    setOptionInput('')
  }

  const removeOption = (idx) => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))

  const buildPayload = () => {
    const payload = { text: form.text.trim(), type: form.type, required: form.required, phaseId: form.phaseId }
    if (form.type === 'SCALE') {
      payload.minValue = parseInt(form.minValue) || 1
      payload.maxValue = parseInt(form.maxValue) || 10
    }
    if (form.type === 'MULTIPLE_CHOICE') {
      payload.options = form.options || []
    }
    return payload
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.text.trim()) { setError('El texto es obligatorio'); return }
    if (!form.phaseId)     { setError('Selecciona una fase'); return }
    if (form.type === 'MULTIPLE_CHOICE' && (form.options || []).length < 2) {
      setError('Añade al menos 2 opciones'); return
    }
    setLoading(true); setError('')
    try { await onSave(buildPayload()); onClose() }
    catch (err) { setError(err.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{initial?.id ? 'Editar pregunta' : 'Nueva pregunta'}</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Añade una pregunta al cuestionario de una fase.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Texto de la pregunta</label>
            <input className={styles.formInput} value={form.text} onChange={e => { setForm(f => ({...f, text: e.target.value})); setError('') }} placeholder="Ej. ¿Cuantas horas duermes de media?" autoFocus />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo de respuesta</label>
              <select className={styles.formInput} value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                <option value="TEXT">Texto libre</option>
                <option value="NUMBER">Numerica</option>
                <option value="SCALE">Escala numerica</option>
                <option value="MULTIPLE_CHOICE">Opcion multiple</option>
                <option value="BOOLEAN">Si / No</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fase</label>
              <select className={styles.formInput} value={form.phaseId} onChange={e => { setForm(f => ({...f, phaseId: e.target.value})); setError('') }}>
                <option value="">Selecciona una fase</option>
                {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {form.type === 'SCALE' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Valor minimo</label>
                <input className={styles.formInput} type="number" value={form.minValue} onChange={e => setForm(f => ({...f, minValue: e.target.value}))} min={0} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Valor maximo</label>
                <input className={styles.formInput} type="number" value={form.maxValue} onChange={e => setForm(f => ({...f, maxValue: e.target.value}))} min={1} />
              </div>
            </div>
          )}

          {form.type === 'MULTIPLE_CHOICE' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Opciones <span className={styles.opt}>(minimo 2)</span></label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className={styles.formInput}
                  value={optionInput}
                  onChange={e => setOptionInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                  placeholder="Escribe una opcion y pulsa Enter o Añadir"
                />
                <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} style={{ whiteSpace: 'nowrap' }} onClick={addOption}>Añadir</button>
              </div>
              {(form.options || []).map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ flex: 1, fontSize: 13 }}>{opt}</span>
                  <button type="button" className={`${styles.iconBtn} ${styles.iconBtnRed}`} onClick={() => removeOption(idx)}><IcoX /></button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Obligatoria</div>
              <div className={styles.toggleSub}>El participante debe responder esta pregunta</div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.required} onChange={e => setForm(f => ({...f, required: e.target.checked}))} />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'Guardando...' : 'Guardar pregunta'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
