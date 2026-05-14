import { useNavigate } from 'react-router-dom'
import styles from './NotFound.module.css'

const IconSearch = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="url(#g404)" strokeWidth="1.5">
    <defs>
      <linearGradient id="g404" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#6C4DE6"/>
        <stop offset="1" stopColor="#00D4AA"/>
      </linearGradient>
    </defs>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.errorPanel}>
        <div className={styles.iconWrap}>
          <div className={styles.icon}>
            <IconSearch />
          </div>
        </div>
        
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>Página no encontrada</h1>
        <p className={styles.errorDesc}>
          La página que buscas no existe, ha sido movida o la URL está escrita incorrectamente.
        </p>
        
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => navigate('/')}>
            <IconHome />
            Volver al inicio
          </button>
          <button className={styles.btnGhost} onClick={() => navigate(-1)}>
            <IconArrowLeft />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}
