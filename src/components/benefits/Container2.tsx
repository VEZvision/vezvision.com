import { useState, useEffect } from 'react';
import styles from './Container2.module.css';
import { useLanguageContext } from '../../hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const Container2: React.FC = () => {
  const [alt, setAlt] = useState(false);
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setAlt(false);
      return;
    }

    const interval = setInterval(() => {
      setAlt((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <article className={`${styles.container} ${alt ? styles.alt : ""}`} aria-labelledby="container2-title">
      <div className={styles.chartWrapper}>
        <div className={styles.shape} role="img" aria-label={t('benefits.container2.chartAlt')}>
          <div className={styles.bar}></div>
          <div className={styles.bar2}></div>
          <div className={styles.bar3}></div>
          <div className={styles.bar4}></div>
        </div>

        <div>
          <div className={styles.automationLabel} aria-hidden={alt}>
            <span className={styles.labelText}>80% Automation</span>
          </div>
          <div className={styles.automationLabelAlt} aria-hidden={!alt}>
            <span className={styles.labelText}>10% Automation</span>
          </div>
        </div>

        <div>
          <div className={styles.costLabel} aria-hidden={alt}>
            <span className={styles.labelText}>10% Cost</span>
          </div>
          <div className={styles.costLabelAlt} aria-hidden={!alt}>
            <span className={styles.labelText}>80% Cost</span>
          </div>
        </div>

        <div>
          <div className={styles.afterLabel} aria-hidden={alt}>
            <span className={styles.afterText}>AFTER</span>
          </div>
          <div className={styles.beforeLabel} aria-hidden={!alt}>
            <span className={styles.afterText}>BEFORE</span>
          </div>
        </div>
      </div>

      <div className={styles.textContainer}>
        <h3 id="container2-title" className={styles.title}>
          {t('benefits.container2.title')}
        </h3>
        <div className={styles.description}>
          <p className={styles.descriptionText}>
            {t('benefits.container2.description')}
          </p>
        </div>
      </div>
    </article>
  );
};

export default Container2;
