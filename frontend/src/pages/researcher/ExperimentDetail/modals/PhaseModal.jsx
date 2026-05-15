import { useState, useEffect } from 'react'
import styles from '../ExperimentDetail.module.css'

const IcoX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function toDatetimeLocal(dt) {
  if (!dt) return ''
  return dt.slice(0, 16)
}

function toISODateTime(dt) {
  if (!dt) return null
  if (dt.length === 16) return dt + ':00'
  return dt
}

export default function PhaseModal({ open, initial, designType, groups, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', groupId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isBetween = designType === 'BETWEEN_SUBJECTS'

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name || '',
        startDate: toDatetimeLocal(initial?.startDate),
        endDate: toDatetimeLocal(initial?.endDate),
        groupId: initial?.groupId != null ? String(initial.groupId) : '',
      })
      setError('')
    }
  }, [open, initial])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      return
    }
    setLoading(true); setError('')
    try {
      const payload = {
        name: form.name.trim(),
        startDate: toISODateTime(form.startDate),
        endDate: toISODateTime(form.endDate),
      }
      if (isBetween) {
        payload.groupId = form.groupId ? parseInt(form.groupId) : null
      }
      await onSave(payload)
      onClose()
    }
    catch (err) { setError(err.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{initial?.id ? 'Editar fase' : 'Nueva fase'}</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Define el nombre y el periodo temporal de esta fase. La fecha y hora determinan cuándo aparecen las preguntas al participante.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre de la fase</label>
            <input className={styles.formInput} value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setError('') }} placeholder="Ej. Pretest, Intervencion, Postest..." autoFocus />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Inicio <span className={styles.opt}>(opcional)</span></label>
              <input className={styles.formInput} type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fin <span className={styles.opt}>(opcional)</span></label>
              <input className={styles.formInput} type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
            </div>
          </div>
          {isBetween && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Grupo asignado <span className={styles.opt}>(opcional — dejar vacío para fase común)</span></label>
              <select className={styles.formInput} value={form.groupId} onChange={e => setForm(f => ({...f, groupId: e.target.value}))}>
                <option value="">Todos los participantes (fase común)</option>
                {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
              </select>
            </div>
          )}
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'Guardando...' : 'Guardar fase'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
