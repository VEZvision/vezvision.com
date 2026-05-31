import '../styles/GridBackground.css';
import { useNavigate } from 'react-router-dom';
import PageSeo from '@/components/seo/PageSeo';
import VideoHeroSection from '@/components/common/VideoHeroSection';
import AboutHeader from '@/components/about/AboutHeader';
import AboutCards from '@/components/about/AboutCards';
import ValuesSection from '@/components/about/ValuesSection';
import WhyChooseSection from '@/components/why-choose/WhyChooseSection';
import AboutComparison from '../components/about/AboutComparison';
import FaqSection from '@/components/faq/FaqSection';
import { ContactSection } from '@/components/contact';
import Footer from '@/components/footer/Footer';
import { usePageSections } from '@/hooks/usePageSection';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useSettings } from '@/hooks/useSettings';
import { usePageSectionConfig } from '@/hooks/usePageSection';
import { Info } from 'lucide-react';
import socialX from '@/assets/social-x.svg';
import socialInstagram from '@/assets/products/social-instagram.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';
import { safeCmsHref } from '@/utils/safeHref';

const AboutHeroWrapper = () => {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const sectionConfig = usePageSectionConfig('about', 'hero');
  const navigate = useNavigate();

  const handleContactClick = () => {
    if (typeof document === 'undefined') return;

    const contactSection = document.getElementById('kontakt') ?? document.getElementById('contact-form-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      void navigate(safeCmsHref(sectionConfig.contactHref, '/contact#kontakt'));
    }
  };

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t('about.hero.title.line1')}</span>
          <span className="block">
            {t('about.hero.title.line2.before')} <span className="font-serif italic">{t('about.hero.title.line2.italic')}</span>
          </span>
        </>
      }
      subtitle={t('about.hero.description')}
      buttonText={t('nav.contact')}
      onButtonClick={handleContactClick}
      badge={t('about.hero.badge')}
      icon={<Info className="w-3.5 h-3.5" />}
      socialLinks={[
        ...(social?.x ? [{ href: social.x, icon: socialX, label: t('about.hero.social.xAlt') }] : []),
        ...(social?.instagram ? [{ href: social.instagram, icon: socialInstagram, label: t('about.hero.social.instagramAlt') }] : []),
        ...(social?.linkedin ? [{ href: social.linkedin, icon: socialLinkedin, label: t('about.hero.social.linkedinAlt') }] : []),
      ]}
    />
  );
};

const SECTION_COMPONENTS = {
  hero: AboutHeroWrapper,
  header: AboutHeader,
  cards: AboutCards,
  values: ValuesSection,
  about_comparison: AboutComparison,
  why_choose: WhyChooseSection,
  faq: FaqSection,
  contact: ContactSection,
} as const;

const FALLBACK_SECTION_ORDER = ['hero', 'header', 'cards', 'values', 'about_comparison', 'why_choose', 'faq', 'contact'] as const;

const About = () => {
  const sections = usePageSections('about');
  const renderedSections = sections.length > 0
    ? sections
    : FALLBACK_SECTION_ORDER.map((section_key, order_index) => ({ page_key: 'about', section_key, order_index, enabled: true, content_pl: {}, content_en: {}, config: {}, updated_at: '' }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', position: 'relative', zIndex: 1 }}>
      <PageSeo pageKey="about" />
      <div className="grid-background"></div>
      {renderedSections.map((section) => {
        const Component = SECTION_COMPONENTS[section.section_key as keyof typeof SECTION_COMPONENTS];
        return Component ? <Component key={section.section_key} /> : null;
      })}
      <Footer />
    </div>
  );
};

export default About;
