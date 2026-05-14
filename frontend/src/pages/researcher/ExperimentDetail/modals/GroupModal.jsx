import { useState, useEffect } from 'react'
import styles from '../ExperimentDetail.module.css'

const IcoX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const GROUP_COLORS = ['#6C4DE6','#00D4AA','#4A8BF5','#F59E0B','#EC4899','#10B981']

export default function GroupModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6C4DE6', ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (open) setForm({ name: '', description: '', color: '#6C4DE6', ...initial }) }, [open, initial])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true); setError('')
    try { await onSave({ name: form.name.trim(), description: form.description.trim(), color: form.color }); onClose() }
    catch (err) { setError(err.message || 'Error al guardar') }
    finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{initial?.id ? 'Editar grupo' : 'Nuevo grupo'}</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Los grupos permiten comparar subconjuntos de participantes.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre del grupo</label>
            <input className={styles.formInput} value={form.name} onChange={e => { setForm(f => ({...f, name: e.target.value})); setError('') }} placeholder="Ej. Grupo Control, Grupo Experimental..." autoFocus />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripcion <span className={styles.opt}>(opcional)</span></label>
            <textarea className={`${styles.formInput} ${styles.textarea}`} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe brevemente este grupo..." rows={2} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color identificador</label>
            <div className={styles.colorPicker}>
              {GROUP_COLORS.map(c => (
                <button key={c} type="button" className={`${styles.colorDot} ${form.color === c ? styles.colorDotActive : ''}`}
                  style={{ background: c }} onClick={() => setForm(f => ({...f, color: c}))} />
              ))}
            </div>
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>{loading ? 'Guardando...' : 'Guardar grupo'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
