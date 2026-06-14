import styles from './Group23Section.module.scss';
import { useLanguageContext } from '@/hooks/useLanguage';

function TileRealGrowth() { const { t } = useLanguageContext();
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
        <svg
          className={styles.chartSvg}
          viewBox="0 0 400 160"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#04070d" stopOpacity="0.16" />
              <stop offset="1" stopColor="#04070d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4 4">
            <line x1="20" y1="30" x2="380" y2="30" />
            <line x1="20" y1="60" x2="380" y2="60" />
            <line x1="20" y1="90" x2="380" y2="90" />
            <line x1="20" y1="120" x2="380" y2="120" />
          </g>
          <path
            d="M20 130 L55 120 L95 125 L135 100 L175 85 L215 90 L255 65 L295 50 L335 55 L365 35 L380 30 L380 160 L20 160 Z"
            fill="url(#growthFill)"
            className={styles.chartArea}
          />
          <path
            d="M20 130 L55 120 L95 125 L135 100 L175 85 L215 90 L255 65 L295 50 L335 55 L365 35 L380 30"
            fill="none"
            stroke="#04070d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.chartLinePath}
          />
          <circle cx="380" cy="30" r="5" fill="#04070d" className={styles.chartDot} />
        </svg>
      </div>
    </div>
  </div>
); };

export default TileRealGrowth;
