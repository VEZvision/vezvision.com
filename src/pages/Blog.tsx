import '../styles/GridBackground.css';
import { useHeroContactAction } from '@/hooks/useHeroContactAction';
import { BookOpen } from 'lucide-react';

import VideoHeroSection from '@/components/common/VideoHeroSection';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useSettings } from '@/hooks/useSettings';
import { StaticPage } from '@/pagekit';
import FacebookIcon from '@/assets/social-facebook';
import socialInstagram from '@/assets/products/social-instagram.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';
import FounderNote from '@/components/FounderNote';
import BlogArticlesWithData from '@/components/blog/BlogArticlesWithData';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import ContactSection from '@/components/contact/ContactSection';

function BlogHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const handleContactClick = useHeroContactAction();

  return (
    <VideoHeroSection
      title={<span className="block">{t('blog.hero.title')}</span>}
      subtitle={t('blog.hero.description')}
      buttonText={t('blog.hero.cta.text')}
      onButtonClick={handleContactClick}
      badge={t('blog.hero.badge')}
      icon={<BookOpen className="w-3.5 h-3.5" />}
      socialLinks={[
        ...(social?.facebook ? [{ href: social.facebook, icon: <FacebookIcon />, label: 'Facebook' }] : social?.x ? [{ href: social.x, icon: <FacebookIcon />, label: 'Facebook' }] : []),
        ...(social?.instagram ? [{ href: social.instagram, icon: <img src={socialInstagram} className="w-6 h-6" alt="" />, label: 'Instagram' }] : []),
        ...(social?.linkedin ? [{ href: social.linkedin, icon: <img src={socialLinkedin} className="w-6 h-6" alt="" />, label: 'LinkedIn' }] : []),
      ]}
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-white px-4 pt-[120px] pb-[80px]"
      contentClassName="max-w-[1024px]"
      ariaLabelledBy="blog-hero-title"
    />
  );
}

export default function Blog() {
  return (
    <StaticPage
      seoKey="blog"
      shell={{ style: { backgroundColor: 'transparent' } }}
      sections={[
        { key: 'hero', Component: BlogHero, eager: true },
        { key: 'founder', Component: FounderNote, props: { variant: 'blog' }, eager: true },
        { key: 'articles', Component: BlogArticlesWithData, eager: true },
        { key: 'newsletter', Component: NewsletterSection, eager: true },
        { key: 'contact', Component: ContactSection, eager: true },
      ]}
    />
  );
}
