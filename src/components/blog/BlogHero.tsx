import { useEffect, useRef } from 'react';
import styles from './BlogHero.module.scss';
import SectionBadge from '@/components/ui/SectionBadge';
import { BookOpen } from 'lucide-react';
import logoHero from '@/assets/logo-hero.svg';
import arrowRight from '@/assets/arrow-right.svg';
import socialX from '@/assets/social-x.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';

import { useLanguageContext } from '@/hooks/useLanguage';

interface BlogHeroProps {
  badge?: string;
  title?: string;
  description?: string;
}

const BlogHero: React.FC<BlogHeroProps> = ({ badge, title, description }) => {
  const { t } = useLanguageContext();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const displayBadge = badge || t('blog.hero.badge');
  const displayTitle = title || t('blog.hero.title');
  const displayDescription = description || t('blog.hero.description');

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current || !videoRef.current) {
      return;
    }

    const videoEl = videoRef.current;
    const sectionEl = sectionRef.current;

    const handleVisibilityChange = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry) return;

      if (entry.isIntersecting) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    };

    let observer: IntersectionObserver | null = null;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleVisibilityChange, {
        threshold: 0.2,
      });
      observer.observe(sectionEl);
    }

    return () => {
      if (observer) {
        observer.unobserve(sectionEl);
      }
      videoEl.pause();
    };
  }, []);

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
    <section
      ref={sectionRef}
      className={styles.hero}
      aria-labelledby="blog-hero-title"
    >
      {/* Tło wideo */}
      <video
        ref={videoRef}
        className={styles.videoBg}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        onError={() => { }}
      >
        <source src="/navons.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} />

      {/* Zawartość */}
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoBadge}>
            <img className={styles.logoInner} src={logoHero} alt="VezVision logo" />
          </div>
        </div>

        {/* Standardized Badge */}
        <div className={styles.subtitleWrap}>
          <SectionBadge text={displayBadge} icon={<BookOpen className="w-3.5 h-3.5" />} />
        </div>

        {/* Nagłówek */}
        <h1 id="blog-hero-title" className={styles.title}>{displayTitle}</h1>

        {/* Opis */}
        <p className={styles.description}>{displayDescription}</p>

        {/* CTA */}
        <div className={styles.ctaWrap}>
          <button
            type="button"
            onClick={handleContactClick}
            className={styles.ctaBtn}
            aria-label={t('blog.hero.cta.aria')}
          >
            {t('blog.hero.cta.text')}
            <img src={arrowRight} width={20} height={20} alt="" aria-hidden="true" />
          </button>
        </div>

        {/* Ikony społecznościowe */}
        <div className={styles.socialRow} aria-label={t('portfolio.hero.social.aria')}>
          <img src={socialX} className={styles.socialIcon} alt={t('about.hero.social.xAlt')} />
          <div className={styles.divider} aria-hidden="true" />
          <img src={socialLinkedin} className={styles.socialIcon} alt={t('about.hero.social.linkedinAlt')} />
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
