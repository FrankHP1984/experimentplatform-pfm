import Sidebar from './Sidebar'
import styles from './ResearcherLayout.module.css'

export default function ResearcherLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
