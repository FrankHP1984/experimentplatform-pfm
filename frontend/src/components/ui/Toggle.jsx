import styles from './Toggle.module.css'

export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`${styles.toggle} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}
