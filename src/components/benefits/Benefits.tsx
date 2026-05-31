
import SectionHeader from '../ui/SectionHeader';
import { ThumbsUp } from 'lucide-react';
import Container1 from './Container1';
import Container2 from './Container2';
import BenefitsMultifunction from './BenefitsMultifunction';
import styles from './Benefits.module.css';

import MoreBenefits from './MoreBenefits';
import { SectionReveal, StaggerItem, StaggerReveal } from '@/components/ui/SectionReveal';
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

        <StaggerReveal className={styles.benefitsGrid} amount={0.18}>
          <StaggerItem>
            <Container1 />
          </StaggerItem>
          <StaggerItem>
            <Container2 />
          </StaggerItem>
          <StaggerItem>
            <BenefitsMultifunction />
          </StaggerItem>
        </StaggerReveal>

        <SectionReveal delay={0.12} amount={0.2}>
          <MoreBenefits />
        </SectionReveal>
        </div>
      </SectionReveal>
    </section>
  );
};

export default Benefits;
