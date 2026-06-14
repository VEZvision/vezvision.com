import styles from './Group23Section.module.scss';
import { useLanguageContext } from '@/hooks/useLanguage';

function TileModernApproach() { const { t } = useLanguageContext();
return (
  <div className={styles.tileModern}>
    <div className={styles.tileModernImage} aria-hidden="true" />
    <div className={styles.tileModernHeading}>
      <p className={styles.tileModernSub}>{t('group23.modern.sub')}</p>
      <h3 id="tile-modern-approach-heading" className={styles.tileTitleLarge}>
        <span>{t('group23.modern.title.line1')}</span>{' '}
        <span>{t('group23.modern.title.line2')}</span>
      </h3>
    </div>
  </div>
); };

export default TileModernApproach;
