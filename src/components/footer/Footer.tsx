import { Fragment, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './Footer.module.css';
import twitterIcon from '../../assets/footer/twitter-icon.svg';
import instagramIcon from '../../assets/footer/instagram-icon.svg';
import linkedinIcon from '../../assets/footer/linkedin-icon.svg';
import logoIcon from '../../assets/footer/logo-icon.svg';
import arrowIcon from '../../assets/arrow-icon.svg';

import { useLanguageContext } from '../../hooks/useLanguage';

import { useSettings } from '../../hooks/useSettings';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { isSafeExternalHref, safePublicHref } from '@/utils/safeHref';

function getLocalizedLabel(language: 'pl' | 'en', labelPl: string, labelEn: string) {
  return language === 'en' ? (labelEn || labelPl) : labelPl
}

function isExternalHref(href: string) {
  return isSafeExternalHref(href)
}

const Footer = memo(() => {
  const footerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, language } = useLanguageContext();
  const { social, identity, footer, navigation } = useSettings();
  const { actions } = useCookieConsent();
  const reducedMotion = useReducedMotion();

  // The video is always mounted (so it decodes well before the user reaches the
  // footer — no mount/decode hitch on arrival). Playback is started/stopped via
  // IntersectionObserver with a head-start margin and paused when off-screen to
  // save CPU. No colour/filter changes here.
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    let isNear = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNear = Boolean(entry?.isIntersecting);
        if (isNear) {
          void videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { rootMargin: '700px 0px', threshold: 0 },
    );

    observer.observe(videoEl);

    // Prime the decoder while the browser is idle so the first play() as the
    // user nears the footer doesn't trigger a first-frame decode that blocks
    // the main thread mid-scroll (measured ~230ms cold hitch otherwise).
    const warmUp = () => {
      if (isNear) return;
      videoEl
        .play()
        .then(() => {
          if (!isNear) videoEl.pause();
        })
        .catch(() => {});
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const warmId = win.requestIdleCallback
      ? win.requestIdleCallback(warmUp, { timeout: 3000 })
      : window.setTimeout(warmUp, 2500);

    return () => {
      observer.disconnect();
      if (win.cancelIdleCallback) win.cancelIdleCallback(warmId as number);
      else window.clearTimeout(warmId as number);
    };
  }, []);

  const socialLinks = [
    { href: social?.x || social?.facebook, icon: twitterIcon, alt: 'X (Twitter)', label: 'X' },
    { href: social?.instagram, icon: instagramIcon, alt: 'Instagram', label: 'Instagram' },
    { href: social?.linkedin, icon: linkedinIcon, alt: 'LinkedIn', label: 'LinkedIn' }
  ];

  const navLinks = (navigation?.items ?? []).filter((item) => item.enabled).map((item) => ({ ...item, href: safePublicHref(item.href) })).filter((item) => item.href);
  const legalLinks = (footer?.legalLinks ?? []).filter((item) => item.enabled).map((item) => ({ ...item, href: safePublicHref(item.href) })).filter((item) => item.href);
  const footerSubtitle = footer ? getLocalizedLabel(language, footer.subtitlePl, footer.subtitleEn) : t('footer.subtitle');
  const footerTagline = footer ? getLocalizedLabel(language, footer.taglinePl, footer.taglineEn) : t('footer.tagline');
  const footerCtaLabel = footer ? getLocalizedLabel(language, footer.ctaLabelPl, footer.ctaLabelEn) : t('footer.cta');
  const footerCtaHref = safePublicHref(footer?.ctaHref, '/contact') || '/contact';
  const brandName = identity?.siteName || 'VezVision';

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.backgroundLayer}>
          {/* Video Background — always mounted, playback gated by IO */}
          <div className="absolute inset-0 z-0">
            {!reducedMotion && (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="w-full h-full object-cover filter grayscale brightness-200"
              >
                <source src="/aMPvRVYHFQxBoB0v2qyJln83jI.mp4" type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 bg-white opacity-95" />
            {/* Gradient overlay for smooth transition */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white/20 z-10" />
          </div>
          <div className={styles.contentWrapper}>
            {/* Social Media Icons */}
            <div className={styles.socialsSection}>
              <div className={styles.socialLinks}>
                {socialLinks.map(({ href, icon, alt, label }) => (
                  <a
                    key={label}
                    href={href || '#'}
                    className={`${styles.socialLink} ${!href ? 'opacity-50 pointer-events-none' : ''}`}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className={styles.socialIconContainer}>
                      <img src={icon} alt={alt} className={styles.socialIcon} loading="lazy" decoding="async" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
              <div className={styles.textContent}>
                <p className={styles.subtitle}>
                  {footerSubtitle}
                </p>

                <div className={styles.logoSection}>
                  <div className={styles.logoContainer}>
                    <div className={styles.logoWrapper}>
                      <img src={logoIcon} alt="VezVision Logo" className={styles.logoImage} loading="lazy" decoding="async" />
                    </div>
                    <p className={styles.logoText}>{brandName.toUpperCase()}</p>
                  </div>
                  <p className={styles.tagline}>
                    {footerTagline}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className={styles.ctaSection}>
                {isExternalHref(footerCtaHref) ? (
                  <a href={footerCtaHref} className={styles.ctaButton} target="_blank" rel="noopener noreferrer">
                    <span className={styles.ctaText}>{footerCtaLabel}</span>
                    <img src={arrowIcon} alt="" className={styles.ctaIcon} aria-hidden="true" loading="lazy" decoding="async" />
                  </a>
                ) : (
                  <Link to={footerCtaHref} className={styles.ctaButton}>
                    <span className={styles.ctaText}>{footerCtaLabel}</span>
                    <img src={arrowIcon} alt="" className={styles.ctaIcon} aria-hidden="true" loading="lazy" decoding="async" />
                  </Link>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <nav className={styles.footerNav}>
              <div className={styles.navLinks}>
                {navLinks.map((item) => (
                  isExternalHref(item.href) ? (
                    <a key={item.id} href={item.href} className={styles.navLink} target="_blank" rel="noopener noreferrer">
                      {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                    </a>
                  ) : (
                    <Link key={item.id} to={item.href} className={styles.navLink}>
                      {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                    </Link>
                  )
                ))}
              </div>

              {/* Legal Links */}
              <div className={styles.legalLinks}>
                {legalLinks.map((item, index) => (
                  <Fragment key={item.id}>
                    {isExternalHref(item.href) ? (
                      <a href={item.href} className={styles.legalLink} target="_blank" rel="noopener noreferrer">
                        {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                      </a>
                    ) : (
                      <Link to={item.href} className={styles.legalLink}>
                        {getLocalizedLabel(language, item.labelPl, item.labelEn)}
                      </Link>
                    )}
                    {index < legalLinks.length - 1 && <span className={styles.legalDivider}>•</span>}
                  </Fragment>
                ))}
                {legalLinks.length > 0 && <span className={styles.legalDivider}>•</span>}
                <button
                  type="button"
                  onClick={actions.showPrivacyCenterModal}
                  className={styles.legalLink}
                >
                  {language === 'en' ? 'Privacy Settings' : 'Ustawienia prywatności'}
                </button>
              </div>

              <div className={styles.copyright}>
                <p className={styles.copyrightText}>{brandName} © {new Date().getFullYear()}.</p>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
