import styles from './Group23Section.module.scss';
import chartLine from '@/assets/services/group23/chart-line.svg';
import chartMask from '@/assets/services/group23/chart-mask.svg';
import { useLanguageContext } from '@/hooks/useLanguage';

const TileRealGrowth: React.FC = () => {
  const { t } = useLanguageContext();
  return (
    <div className={styles.tileGrowth}>
      <div className={styles.tileGrowthText}>
        <h3 id="tile-real-growth-heading" className={styles.tileTitleMedium}>{t('group23.growth.title')}</h3>
        <p className={styles.tileDescription}>
          {t('group23.growth.description')}
        </p>
        <div className={styles.tileSeparator} aria-hidden="true" />
      </div>

      <div className={styles.tileGrowthChart} role="img" aria-label={t('group23.growth.chart.aria')}>
        <div className={styles.chartInner}>
          <p className={styles.chartValue}>{t('group23.growth.chart.value')}</p>
          <img src={chartLine} alt="Linia wzrostu" className={styles.chartLine} loading="lazy" decoding="async" />
        </div>
        <img src={chartMask} alt="Maska wykresu" className={styles.chartMask} loading="lazy" decoding="async" />
      </div>
    </div>
  );
};

export default TileRealGrowth;
