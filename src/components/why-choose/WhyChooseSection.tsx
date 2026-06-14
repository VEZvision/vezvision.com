import styles from './WhyChooseSection.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';
import { useLanguageContext } from '@/hooks/useLanguage';

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" {...props} aria-hidden="true">
      <path d="M8 1.5L9.6 6.4L14.5 8L9.6 9.6L8 14.5L6.4 9.6L1.5 8L6.4 6.4L8 1.5Z" fill="currentColor" />
    </svg>
  );
}

function WhyChooseSection() { // Parametry kształtu sieci – dopasowane do Figma (749_2632)
const center = { x: 148, y: 141, r: 22 };
const stems = [
  { angleDeg: 59, length: 105 },
  { angleDeg: 15, length: 118 },
  { angleDeg: -84, length: 115 },
  { angleDeg: 142, length: 102 },
  { angleDeg: -46, length: 104 },
  { angleDeg: -158, length: 108 },
  { angleDeg: 327, length: 100 },
];

const { t } = useLanguageContext();

const title = (
  <>
    {t('why.header.title.line1')} <span className="font-sans font-semibold">{t('why.header.title.line2.italic')}</span>
  </>
);

return (
  <section id="why-choose" className={styles.section} aria-label={t('why.header.aria')}>
    <div className={styles.container}>
      <SectionHeader
        badgeText={t('why.header.tag')}
        badgeIcon={<StarIcon className="w-3.5 h-3.5" />}
        title={title}
        subtitle={t('why.header.subtitle')}
        className="mb-16"
      />

      <StaggerReveal className={styles.cards} amount={0.3}>
        {/* Card 1 */}
        <StaggerItem>
        <article
          className={styles.card}
          role="listitem"
        >
          <div className={styles.shapeArea} aria-hidden="true">
            <div className={styles.gauge}>
              <div className={styles.gaugeInner} />
            </div>
          </div>
          <div className={styles.content}>
            <h3 className={styles.cardTitle}>{t('why.card1.title')}</h3>
            <p className={styles.cardDesc}>{t('why.card1.desc')}</p>
          </div>
        </article>
        </StaggerItem>

        {/* Card 2 */}
        <StaggerItem>
        <article
          className={styles.card}
          role="listitem"
        >
          <div className={styles.shapeArea} aria-hidden="true">
            <div className={styles.bars}>
              <div className={`${styles.bar} ${styles.h75}`} />
              <div className={`${styles.bar} ${styles.h91}`} />
              <div className={`${styles.bar} ${styles.h107}`} />
              <div className={`${styles.bar} ${styles.h119}`} />
            </div>
          </div>
          <div className={styles.content}>
            <h3 className={styles.cardTitle}>{t('why.card2.title')}</h3>
            <p className={styles.cardDesc}>{t('why.card2.desc')}</p>
          </div>
        </article>
        </StaggerItem>

        {/* Card 3 */}
        <StaggerItem>
        <article
          className={`${styles.card} ${styles.thirdCard}`}
          role="listitem"
        >
          <div className={`${styles.shapeArea} ${styles.networkShapeArea}`} aria-hidden="true">
            <svg
              className={styles.networkSvg}
              viewBox="0 0 297 282"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="stemGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ededed" />
                  <stop offset="1" stopColor="#d9d9d9" />
                </linearGradient>
                <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0000001a" />
                </filter>
              </defs>
              <g className={styles.stemGroup} stroke="url(#stemGradient)" strokeWidth="5" strokeLinecap="round" filter="url(#softShadow)">
                {stems.map(({ angleDeg, length }, i) => {
                  const rad = (angleDeg * Math.PI) / 180;
                  const x1 = center.x + Math.cos(rad) * center.r;
                  const y1 = center.y + Math.sin(rad) * center.r;
                  const x2 = center.x + Math.cos(rad) * length;
                  const y2 = center.y + Math.sin(rad) * length;
                  return (
                    <g key={i} className={styles.stem}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} />
                      <circle cx={x2} cy={y2} r={10} fill="#d9d9d9" className={styles.stemDot} />
                    </g>
                  );
                })}
                <circle cx={center.x} cy={center.y} r={center.r} fill="#d9d9d9" />
              </g>
            </svg>
          </div>
          <div className={styles.content}>
            <h3 className={styles.cardTitle}>{t('why.card3.title')}</h3>
            <p className={styles.cardDesc}>{t('why.card3.desc')}</p>
          </div>
        </article>
        </StaggerItem>
      </StaggerReveal>
    </div>
  </section>
); };

export default WhyChooseSection;
