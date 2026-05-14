import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import styles from './Sidebar.module.css'

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email ? email.slice(0, 2).toUpperCase() : 'US'
}

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const IconExperiments = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
  </svg>
)

const IconProfile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
)

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
)

function ResearcherNav({ experimentCount }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.sectionLabel}>Principal</div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <IconDashboard />
        Dashboard
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${styles.navItem} ${window.location.pathname.startsWith('/experiments') ? styles.navItemActive : ''}`
        }
      >
        <IconExperiments />
        Experimentos
        {experimentCount > 0 && (
          <span className={styles.navBadge}>{experimentCount}</span>
        )}
      </NavLink>

      <div className={styles.sectionLabel}>Cuenta</div>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <IconProfile />
        Perfil
      </NavLink>
    </nav>
  )
}

function ParticipantNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.sectionLabel}>Principal</div>

      <NavLink
        to="/participant/dashboard"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <IconDashboard />
        Panel
      </NavLink>

      <div className={styles.sectionLabel}>Cuenta</div>

      <NavLink
        to="/participant/profile"
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <IconProfile />
        Perfil
      </NavLink>
    </nav>
  )
}

export default function Sidebar({ experimentCount = 0 }) {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = getInitials(user?.firstName || user?.name, user?.email)
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.email || 'Usuario'
  const isParticipant = user?.role === 'PARTICIPANT'

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>S</div>
          <span className={styles.logoText}>
            Seraphon
          </span>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userPlan}>
              {isParticipant ? 'Participante' : 'Investigador'}
            </div>
          </div>
          <div className={styles.userChevron}>
            <IconChevron />
          </div>
        </div>
      </div>

      {isParticipant ? (
        <ParticipantNav />
      ) : (
        <ResearcherNav experimentCount={experimentCount} />
      )}

      <div className={styles.sidebarFooter}>
        <button
          className={styles.navItem}
          onClick={() => navigate('/')}
        >
          <IconHome />
          Menu principal
        </button>
        <button
          className={`${styles.navItem} ${styles.navItemDanger}`}
          onClick={handleLogout}
        >
          <IconLogout />
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
