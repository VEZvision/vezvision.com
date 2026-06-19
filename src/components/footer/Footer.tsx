import { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguageContext } from "@/hooks/useLanguage";
import {
  useSocial,
  useNavigation,
  useIdentity,
  useFooter,
} from "@/hooks/useSettings";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { usePrefersReducedData } from "@/hooks/usePrefersReducedData";
import { isSafeExternalHref, safePublicHref } from "@/utils/safeHref";
import { localizeInternalHref } from "@/routing/locale";
import { getLocalizedLabel } from "@/utils/i18n";
import { FooterSocial } from "./FooterSocial";
import { FooterNavLegal } from "./FooterNavLegal";
import twitterIcon from "@/assets/footer/twitter-icon.svg";
import instagramIcon from "@/assets/footer/instagram-icon.svg";
import linkedinIcon from "@/assets/footer/linkedin-icon.svg";
import arrowIcon from "@/assets/arrow-icon.svg";
import logoNavbar from "@/assets/logo-navbar.svg";
import styles from "./Footer.module.css";

function isExternal(href: string) {
  return isSafeExternalHref(href);
}

export default function Footer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const { t, language } = useLanguageContext();
  const social = useSocial();
  const identity = useIdentity();
  const footer = useFooter();
  const navigation = useNavigation();
  const { actions } = useCookieConsent();
  const location = useLocation();
  const prefersReducedData = usePrefersReducedData();

  const pathWithoutLocale = location.pathname.replace(/^\/(en|pl)(?=\/|$)/, "");
  const isHome = pathWithoutLocale === "" || pathWithoutLocale === "/";
  const videoSrc = isHome ? "/aMPvRVYHFQxBoB0v2qyJln83jI.mp4" : "/navons.mp4";
  const videoWebmSrc = isHome
    ? "/aMPvRVYHFQxBoB0v2qyJln83jI.webm"
    : "/navons.webm";
  const showVideo = !prefersReducedData;

  useEffect(() => {
    const videoEl = videoRef.current;
    const footerEl = footerRef.current;
    if (!videoEl || !showVideo) return;

    const playVideo = () => {
      videoEl.play().catch(() => {});
    };
    const pauseVideo = () => {
      videoEl.pause();
    };

    if (!footerEl || !("IntersectionObserver" in window)) {
      playVideo();
      return () => {
        pauseVideo();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          playVideo();
        } else {
          pauseVideo();
        }
      },
      { threshold: 0, rootMargin: "120px" },
    );

    observer.observe(footerEl);
    return () => {
      observer.disconnect();
      pauseVideo();
    };
  }, [videoSrc, showVideo]);

  const socialLinks = [
    social?.x
      ? {
          href: social.x,
          icon: twitterIcon,
          alt: "X (Twitter)",
          label: "X",
          rel: "me noopener noreferrer",
        }
      : null,
    social?.instagram
      ? {
          href: social.instagram,
          icon: instagramIcon,
          alt: "Instagram",
          label: "Instagram",
          rel: "me noopener noreferrer",
        }
      : null,
    social?.linkedin
      ? {
          href: social.linkedin,
          icon: linkedinIcon,
          alt: "LinkedIn",
          label: "LinkedIn",
          rel: "me noopener noreferrer",
        }
      : null,
  ].filter((l): l is NonNullable<typeof l> => l !== null);

  const navLinks = (navigation?.items ?? [])
    .filter((item) => item.enabled)
    .map((item) => {
      const href = safePublicHref(item.href);
      return href
        ? {
            ...item,
            href: isSafeExternalHref(href)
              ? href
              : localizeInternalHref(href, language),
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.href));

  const legalLinks = (footer?.legalLinks ?? [])
    .filter((item) => item.enabled)
    .map((item) => {
      const href = safePublicHref(item.href);
      return href
        ? {
            ...item,
            href: isSafeExternalHref(href)
              ? href
              : localizeInternalHref(href, language),
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.href));

  const footerSubtitle = footer
    ? getLocalizedLabel(language, footer.subtitlePl, footer.subtitleEn)
    : t("footer.subtitle");
  const footerTagline = footer
    ? getLocalizedLabel(language, footer.taglinePl, footer.taglineEn)
    : t("footer.tagline");
  const footerCtaLabel = footer
    ? getLocalizedLabel(language, footer.ctaLabelPl, footer.ctaLabelEn)
    : t("footer.cta");
  const footerCtaHref = localizeInternalHref(
    safePublicHref(footer?.ctaHref, "/contact") || "/contact",
    language,
  );
  const brandName = identity?.siteName || "VezVision";

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.backgroundLayer}>
          <div className={styles.videoBackdrop}>
            {showVideo && (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                data-lenis-prevent
                className={styles.footerVideo}
                disableRemotePlayback
                x-webkit-airplay="deny"
              >
                <source src={videoWebmSrc} type="video/webm" />
                <source src={videoSrc} type="video/mp4" />
              </video>
            )}
            <div className={styles.videoOverlay} />
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.socialsSection}>
              <FooterSocial links={socialLinks} />
            </div>

            <div className={styles.mainContent}>
              <div className={styles.textContent}>
                <p className={styles.subtitle}>{footerSubtitle}</p>
                <div className={styles.logoSection}>
                  <div className={styles.logoContainer}>
                    <img
                      src={logoNavbar}
                      alt="VezVision"
                      className={styles.logoImage}
                      decoding="async"
                    />
                  </div>
                  <p className={styles.tagline}>{footerTagline}</p>
                </div>
              </div>

              <div className={styles.ctaSection}>
                {isExternal(footerCtaHref) ? (
                  <a
                    href={footerCtaHref}
                    className={styles.ctaButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={styles.ctaText}>{footerCtaLabel}</span>
                    <img
                      src={arrowIcon}
                      alt=""
                      className={styles.ctaIcon}
                      aria-hidden="true"
                      decoding="async"
                    />
                  </a>
                ) : (
                  <Link to={footerCtaHref} className={styles.ctaButton}>
                    <span className={styles.ctaText}>{footerCtaLabel}</span>
                    <img
                      src={arrowIcon}
                      alt=""
                      className={styles.ctaIcon}
                      aria-hidden="true"
                      decoding="async"
                    />
                  </Link>
                )}
              </div>
            </div>

            <div className={styles.footerNav}>
              <FooterNavLegal
                navLinks={navLinks}
                legalLinks={legalLinks}
                language={language}
                onPrivacySettings={actions.showPrivacyCenterModal}
                brandName={brandName}
                isExternal={isExternal}
                linkClass={styles.navLink}
                legalLinkClass={styles.legalLink}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
