
import SectionHeader from '../ui/SectionHeader';
import { ThumbsUp } from 'lucide-react';
import Container1 from './Container1';
import Container2 from './Container2';
import BenefitsMultifunction from './BenefitsMultifunction';
import styles from './Benefits.module.css';

import MoreBenefits from './MoreBenefits';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { useLanguageContext } from '@/hooks/useLanguage';

const Benefits: React.FC = () => {
  const { t } = useLanguageContext();

  return (
    <section
      id="benefits"
      className={styles.benefitsSection}
      aria-labelledby="benefits-heading"
    >
      <SectionReveal amount={0.25}>
        <div className={styles.container}>
        <SectionHeader
          badgeText={t('benefits.badge')}
          badgeIcon={<ThumbsUp className="w-3.5 h-3.5" />}
          title={
            <>
              {t('benefits.title.line1')} <span className="font-playfair italic">{t('benefits.title.line2.italic')}</span>
            </>
          }
          subtitle={t('benefits.subtitle')}
          id="benefits-heading"
        />

        <div className={styles.benefitsGrid}>
          <Container1 />
          <Container2 />
          <BenefitsMultifunction />
        </div>

        <MoreBenefits />
        </div>
      </SectionReveal>
    </section>
  );
};

export default Benefits;