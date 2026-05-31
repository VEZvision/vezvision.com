import '../styles/GridBackground.css';
import PageSeo from '@/components/seo/PageSeo';
import VideoHeroSection from '@/components/common/VideoHeroSection';
import ServicesSection from '@/components/services/ServicesSection';
import Group23Section from '@/components/services/group23/Group23Section';
import WorkflowSection from '@/components/services/workflow/WorkflowSection';
import ContactSection from '../components/contact/ContactSection';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import Footer from '@/components/footer/Footer';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useSettings } from '@/hooks/useSettings';
import { Briefcase } from 'lucide-react';
import socialX from '@/assets/social-x.svg';
import socialInstagram from '@/assets/products/social-instagram.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';

const ServicesHeroWrapper = () => {
  const { t } = useLanguageContext();
  const { social } = useSettings();

  const handleContactClick = () => {
    if (typeof document === 'undefined') return;

    const contactSection = document.getElementById('kontakt') ?? document.getElementById('contact-form-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (typeof window !== 'undefined') {
      window.location.href = '/contact#kontakt';
    }
  };

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t('services.hero.title.line1')}</span>
          <span className="block">
            {t('services.hero.title.line2')} <span className="font-serif italic">biznes</span>
          </span>
        </>
      }
      subtitle={t('services.hero.description')}
      buttonText={t('services.hero.contact')}
      onButtonClick={handleContactClick}
      badge={t('services.hero.badge')}
      icon={<Briefcase className="w-3.5 h-3.5" />}
      socialLinks={[
        ...(social?.x ? [{ href: social.x, icon: socialX, label: 'Follow us on X (Twitter)' }] : []),
        ...(social?.instagram ? [{ href: social.instagram, icon: socialInstagram, label: 'Follow us on Instagram' }] : []),
        ...(social?.linkedin ? [{ href: social.linkedin, icon: socialLinkedin, label: 'Connect with us on LinkedIn' }] : []),
      ]}
    />
  );
};

const Services = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <PageSeo pageKey="services" />
      <div className="grid-background"></div>
      <ServicesHeroWrapper />
      <Group23Section />
      <WorkflowSection />
      <ServicesSection />
      <NewsletterSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Services;
