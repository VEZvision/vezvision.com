import { Fragment, memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoHero from '../../assets/logo-hero.svg';
import arrowRight from '../../assets/arrow-right.svg';

import socialX from '@/assets/social-x.svg';
import socialInstagram from '@/assets/products/social-instagram.svg';
import socialLinkedin from '@/assets/social-linkedin.svg';
import { useLanguageContext } from '../../hooks/useLanguage';
import SectionBadge from '@/components/ui/SectionBadge';
import logoText from '@/assets/logo-text-only.svg';
import { Sparkles } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { usePageSectionConfig } from '@/hooks/usePageSection';
import { safeCmsHref } from '@/utils/safeHref';
import styles from './Hero.module.scss';

const HERO_VIDEO_SRC = '/aMPvRVYHFQxBoB0v2qyJln83jI.mp4';

const Hero = memo(() => {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const sectionConfig = usePageSectionConfig('home', 'hero');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const playVideo = () => {
      void videoEl.play().catch(() => {});
    };

    videoEl.addEventListener('loadeddata', playVideo);
    if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playVideo();
    }

    if (!sectionEl || !('IntersectionObserver' in window)) {
      return () => {
        videoEl.removeEventListener('loadeddata', playVideo);
        videoEl.pause();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          playVideo();
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.05, rootMargin: '80px' },
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
      videoEl.removeEventListener('loadeddata', playVideo);
      videoEl.pause();
    };
  }, []);

  const socialLinks = [
    { href: social?.x || social?.facebook, icon: socialX, label: 'X (Twitter)' },
    { href: social?.instagram, icon: socialInstagram, label: 'Instagram' },
    { href: social?.linkedin, icon: socialLinkedin, label: 'LinkedIn' }
  ];
  const primaryHref = safeCmsHref(sectionConfig.primaryHref, '/contact');
  const secondaryHref = safeCmsHref(sectionConfig.secondaryHref, '/services');

  return (
    <section ref={sectionRef} className={styles.sectionHero}>
      <video
        ref={videoRef}
        className={styles.videoBg}
        src={HERO_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      <div className={styles.videoOverlay} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div
              className="w-[80px] h-[80px] sm:w-24 sm:h-24 rounded-[16px] bg-[#04070d] p-[10px]"
              style={{
                boxShadow: `
                  0px 1px 1px -1px rgba(64, 120, 168, 0.37),
                  0px 2px 2px -1px rgba(64, 120, 168, 0.36),
                  0px 4px 4px -2px rgba(64, 120, 168, 0.34),
                  0px 7px 7px -3px rgba(64, 120, 168, 0.31),
                  0px 14px 14px -3px rgba(64, 120, 168, 0.25),
                  0px 30px 30px -4px rgba(64, 120, 168, 0.15)
                `
              }}
            >
              <img src={logoHero} alt="VezVision Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center gap-[10px] bg-[#f3f4f6] border border-[#e5e7eb] rounded-full px-[12px] py-[8px]">
              <SectionBadge text={t('hero.badge')} icon={<Sparkles className="w-3.5 h-3.5" />} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <img src={logoText} alt="VezVision" className="h-[clamp(38px,6.5vw,80px)] w-auto" aria-hidden="true" />
          </div>

          {/* Main heading for SEO & accessibility */}
          <h1 className="text-[20px] sm:text-[24px] leading-[30px] sm:leading-[34px] tracking-[-0.36px] text-[#020617] font-semibold mb-6 max-w-[936px] mx-auto">
            {t('hero.subtitle')}
          </h1>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={primaryHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#04070d] text-white font-semibold text-[16px] px-5 py-3 transition-transform hover:-translate-y-0.5"
            >
              {t('hero.cta.consult')}
              <img src={arrowRight} className="w-5 h-5" alt="" aria-hidden="true" />
            </Link>
            <Link
              to={secondaryHref}
              className="inline-flex items-center justify-center rounded-lg bg-[#f5f5f5] text-black font-medium text-[14px] px-6 py-[11px] shadow-[inset_0px_3px_1px_0px_#ffffff,0px_1px_1px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-0.5"
            >
              {t('hero.cta.services')}
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {socialLinks.map(({ href, icon, label }, index) => (
              <Fragment key={label}>
                {href ? (
                  <a
                    href={href}
                    className="w-6 h-6 inline-flex items-center justify-center opacity-80 hover:opacity-100"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={icon} className="w-6 h-6" alt="" aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className="w-6 h-6 inline-flex items-center justify-center opacity-40"
                    aria-hidden="true"
                  >
                    <img src={icon} className="w-6 h-6" alt="" />
                  </span>
                )}
                {index < socialLinks.length - 1 && (
                  <div className="w-0.5 h-6 bg-[#0a0a0a]" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;
