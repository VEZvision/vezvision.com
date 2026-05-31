import { Fragment, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import styles from './Footer.module.css';
import twitterIcon from '../../assets/footer/twitter-icon.svg';
import instagramIcon from '../../assets/footer/instagram-icon.svg';
import linkedinIcon from '../../assets/footer/linkedin-icon.svg';
import logoIcon from '../../assets/footer/logo-icon.svg';
import arrowIcon from '../../assets/arrow-icon.svg';

import { useLanguageContext } from '../../hooks/useLanguage';

import { useSettings } from '../../hooks/useSettings';
import { useCookieConsent } from '../../hooks/useCookieConsent';

function getLocalizedLabel(language: 'pl' | 'en', labelPl: string, labelEn: string) {
  return language === 'en' ? (labelEn || labelPl) : labelPl
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')
}

const Footer = memo(() => {
  const footerRef = useRef<HTMLElement>(null);
  const { t, language } = useLanguageContext();
  const { social, identity, footer, navigation } = useSettings();
  const { actions } = useCookieConsent();
  const videoActive = useInView(footerRef, { once: true, amount: 0.1 });

  const socialLinks = [
    { href: social?.x || social?.facebook, icon: twitterIcon, alt: 'X (Twitter)', label: 'X' },
    { href: social?.instagram, icon: instagramIcon, alt: 'Instagram', label: 'Instagram' },
    { href: social?.linkedin, icon: linkedinIcon, alt: 'LinkedIn', label: 'LinkedIn' }
  ];

  const navLinks = (navigation?.items ?? []).filter((item) => item.enabled);
  const legalLinks = (footer?.legalLinks ?? []).filter((item) => item.enabled);
  const footerSubtitle = footer ? getLocalizedLabel(language, footer.subtitlePl, footer.subtitleEn) : t('footer.subtitle');
  const footerTagline = footer ? getLocalizedLabel(language, footer.taglinePl, footer.taglineEn) : t('footer.tagline');
  const footerCtaLabel = footer ? getLocalizedLabel(language, footer.ctaLabelPl, footer.ctaLabelEn) : t('footer.cta');
  const footerCtaHref = footer?.ctaHref || '/contact';
  const brandName = identity?.siteName || 'VezVision';

  return (
    <footer
      ref={footerRef}
      className={styles.footer}
      style={{
        opacity: videoActive ? 1 : 0,
        transform: videoActive ? 'translateY(0)' : 'translateY(100px)',
        transition: 'opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      <div className={styles.footerContainer}>
        <div className={styles.backgroundLayer}>
          {/* Video Background - lazy loaded */}
          <div className="absolute inset-0 z-0">
            {videoActive && (
              <video
                muted
                autoPlay
                loop
                playsInline
                preload="none"
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
                      <img src={icon} alt={alt} className={styles.socialIcon} />
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
                      <img src={logoIcon} alt="VezVision Logo" className={styles.logoImage} />
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
                    <img src={arrowIcon} alt="" className={styles.ctaIcon} aria-hidden="true" />
                  </a>
                ) : (
                  <Link to={footerCtaHref} className={styles.ctaButton}>
                    <span className={styles.ctaText}>{footerCtaLabel}</span>
                    <img src={arrowIcon} alt="" className={styles.ctaIcon} aria-hidden="true" />
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
