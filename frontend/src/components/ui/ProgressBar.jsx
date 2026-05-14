import styles from './ProgressBar.module.css'

export default function ProgressBar({ value = 0, max = 100, color = 'violet', showLabel = false }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[`fill--${color}`]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
        />
      </div>
      {showLabel && <span className={styles.label}>{pct}%</span>}
    </div>
  )
}
