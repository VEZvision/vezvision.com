import { useState, useEffect } from 'react';
import styles from './Container2.module.css';
import { useLanguageContext } from '../../hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Container2Props = {
  active?: boolean;
};

const Container2: React.FC<Container2Props> = ({ active = true }) => {
  const [isBefore, setIsBefore] = useState(false);
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !active) {
      setIsBefore(false);
      return;
    }

    const interval = setInterval(() => {
      setIsBefore((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [active, reducedMotion]);

  return (
    <article
      className={`${styles.container} ${isBefore ? styles.isBefore : styles.isAfter}`}
      aria-labelledby="container2-title"
    >
      <div className={styles.chartWrapper}>
        <div className={styles.chartScene} role="img" aria-label={t('benefits.container2.chartAlt')}>
          <div className={styles.phaseTrack} aria-live="polite">
            <div className={`${styles.phaseLabel} ${styles.afterLabel}`} aria-hidden={isBefore}>
              <span className={styles.phaseText}>AFTER</span>
            </div>
            <div className={`${styles.phaseLabel} ${styles.beforeLabel}`} aria-hidden={!isBefore}>
              <span className={styles.phaseText}>BEFORE</span>
            </div>
          </div>
          <div className={styles.shape}>
            <div className={styles.bar} />
            <div className={`${styles.bar2} ${isBefore ? '' : styles.barTall}`} />
            <div className={styles.bar3} />
            <div className={`${styles.bar4} ${isBefore ? styles.barTall : ''}`} />
          </div>

          <div className={`${styles.pill} ${styles.automationLabel}`} aria-hidden={isBefore}>
            <span className={styles.labelText}>80% Automation</span>
          </div>
          <div className={`${styles.pill} ${styles.automationLabelAlt}`} aria-hidden={!isBefore}>
            <span className={styles.labelText}>10% Automation</span>
          </div>

          <div className={`${styles.pill} ${styles.costLabel}`} aria-hidden={isBefore}>
            <span className={styles.labelText}>10% Cost</span>
          </div>
          <div className={`${styles.pill} ${styles.costLabelAlt}`} aria-hidden={!isBefore}>
            <span className={styles.labelText}>80% Cost</span>
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
