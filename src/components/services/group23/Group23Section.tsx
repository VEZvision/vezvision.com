import styles from './Group23Section.module.scss';
import TileModernApproach from './TileModernApproach';
import TileAlwaysAvailable from './TileAlwaysAvailable';
import TileRealGrowth from './TileRealGrowth';
import { useLanguageContext } from '@/hooks/useLanguage';
import SectionHeader from '@/components/ui/SectionHeader';
import benefitsIcon from '@/assets/benefits-icon.svg';
import { SectionReveal, StaggerReveal, StaggerItem } from '@/components/ui/SectionReveal';

const Group23Section: React.FC = () => {
  const { t } = useLanguageContext();
  return (
    <section id="group23" className={styles.section} aria-labelledby="group23-heading">
      <div className={styles.container}>
        <SectionReveal>
          <SectionHeader
            badgeText={t('benefits.badge')}
            badgeIcon={<img src={benefitsIcon} alt="" className="w-3.5 h-3.5" aria-hidden="true" />}
            title={
              <>
                {t('group23.header.line1')} <span className="font-playfair italic font-medium">{t('group23.header.line2.italic')}</span>
              </>
            }
            subtitle={t('group23.subtitle')}
            className="mb-16"
          />
        </SectionReveal>

        <StaggerReveal className={styles.grid}>
          <StaggerItem>
            <article className={styles.card} aria-labelledby="tile-modern-approach-heading">
              <TileModernApproach />
            </article>
          </StaggerItem>
          <StaggerItem>
            <article className={styles.card} aria-labelledby="tile-always-available-heading">
              <TileAlwaysAvailable />
            </article>
          </StaggerItem>
          <StaggerItem>
            <article className={styles.card} aria-labelledby="tile-real-growth-heading">
              <TileRealGrowth />
            </article>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
};

export default Group23Section;