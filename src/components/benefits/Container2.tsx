import styles from './Container2.module.css';
import { useLanguageContext } from '../../hooks/useLanguage';

/** Static "after" chart — no setInterval / React state during scroll (Contact-style lightweight). */
const Container2: React.FC = () => {
  const { t } = useLanguageContext();

  return (
    <article
      className={`${styles.container} ${styles.isAfter}`}
      aria-labelledby="container2-title"
    >
      <div className={styles.chartWrapper}>
        <div className={styles.chartScene} role="img" aria-label={t('benefits.container2.chartAlt')}>
          <div className={styles.phaseTrack} aria-live="polite">
            <div className={`${styles.phaseLabel} ${styles.afterLabel}`}>
              <span className={styles.phaseText}>AFTER</span>
            </div>
          </div>
          <div className={styles.shape}>
            <div className={styles.bar} />
            <div className={`${styles.bar2} ${styles.barTall}`} />
            <div className={styles.bar3} />
            <div className={styles.bar4} />
          </div>

          <div className={`${styles.pill} ${styles.automationLabel}`}>
            <span className={styles.labelText}>80% Automation</span>
          </div>

          <div className={`${styles.pill} ${styles.costLabel}`}>
            <span className={styles.labelText}>10% Cost</span>
          </div>
        </div>
      </div>

      <div className={styles.textContainer}>
        <h3 id="container2-title" className={styles.title}>
          {t('benefits.container2.title')}
        </h3>
        <p className={styles.descriptionText}>{t('benefits.container2.description')}</p>
      </div>
    </article>
  );
};

export default Container2;
