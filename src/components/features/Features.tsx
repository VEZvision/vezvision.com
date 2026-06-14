import styles from './Features.module.css';
import FeatureCard from './FeatureCard';
import aiSupportImage from '@/assets/features/ai-support-image.png';
import aiSupportIcon from '@/assets/features/ai-support-icon.svg';
import webAppsIcon from '@/assets/features/web-apps-icon.svg';
import marketingIcon from '@/assets/features/marketing-icon.svg';
import automationIcon from '@/assets/features/automation-icon.svg';
import automationImage from '@/assets/features/automation-image.png';
import aiSupportImageSrcset from '@/assets/features/ai-support-image.png?w=600;1200&format=webp&as=srcset';
import aiSupportImageAvifSrcset from '@/assets/features/ai-support-image.png?w=600;1200&format=avif&as=srcset';
import automationImageSrcset from '@/assets/features/automation-image.png?w=600;1200&format=webp&as=srcset';
import automationImageAvifSrcset from '@/assets/features/automation-image.png?w=600;1200&format=avif&as=srcset';
import { useLanguageContext } from '@/hooks/useLanguage';
import SectionHeader from '@/components/ui/SectionHeader';
import { StaggerReveal, StaggerItem, SectionReveal } from '@/components/ui/SectionReveal';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageSectionConfig } from '@/hooks/usePageSection';
import { safeCmsHref } from '@/utils/safeHref';

function Features() { const { t } = useLanguageContext();
const sectionConfig = usePageSectionConfig('home', 'features');
const primaryHref = safeCmsHref(sectionConfig.primaryHref, '/contact');
const secondaryHref = safeCmsHref(sectionConfig.secondaryHref, '/services');

return (
  <section id="features" className={styles.featuresSection} aria-labelledby="features-heading">
    <div className={styles.container}>
      <SectionReveal>
      <SectionHeader
        badgeText={t('features.badge')}
        badgeIcon={<Zap className="w-3.5 h-3.5" />}
        title={
          <>
            {t('features.title.line1')} <span className="font-sans">{t('features.title.line2.italic')}</span>
          </>
        }
        subtitle={t('features.subtitle')}
        id="features-heading"
      />
      </SectionReveal>

      <StaggerReveal className={styles.featuresGrid}>
        <div className={styles.topRow}>
          <StaggerItem className={styles.featureCardLarge}>
            <FeatureCard
              variant="large"
              title={t('features.card.ai.title')}
              description={t('features.card.ai.desc')}
              image={aiSupportImage}
              imageSrcSet={aiSupportImageSrcset}
              imageAvifSrcSet={aiSupportImageAvifSrcset}
              icon={aiSupportIcon}
            />
          </StaggerItem>
          <StaggerItem className={styles.featureCardMedium}>
            <FeatureCard
              variant="medium"
              title={t('features.card.web.title')}
              description={t('features.card.web.desc')}
              icon={webAppsIcon}
            />
          </StaggerItem>
        </div>
        <div className={styles.bottomRow}>
          <StaggerItem className={styles.featureCardMedium}>
            <FeatureCard
              variant="medium"
              title={t('features.card.marketing.title')}
              description={t('features.card.marketing.desc')}
              icon={marketingIcon}
            />
          </StaggerItem>
          <StaggerItem className={styles.featureCardLarge}>
            <FeatureCard
              variant="large"
              title={t('features.card.automation.title')}
              description={t('features.card.automation.desc')}
              image={automationImage}
              imageSrcSet={automationImageSrcset}
              imageAvifSrcSet={automationImageAvifSrcset}
              icon={automationIcon}
            />
          </StaggerItem>
        </div>
      </StaggerReveal>

      <SectionReveal delay={0.3}>
      <div className={styles.cta}>
        <Link
          to={primaryHref}
          className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-6 py-3 text-sm font-semibold shadow-md hover:bg-zinc-900 hover:-translate-y-0.5 transition transform"
        >
          <span>{t('features.cta.primary')}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <Link
          to={secondaryHref}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-zinc-900 px-6 py-3 text-sm font-medium border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:-translate-y-0.5 transition transform"
        >
          {t('features.cta.secondary')}
        </Link>
      </div>
      </SectionReveal>
    </div>
  </section>
); };

export default Features;
