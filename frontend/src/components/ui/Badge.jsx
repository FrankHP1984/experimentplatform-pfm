import styles from './Badge.module.css'

const STATUS_LABELS = {
  DRAFT:     'Borrador',
  ACTIVE:    'Activo',
  PAUSED:    'Pausado',
  FINISHED:  'Finalizado',
  CANCELLED: 'Cancelado',
  PENDING:   'Pendiente',
  COMPLETED: 'Completado',
  WITHDRAWN: 'Retirado',
}

export default function Badge({ status, label, className = '' }) {
  const text = label ?? STATUS_LABELS[status] ?? status
  return (
    <span className={`${styles.badge} ${styles[`status-${status?.toLowerCase()}`] ?? ''} ${className}`}>
      {text}
    </span>
  )
}
