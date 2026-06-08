import styles from './AboutComparison.module.css';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '@/components/ui/SectionHeader';

// Import icons
import iconDifferenceTag from '@/assets/comparison/difference-tag-icon.svg';
import iconCheckVez from '@/assets/comparison/check-vez-1.svg';
import iconCheckVez2 from '@/assets/comparison/check-vez-2.svg';
import iconCheckVez3 from '@/assets/comparison/check-vez-3.svg';
import iconCheckVez4 from '@/assets/comparison/check-vez-4.svg';
import iconCheckVez5 from '@/assets/comparison/check-vez-5.svg';
import iconCheckVez6 from '@/assets/comparison/check-vez-6.svg';
import iconCheckVez7 from '@/assets/comparison/check-vez-7.svg';
import iconArrow from '@/assets/comparison/arrow-icon.svg';
import iconCrossOther from '@/assets/comparison/cross-other-1.svg';
import iconCrossOther2 from '@/assets/comparison/cross-other-2.svg';
import iconCrossOther3 from '@/assets/comparison/cross-other-3.svg';
import iconCrossOther4 from '@/assets/comparison/cross-other-4.svg';
import iconCrossOther5 from '@/assets/comparison/cross-other-5.svg';
import iconCrossOther6 from '@/assets/comparison/cross-other-6.svg';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { useLanguageContext } from '@/hooks/useLanguage';
import { usePageSectionConfig } from '@/hooks/usePageSection';
import { safeCmsHref } from '@/utils/safeHref';

const AboutComparison: React.FC = () => {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const homeConfig = usePageSectionConfig('home', 'about_comparison');
  const aboutConfig = usePageSectionConfig('about', 'about_comparison');

  const handleContactClick = () => {
    if (typeof document === 'undefined') return;

    const contactSection = document.getElementById('kontakt') ?? document.getElementById('contact-form-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const configuredHref = safeCmsHref(
        homeConfig.contactHref ?? aboutConfig.contactHref,
        '/contact#kontakt'
      );
      void navigate(configuredHref);
    }
  };

  const title = (
    <>
      {t('comparison.title.line1')} <span className="font-playfair italic font-medium">{t('comparison.title.line2.italic')}</span>
    </>
  );

  return (
    <section className={styles.container} id="about-comparison">
      <SectionHeader
        badgeText={t('comparison.tag')}
        badgeIcon={<img src={iconDifferenceTag} alt="" className="w-3.5 h-3.5" aria-hidden="true" />}
        title={title}
        subtitle={t('comparison.subtitle')}
        className="mb-16"
      />

      <div className={styles.comparisonGrid}>
        {/* VezVision Column */}
        <SectionReveal>
          <div className={styles.comparisonCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{t('comparison.left.title')}</h3>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b1')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez2} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b2')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez3} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b3')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez4} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b4')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez5} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b5')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez6} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b6')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCheckVez7} alt={t('comparison.alt.check')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.left.b7')}</span>
              </div>
            </div>
            <button type="button" onClick={handleContactClick} className={styles.ctaButton}>
              <span>{t('nav.contact')}</span>
              <img src={iconArrow} alt={t('comparison.alt.arrow')} className={styles.ctaIcon} />
            </button>
          </div>
        </SectionReveal>

        {/* Other Companies Column */}
        <SectionReveal delay={0.12}>
          <div className={styles.comparisonCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{t('comparison.right.title')}</h3>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <img src={iconCrossOther} alt={t('comparison.alt.cross')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.right.b1')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCrossOther2} alt={t('comparison.alt.cross')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.right.b2')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCrossOther3} alt={t('comparison.alt.cross')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.right.b3')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCrossOther4} alt={t('comparison.alt.cross')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.right.b4')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCrossOther5} alt={t('comparison.alt.cross')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.right.b5')}</span>
              </div>
              <div className={styles.benefitItem}>
                <img src={iconCrossOther6} alt={t('comparison.alt.cross')} className={styles.benefitIcon} />
                <span className={styles.benefitText}>{t('comparison.right.b6')}</span>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
};

export default AboutComparison;
