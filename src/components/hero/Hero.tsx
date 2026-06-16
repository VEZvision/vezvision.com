import { Fragment, memo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import logoHero from '../../assets/logo-hero.svg';

import FacebookIcon from '@/assets/social-facebook';
import socialInstagram from '@/assets/products/social-instagram.svg';
import LinkedInIcon from '@/assets/social-linkedin';
import { useLanguageContext } from '../../hooks/useLanguage';
import { usePrefersReducedData } from '@/hooks/usePrefersReducedData';
import SectionBadge from '@/components/ui/SectionBadge';
import { Sparkles } from 'lucide-react';
import { useSocial } from '@/hooks/useSettings';
import { usePageSectionConfig } from '@/hooks/usePageSection';
import { safeCmsHref } from '@/utils/safeHref';
import { localizeInternalHref } from '@/routing/locale';
import styles from './Hero.module.scss';

const HERO_VIDEO_SRC = '/aMPvRVYHFQxBoB0v2qyJln83jI.mp4';

const Hero = memo(() => {
  const { t, language } = useLanguageContext();
  const social = useSocial();
  const sectionConfig = usePageSectionConfig('home', 'hero');
  const prefersReducedData = usePrefersReducedData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    if (!videoEl || prefersReducedData) return;

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
  }, [prefersReducedData]);

  const socialLinks = [
    { href: social?.facebook || social?.x, icon: <FacebookIcon /> as React.ReactNode, label: 'Facebook' },
    { href: social?.instagram, icon: <img src={socialInstagram} className="w-6 h-6" alt="" loading="lazy" decoding="async" /> as React.ReactNode, label: 'Instagram' },
    { href: social?.linkedin, icon: <LinkedInIcon /> as React.ReactNode, label: 'LinkedIn' }
  ];
  const primaryHref = localizeInternalHref(safeCmsHref(sectionConfig.primaryHref, '/contact'), language);
  const secondaryHref = localizeInternalHref(safeCmsHref(sectionConfig.secondaryHref, '/services'), language);

  return (
    <section ref={sectionRef} className={styles.sectionHero}>
      <Helmet>
        <link rel="preload" as="image" href={logoHero} fetchPriority="high" />
      </Helmet>
      {!prefersReducedData && (
        <video
          ref={videoRef}
          className={styles.videoBg}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          disableRemotePlayback
          x-webkit-airplay="deny"
        >
          <source src="/aMPvRVYHFQxBoB0v2qyJln83jI.webm" type="video/webm" />
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <div className={styles.videoOverlay} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className={styles.logoPlate}>
              <img src={logoHero} alt="VezVision Logo" className="w-full h-full object-cover rounded-full" width="80" height="80" fetchPriority="high" />
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
            <span className="font-sans text-[clamp(38px,6.5vw,80px)] font-normal leading-[1.05] tracking-[-1.6px] text-black">
              <span className="font-medium">VEZ</span><span className="font-light">vision</span>
            </span>
          </div>

          {/* Main heading for SEO & accessibility */}
          <h1 className="text-[20px] sm:text-[24px] leading-[30px] sm:leading-[34px] tracking-[-0.36px] text-[#020617] font-semibold mb-6 max-w-[936px] mx-auto">
            {t('hero.subtitle')}
          </h1>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={primaryHref}
              className="inline-flex items-center rounded-lg bg-[#04070d] text-white font-semibold text-[16px] px-5 py-3 transition-transform hover:-translate-y-0.5"
            >
              {t('hero.cta.consult')}
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
                    {icon}
                  </a>
                ) : (
                  <span
                    className="w-6 h-6 inline-flex items-center justify-center opacity-40"
                    aria-hidden="true"
                  >
                    {icon}
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
