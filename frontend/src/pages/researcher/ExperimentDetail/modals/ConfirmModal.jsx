import styles from '../ExperimentDetail.module.css'

const IcoX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ConfirmModal({ open, title, desc, danger, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal} style={{ maxWidth: 380 }}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.modalClose} onClick={onCancel}><IcoX /></button>
        </div>
        <p className={styles.modalSub}>{desc}</p>
        <div className={styles.modalFooter}>
          <button className={`${styles.btnModal} ${styles.btnGhost}`} onClick={onCancel}>Cancelar</button>
          <button
            className={`${styles.btnModal} ${danger ? styles.btnDanger : styles.btnPrimary}`}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
