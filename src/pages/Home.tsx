import '../styles/GridBackground.css';
import PageSeo from '@/components/seo/PageSeo';
import Hero from '../components/hero/Hero';
import FounderNote from '../components/FounderNote';
import Benefits from '../components/benefits/Benefits';
import Features from '../components/features/Features';
import PotentialSection from '../components/potential/PotentialSection';
import ProcessSection from '../components/process/ProcessSection';
import AboutComparison from '../components/about/AboutComparison';
import ProductsSection from '../components/products/ProductsSection';

import ContactSection from '../components/contact/ContactSection';

import NewsletterSection from '../components/newsletter/NewsletterSection';
import { usePageSections } from '@/hooks/usePageSection';

const SECTION_COMPONENTS = {
  hero: Hero,
  founder_note: FounderNote,
  benefits: Benefits,
  features: Features,
  potential: PotentialSection,
  process: ProcessSection,
  about_comparison: AboutComparison,
  products_teaser: ProductsSection,
  newsletter: NewsletterSection,
  contact: ContactSection,
} as const;

const FALLBACK_SECTION_ORDER = ['hero', 'founder_note', 'benefits', 'features', 'potential', 'process', 'about_comparison', 'products_teaser', 'newsletter', 'contact'] as const;

const Home = () => {
  const sections = usePageSections('home');
  const renderedSections = sections.length > 0
    ? sections
    : FALLBACK_SECTION_ORDER.map((section_key, order_index) => ({ page_key: 'home', section_key, order_index, enabled: true, content_pl: {}, content_en: {}, config: {}, updated_at: '' }));

  return (
    <div style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
      <PageSeo pageKey="home" />
      <div className="grid-background"></div>
      {renderedSections.map((section) => {
        const Component = SECTION_COMPONENTS[section.section_key as keyof typeof SECTION_COMPONENTS];
        return Component ? <Component key={section.section_key} /> : null;
      })}
    </div>
  );
};

export default Home;
