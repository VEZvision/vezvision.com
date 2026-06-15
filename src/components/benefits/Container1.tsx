import styles from './Container1.module.css';
import { useLanguageContext } from '../../hooks/useLanguage';

const Container1: React.FC = () => {
  const { t } = useLanguageContext();

  return (
    <article className={styles.container} aria-label={t('benefits.container1.title')}>
      <div className={`${styles.visual} vez-decorative-motion`} aria-hidden="true">
        <div className={styles.gauge}>
          <div className={styles.gaugeInner} />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{t('benefits.container1.title')}</h3>
        <p className={styles.description}>
          {t('benefits.container1.description')}
        </p>
      </div>
    </article>
  );
};

export default Container1;
