import '../styles/GridBackground.css';
import { useHeroContactAction } from '@/hooks/useHeroContactAction';
import { Briefcase } from 'lucide-react';

import VideoHeroSection from '@/components/common/VideoHeroSection';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useSettings } from '@/hooks/useSettings';
import { StaticPage } from '@/pagekit';
import FacebookIcon from '@/assets/social-facebook';
import socialInstagram from '@/assets/products/social-instagram.svg';
import LinkedInIcon from '@/assets/social-linkedin';
import Group23Section from '@/components/services/group23/Group23Section';
import WorkflowSection from '@/components/services/workflow/WorkflowSection';
import ServicesSection from '@/components/services/ServicesSection';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import ContactSection from '@/components/contact/ContactSection';

function ServicesHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const handleContactClick = useHeroContactAction();

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t('services.hero.title.line1')}</span>
          <span className="block">
            {t('services.hero.title.line2')} <span className="font-sans">{t('services.hero.title.emphasis')}</span>
          </span>
        </>
      }
      subtitle={t('services.hero.description')}
      buttonText={t('services.hero.contact')}
      onButtonClick={handleContactClick}
      badge={t('services.hero.badge')}
      icon={<Briefcase className="w-3.5 h-3.5" />}
      socialLinks={[
        { href: social?.facebook || social?.x, icon: <FacebookIcon />, label: 'Facebook' },
        { href: social?.instagram, icon: <img src={socialInstagram} className="w-6 h-6" alt="" />, label: 'Instagram' },
        { href: social?.linkedin, icon: <LinkedInIcon />, label: 'LinkedIn' },
      ]}
    />
  );
}

export default function Services() {
  return (
    <StaticPage
      seoKey="services"
      shell={{ className: 'min-h-screen', style: { backgroundColor: 'transparent' } }}
      sections={[
        { key: 'hero', Component: ServicesHero, eager: true },
        { key: 'group23', Component: Group23Section, eager: true },
        { key: 'workflow', Component: WorkflowSection, eager: true },
        { key: 'services', Component: ServicesSection, eager: true },
        { key: 'newsletter', Component: NewsletterSection, eager: true },
        { key: 'contact', Component: ContactSection, eager: true },
      ]}
    />
  );
}
