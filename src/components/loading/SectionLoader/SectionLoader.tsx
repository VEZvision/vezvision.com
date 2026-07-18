import styles from "./SectionLoader.module.css";

type SectionLoaderProps = {
  label?: string;
  className?: string;
  compact?: boolean;
};

/** Quiet, brand-neutral loading state for data-backed page sections. */
export default function SectionLoader({
  label = "Loading content",
  className = "",
  compact = false,
}: SectionLoaderProps) {
  return (
    <div
      className={`${styles.loader} ${compact ? styles.compact : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={styles.card} aria-hidden="true">
        <span className={styles.kicker} />
        <span className={styles.title} />
        <span className={styles.copy} />
        <span className={styles.copyShort} />
      </div>
      <span className={styles.visuallyHidden}>{label}</span>
    </div>
  );
}
