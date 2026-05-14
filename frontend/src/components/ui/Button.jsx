import styles from './Button.module.css'

/**
 * Button component
 *
 * Props:
 *   variant  → 'primary' | 'cyan' | 'ghost' | 'danger'  (default: 'primary')
 *   size     → 'sm' | 'md' | 'lg'                        (default: 'md')
 *   loading  → boolean
 *   disabled → boolean
 *   fullWidth → boolean
 *   ...rest  → all native button props
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    fullWidth ? styles['btn--full'] : '',
    loading   ? styles['btn--loading'] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </button>
  )
}
