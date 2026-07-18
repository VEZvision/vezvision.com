import { useRef } from "react";
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguageContext } from "@/hooks/useLanguage";
import {
  useSocial,
  useNavigation,
  useIdentity,
  useFooter,
  useSettings,
} from "@/hooks/useSettings";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { usePrefersReducedData } from "@/hooks/usePrefersReducedData";
import { useBackgroundVideoSection } from "@/hooks/useBackgroundVideoSection";
import { isSafeExternalHref, safePublicHref } from "@/utils/safeHref";
import { localizeInternalHref } from "@/routing/locale";
import { getLocalizedLabel } from "@/utils/i18n";
import { FooterSocial } from "./FooterSocial";
import twitterIcon from "@/assets/footer/twitter-icon.svg";
import instagramIcon from "@/assets/footer/instagram-icon.svg";
import linkedinIcon from "@/assets/footer/linkedin-icon.svg";
import arrowIcon from "@/assets/arrow-icon.svg";
import logoNavbar from "@brand/wordmark-horizontal-dark.svg";
import styles from "./Footer.module.css";

function isExternal(href: string) {
  return isSafeExternalHref(href);
}

function normalizeFooterCopy(value: string): string {
  return value
    .replace(/\s+[—–]\s+/g, " - ")
    .replace(/[—–]/g, "-")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default function Footer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const { t, language } = useLanguageContext();
  const social = useSocial();
  const identity = useIdentity();
  const footer = useFooter();
  const { contact } = useSettings();
  const navigation = useNavigation();
  const { actions } = useCookieConsent();
  const location = useLocation();
  const prefersReducedData = usePrefersReducedData();

  const pathWithoutLocale = location.pathname.replace(/^\/(en|pl)(?=\/|$)/, "");
  const isHome = pathWithoutLocale === "" || pathWithoutLocale === "/";
  const videoSrc = isHome
    ? "/hero-bg.mp4?v=65de2eb"
    : "/footer-bg.mp4?v=65de2eb";
  const videoWebmSrc = isHome ? "/hero-bg.webm" : "/footer-bg.webm";
  const videoPosterSrc = isHome ? "/hero-poster.avif" : "/footer-poster.avif";
  const showVideo = !prefersReducedData;

  useBackgroundVideoSection({
    enabled: showVideo,
    sectionRef: footerRef,
    videoRef,
    threshold: 0,
    rootMargin: "120px",
    reloadKey: videoSrc,
  });

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

  const fallbackNavLinks = [
    {
      id: "about",
      href: "/about",
      labelPl: "O nas",
      labelEn: "About",
      enabled: true,
    },
    {
      id: "services",
      href: "/services",
      labelPl: "Usługi",
      labelEn: "Services",
      enabled: true,
    },
    {
      id: "portfolio",
      href: "/portfolio",
      labelPl: "Portfolio",
      labelEn: "Portfolio",
      enabled: true,
    },
    {
      id: "blog",
      href: "/blog",
      labelPl: "Blog",
      labelEn: "Blog",
      enabled: true,
    },
    {
      id: "products",
      href: "/products",
      labelPl: "Produkty",
      labelEn: "Products",
      enabled: true,
    },
  ];
  const fallbackLegalLinks = [
    {
      id: "privacy-policy",
      href: "/privacy-policy",
      labelPl: "Polityka prywatności",
      labelEn: "Privacy Policy",
      enabled: true,
    },
    {
      id: "terms",
      href: "/terms",
      labelPl: "Regulamin",
      labelEn: "Terms",
      enabled: true,
    },
    {
      id: "cookie-policy",
      href: "/cookie-policy",
      labelPl: "Cookies",
      labelEn: "Cookies",
      enabled: true,
    },
  ];

  const navSource = navigation?.items?.some((item) => item.enabled)
    ? navigation.items
    : fallbackNavLinks;
  const legalSource = footer?.legalLinks?.some((item) => item.enabled)
    ? footer.legalLinks
    : fallbackLegalLinks;

  const navLinks = navSource
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

  const legalLinks = legalSource
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
    ? normalizeFooterCopy(
        getLocalizedLabel(language, footer.subtitlePl, footer.subtitleEn),
      )
    : t("footer.subtitle");
  const footerTagline = footer
    ? normalizeFooterCopy(
        getLocalizedLabel(language, footer.taglinePl, footer.taglineEn),
      )
    : t("footer.tagline");
  const footerCtaLabel = footer
    ? getLocalizedLabel(language, footer.ctaLabelPl, footer.ctaLabelEn)
    : t("footer.cta");
  const footerCtaHref = localizeInternalHref(
    safePublicHref(footer?.ctaHref, "/contact") || "/contact",
    language,
  );
  const brandName = identity?.siteName || "VEZvision";
  const footerStatement =
    language === "en"
      ? "Digital clarity for growing teams."
      : "Porządkujemy cyfrowy rozwój.";
  const footerEyebrow =
    language === "en"
      ? "Strategy · design · technology"
      : "Strategia · design · technologia";
  const navTitle = language === "en" ? "Explore" : "Nawigacja";
  const contactTitle = language === "en" ? "Contact" : "Kontakt";
  const socialTitle = language === "en" ? "Follow" : "Social";
  const socialDescription =
    language === "en"
      ? "Selected updates from the studio and the products we build."
      : "Wybrane aktualności ze studia i produktów, które rozwijamy.";
  const email = contact?.email || "contact@vezvision.com";
  const phone = contact?.phone || "+48 572 711 535";
  const normalizedPhone = phone.replace(/[^\d+]/g, "");

  const renderLink = (
    item: (typeof navLinks)[number] | (typeof legalLinks)[number],
    className: string,
  ) =>
    isExternal(item.href) ? (
      <a
        key={item.id}
        href={item.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {getLocalizedLabel(language, item.labelPl, item.labelEn)}
      </a>
    ) : (
      <Link key={item.id} to={item.href} className={className}>
        {getLocalizedLabel(language, item.labelPl, item.labelEn)}
      </Link>
    );

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.backgroundLayer}>
        <div className={styles.videoBackdrop}>
          {showVideo && (
            <video
              ref={videoRef}
              width="3840"
              height="2160"
              muted
              loop
              playsInline
              preload={isHome ? "none" : "metadata"}
              poster={videoPosterSrc}
              aria-hidden="true"
              tabIndex={-1}
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
          <div className={styles.topLine} />

          <div className={styles.footerGrid}>
            <section className={styles.brandColumn} aria-label={brandName}>
              <img
                src={logoNavbar}
                alt="VEZvision"
                width="838"
                height="153"
                className={styles.logoImage}
                decoding="async"
              />
              <p className={styles.eyebrow}>{footerEyebrow}</p>
              <h2 className={styles.statement}>{footerStatement}</h2>
              <p className={styles.subtitle}>{footerSubtitle}</p>
              <p className={styles.tagline}>{footerTagline}</p>
            </section>

            <nav className={styles.linkColumn} aria-label={navTitle}>
              <p className={styles.columnTitle}>{navTitle}</p>
              <div className={styles.linkStack}>
                {navLinks.map((item) => renderLink(item, styles.navLink))}
              </div>
            </nav>

            <section className={styles.contactColumn}>
              <p className={styles.columnTitle}>{contactTitle}</p>
              <div className={styles.linkStack}>
                <a className={styles.navLink} href={`mailto:${email}`}>
                  {email}
                </a>
                <a className={styles.navLink} href={`tel:${normalizedPhone}`}>
                  {phone}
                </a>
                {isExternal(footerCtaHref) ? (
                  <a
                    href={footerCtaHref}
                    className={styles.ctaButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{footerCtaLabel}</span>
                    <img
                      src={arrowIcon}
                      alt=""
                      width="20"
                      height="20"
                      className={styles.ctaIcon}
                      aria-hidden="true"
                      decoding="async"
                    />
                  </a>
                ) : (
                  <Link to={footerCtaHref} className={styles.ctaButton}>
                    <span>{footerCtaLabel}</span>
                    <img
                      src={arrowIcon}
                      alt=""
                      width="20"
                      height="20"
                      className={styles.ctaIcon}
                      aria-hidden="true"
                      decoding="async"
                    />
                  </Link>
                )}
              </div>
            </section>

            <section className={styles.socialColumn}>
              <p className={styles.columnTitle}>{socialTitle}</p>
              <p className={styles.socialDescription}>{socialDescription}</p>
              <FooterSocial links={socialLinks} />
            </section>
          </div>

          <div className={styles.bottomBar}>
            <div className={styles.legalLinks}>
              {legalLinks.map((item, index) => (
                <Fragment key={item.id}>
                  {renderLink(item, styles.legalLink)}
                  {index < legalLinks.length - 1 && (
                    <span className={styles.legalDivider}>/</span>
                  )}
                </Fragment>
              ))}
              {legalLinks.length > 0 && (
                <span className={styles.legalDivider}>/</span>
              )}
              <button
                type="button"
                onClick={actions.showPrivacyCenterModal}
                className={styles.legalLink}
              >
                {language === "en"
                  ? "Privacy settings"
                  : "Ustawienia prywatności"}
              </button>
            </div>

            <p className={styles.copyrightText}>
              <span>
                {brandName} © {new Date().getFullYear()}.
              </span>{" "}
              <span>
                {language === "en" ? "A " : "Marka "}
                <a
                  href="https://vezhq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VEZ
                </a>
                {language === "en" ? " brand." : "."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
