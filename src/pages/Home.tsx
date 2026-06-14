import '../styles/GridBackground.css';
import Hero from '@/components/hero/Hero';
import FounderNote from '@/components/FounderNote';
import Benefits from '@/components/benefits/Benefits';
import Features from '@/components/features/Features';
import PotentialSection from '@/components/potential/PotentialSection';
import ProcessSection from '@/components/process/ProcessSection';
import AboutComparison from '@/components/about/AboutComparison';
import ProductsSection from '@/components/products/ProductsSection';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import ContactSection from '@/components/contact/ContactSection';
import { CmsPage } from '@/pagekit';

const HOME_SECTIONS = {
  hero: { Component: Hero, eager: true },
  founder_note: { Component: FounderNote, eager: true },
  benefits: { Component: Benefits, eager: true },
  features: { Component: Features, eager: true },
  potential: { Component: PotentialSection, eager: true },
  process: { Component: ProcessSection, eager: true },
  about_comparison: { Component: AboutComparison, eager: true },
  products_teaser: { Component: ProductsSection, eager: true },
  newsletter: { Component: NewsletterSection, eager: true },
  contact: { Component: ContactSection, eager: true },
} as const;

const HOME_FALLBACK = [
  'hero',
  'founder_note',
  'benefits',
  'features',
  'potential',
  'process',
  'about_comparison',
  'products_teaser',
  'newsletter',
  'contact',
] as const;

export default function Home() {
  return (
    <CmsPage
      pageKey="home"
      fallbackKeys={HOME_FALLBACK}
      sections={HOME_SECTIONS}
      shell={{ className: 'home-page' }}
    />
  );
}
