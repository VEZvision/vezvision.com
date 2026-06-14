import styles from './Group23Section.module.scss';
import { useLanguageContext } from '@/hooks/useLanguage';

function TileAlwaysAvailable() { const { t } = useLanguageContext();
return (
  <div className={styles.tileAlways}>
    <div className={styles.tileAlwaysGraphic} aria-hidden="true">
      <div className={styles.tileAlwaysDial}>
        <div className={styles.tileAlwaysHand} />
        <div className={styles.tileAlwaysDot} />
      </div>
    </div>

    <div className={styles.tileAlwaysText}>
      <h3 id="tile-always-available-heading" className={styles.tileTitleMedium}>
        {t('group23.always.title')}
      </h3>
      <p className={styles.tileDescription}>
        {t('group23.always.description')}
      </p>
      <div className={styles.tileSeparator} aria-hidden="true" />
      <div className={styles.tileAlwaysFeatures}>
        <p className={styles.tileFeature}>{t('group23.always.feature1')}</p>
        <div className={styles.tileDivider} aria-hidden="true" />
        <p className={styles.tileFeature}>{t('group23.always.feature2')}</p>
      </div>
    </div>
  </div>
); };

export default TileAlwaysAvailable;