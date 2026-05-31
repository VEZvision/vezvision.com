import styles from './WorkflowSection.module.scss';
import { useLanguageContext } from '@/hooks/useLanguage';
import { SectionReveal } from '@/components/ui/SectionReveal';
import SectionHeader from '@/components/ui/SectionHeader';
import { GitBranch } from 'lucide-react';

const StepIcon: React.FC<{ index: number }> = ({ index }) => {
  const stroke = '#344054';
  switch (index) {
    case 0:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="2" />
          <path d="M8 12h8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 1:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 18l8-12 8 12H4z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 2:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="6" width="14" height="12" rx="2" stroke={stroke} strokeWidth="2" />
          <path d="M8 10h8M8 14h5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 3:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 18h16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 14l4-4 4 4" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 4:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="2" />
          <path d="M12 7v5l3 2" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 12l4 4 8-8" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const WorkflowSection: React.FC = () => {
  const { t } = useLanguageContext();

  const steps = [
    { title: t('workflow.step1.title'), desc: t('workflow.step1.desc') },
    { title: t('workflow.step2.title'), desc: t('workflow.step2.desc') },
    { title: t('workflow.step3.title'), desc: t('workflow.step3.desc') },
    { title: t('workflow.step4.title'), desc: t('workflow.step4.desc') },
    { title: t('workflow.step5.title'), desc: t('workflow.step5.desc') },
    { title: t('workflow.step6.title'), desc: t('workflow.step6.desc') },
  ];

  return (
    <SectionReveal amount={0.2}>
    <section
      id="workflow"
      className={styles.section}
      aria-labelledby="workflow-heading"
    >
      <div className={styles.container}>
        <SectionHeader
          badgeText={t('workflow.badge')}
          badgeIcon={<GitBranch className="w-3.5 h-3.5" />}
          title={
            <>
              {t('workflow.header.line1')} <span className="font-playfair italic font-medium">{t('workflow.header.line2.italic')}</span>
            </>
          }
          subtitle={t('workflow.subtitle')}
          className="mb-16"
        />

        {/* Snake timeline (SVG) */}
        <div className={styles.timelineWrapper} aria-hidden="true">
          <svg className={styles.snakeSvg} viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="snake-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#344054" stopOpacity="0.20" />
                <stop offset="50%" stopColor="#344054" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#344054" stopOpacity="0.20" />
              </linearGradient>
            </defs>
            <path
              className={styles.snake}
              d="M0,10 C14,4 28,16 42,10 S66,4 80,10 S92,16 100,10"
              stroke="url(#snake-grad)"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        </div>

        {/* Steps */}
        <div className={styles.steps} role="list">
          {steps.map((step, i) => (
            <article key={i} className={styles.stepCard} role="listitem" aria-label={`Etap ${i + 1}: ${step.title}`}>
              <h3 className={styles.stepTitle}>
                <span className={styles.iconWrap}><StepIcon index={i} /></span>
                {step.title}
              </h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </article>
          ))}
        </div>

        <div className={styles.cta}>
          <p className={styles.footerNote}>{t('workflow.cta.note')}</p>
          <button
            className={styles.ctaButton}
            onClick={() => { window.location.href = '/contact'; }}
          >
            <span>{t('workflow.cta.button')}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h12M13 5l7 7-7 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
    </SectionReveal>
  );
};

export default WorkflowSection;