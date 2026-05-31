import '../styles/GridBackground.css';
import PageSeo from '@/components/seo/PageSeo';
import VideoHeroSection from '@/components/common/VideoHeroSection';
import BlogFounderNote from '@/components/blog/BlogFounderNote';
import BlogArticlesWithData from '@/components/blog/BlogArticlesWithData';
import { ContactSection } from '@/components/contact';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import Footer from '@/components/footer/Footer';
import { useLanguageContext } from '@/hooks/useLanguage';
import { BookOpen } from 'lucide-react';
import socialX from '@/assets/social-x.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';

const BlogHeroWrapper = () => {
  const { t } = useLanguageContext();

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
      title={<span className="block">{t('blog.hero.title')}</span>}
      subtitle={t('blog.hero.description')}
      buttonText={t('blog.hero.cta.text')}
      onButtonClick={handleContactClick}
      badge={t('blog.hero.badge')}
      icon={<BookOpen className="w-3.5 h-3.5" />}
      socialLinks={[
        { icon: socialX, label: 'X (Twitter)' },
        { icon: socialLinkedin, label: 'LinkedIn' },
      ]}
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-white px-4 pt-[120px] pb-[80px]"
      contentClassName="max-w-[1024px]"
      ariaLabelledBy="blog-hero-title"
    />
  );
};

const Blog = () => {
  return (
    <div style={{ backgroundColor: 'transparent' }}>
      <PageSeo pageKey="blog" />
      <div className="grid-background"></div>
      <BlogHeroWrapper />
      <BlogFounderNote />
      <BlogArticlesWithData />
      <NewsletterSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Blog;
