import '../styles/GridBackground.css';
import VideoHeroSection from '@/components/common/VideoHeroSection';
import ContactFormSection from '@/components/contact/ContactFormSection';
import FaqSection from '@/components/faq/FaqSection';
import { ContactSection } from '@/components/contact';
import Footer from '@/components/footer/Footer';
import { useLanguageContext } from '@/hooks/useLanguage';
import PageSeo from '@/components/seo/PageSeo';
import { usePageSections } from '@/hooks/usePageSection';
import { useSettings } from '@/hooks/useSettings';
import { usePageSectionConfig } from '@/hooks/usePageSection';
import { Phone } from 'lucide-react';
import socialX from '@/assets/social-x.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';
import socialInstagram from '@/assets/products/social-instagram.svg';

const ContactHeroWrapper = () => {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const sectionConfig = usePageSectionConfig('contact', 'hero');

  const handleScrollToForm = () => {
    if (typeof document === 'undefined') return;
    const targetId = typeof sectionConfig.formTargetId === 'string' ? sectionConfig.formTargetId : 'contact-form-section';
    const formSection = document.getElementById(targetId) || document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const socialLinks = [
    ...(social?.x ? [{ href: social.x, icon: socialX, label: t('about.hero.social.xAlt') }] : []),
    ...(social?.linkedin ? [{ href: social.linkedin, icon: socialLinkedin, label: t('about.hero.social.linkedinAlt') }] : []),
    ...(social?.instagram ? [{ href: social.instagram, icon: socialInstagram, label: t('about.hero.social.instagramAlt') }] : []),
  ];

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t('contact.hero.title.line1')}</span>
          <span className="block font-serif italic">{t('contact.hero.title.line2.italic')}</span>
        </>
      }
      subtitle={t('contact.hero.description')}
      buttonText={t('nav.contact')}
      onButtonClick={handleScrollToForm}
      badge={t('contact.hero.badge')}
      icon={<Phone className="w-3.5 h-3.5" />}
      socialLinks={socialLinks}
      ariaLabelledBy="contact-hero-title"
    />
  );
};

const SECTION_COMPONENTS = {
  hero: ContactHeroWrapper,
  faq: () => <FaqSection showContactCta={false} />,
  contact: ContactSection,
} as const;

const FALLBACK_SECTION_ORDER = ['hero', 'form', 'faq', 'contact'] as const;

const Contact = () => {
  const { t } = useLanguageContext();
  const sections = usePageSections('contact');
  const renderedSections = sections.length > 0
    ? sections
    : FALLBACK_SECTION_ORDER.map((section_key, order_index) => ({ page_key: 'contact', section_key, order_index, enabled: true, content_pl: {}, content_en: {}, config: {}, updated_at: '' }));
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', position: 'relative', zIndex: 1 }}>
      <PageSeo pageKey="contact" />
      <div className="grid-background"></div>
      {renderedSections.map((section) => {
        if (section.section_key === 'form') {
          return <ContactFormSection key={section.section_key} t={t} />;
        }

        const Component = SECTION_COMPONENTS[section.section_key as keyof typeof SECTION_COMPONENTS];
        return Component ? <Component key={section.section_key} /> : null;
      })}
      <Footer />
    </div>
  );
};

export default Contact;
