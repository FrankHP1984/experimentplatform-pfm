import { useState, useEffect } from 'react'
import { createInvitation } from '../../../../api/invitations'
import styles from '../ExperimentDetail.module.css'

const IcoX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IcoCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

export default function InviteLinkModal({ open, experimentId, onClose, onCreated }) {
  const [email,   setEmail]   = useState('')
  const [link,    setLink]    = useState('')
  const [copied,  setCopied]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (open) { setEmail(''); setLink(''); setCopied(false); setError(''); setLoading(false) }
  }, [open])

  const handleSend = async e => {
    e.preventDefault()
    if (!email.trim()) { setError('Introduce un correo'); return }
    setLoading(true); setError('')
    try {
      const inv = await createInvitation(experimentId, email.trim())
      setLink(`${window.location.origin}/invite/${inv.token}`)
      setLoading(false)
      if (onCreated) onCreated(inv)
    } catch (error) {
      console.error('Error creando invitación:', error)
      setError('No se pudo crear la invitación')
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Invitar participante</span>
          <button className={styles.modalClose} onClick={onClose}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>Introduce el correo del participante para generar su enlace de invitacion unico.</p>
        <form onSubmit={handleSend}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Correo electronico</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="participante@ejemplo.com"
              autoFocus
              disabled={!!link}
            />
          </div>
          {error && <p className={styles.formError}>{error}</p>}
          {link && (
            <div className={styles.inviteRow}>
              <div className={styles.inviteBox}>{link}</div>
              <button type="button" className={`${styles.topbarBtn} ${styles.topbarBtnGhost}`} onClick={copyLink}>
                <IcoCopy />
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          )}
          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onClose}>Cerrar</button>
            {!link && (
              <button type="submit" className={`${styles.btnModal} ${styles.btnPrimary}`} disabled={loading}>
                {loading ? 'Generando...' : 'Generar enlace'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
