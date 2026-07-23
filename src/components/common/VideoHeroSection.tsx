import type { FC, ReactNode } from "react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { useLanguageContext } from "@/hooks/useLanguage";
import { usePrefersReducedData } from "@/hooks/usePrefersReducedData";
import { CrossfadeLoopVideo } from "@/components/common/CrossfadeLoopVideo";
import logoNavbar from "@brand/wordmark-horizontal-dark.svg";
import { safeExternalHref, safePublicHref } from "@/utils/safeHref";
import { scrollToElement } from "@/scroll";
import { versionBackgroundMedia } from "@/config/backgroundMedia";
import styles from "./VideoHeroSection.module.css";

const DEFAULT_VIDEO_MP4 = versionBackgroundMedia("/footer-bg.mp4");
const DEFAULT_VIDEO_WEBM = versionBackgroundMedia("/footer-bg.webm");
const DEFAULT_VIDEO_POSTER = "/footer-poster.avif";

export interface SocialLink {
  href: string | undefined;
  icon: ReactNode;
  label: string;
}

interface VideoHeroSectionProps {
  title: ReactNode;
  subtitle?: string;
  buttonText: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  onSecondaryButtonClick?: () => void;
  socialLinks?: SocialLink[];
  badge?: string;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  ariaLabelledBy?: string;
  variant?: "page" | "home";
  videoMp4Src?: string;
  videoWebmSrc?: string;
  videoPosterSrc?: string;
  brandPriority?: boolean;
}

const VideoHeroSection: FC<VideoHeroSectionProps> = ({
  title,
  subtitle,
  buttonText,
  buttonHref,
  onButtonClick,
  secondaryButtonText,
  secondaryButtonHref,
  onSecondaryButtonClick,
  socialLinks,
  badge,
  icon,
  className,
  contentClassName,
  ariaLabelledBy,
  variant = "page",
  videoMp4Src = DEFAULT_VIDEO_MP4,
  videoWebmSrc = DEFAULT_VIDEO_WEBM,
  videoPosterSrc = DEFAULT_VIDEO_POSTER,
  brandPriority = false,
}) => {
  const navigate = useNavigate();
  const { toLocalizedPath } = useLocalizedPath();
  const { t } = useLanguageContext();
  const prefersReducedData = usePrefersReducedData();
  const sectionRef = useRef<HTMLElement | null>(null);
  const showVideo = !prefersReducedData;

  const runAction = (href?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
      return;
    }

    const safeHref = safePublicHref(href);
    if (!safeHref) return;

    if (safeHref.startsWith("#")) {
      const target = document.getElementById(safeHref.slice(1));
      if (target) {
        scrollToElement(target, { offset: -96, behavior: "smooth" });
        return;
      }
    }

    if (safeHref.startsWith("/")) {
      const normalizedPath = safeHref
        .replace(/^\/(?:pl|en)(?=\/|$)/, "")
        .replace(/^\//, "");
      void navigate(toLocalizedPath(normalizedPath));
    } else if (safeHref.startsWith("#")) {
      void navigate(safeHref);
    } else {
      window.location.assign(safeHref);
    }
  };

  const sectionClasses = [
    styles.hero,
    variant === "home" ? styles.homeHero : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  const contentClasses = [styles.content, contentClassName ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Helmet>
        <link
          rel="preload"
          as="image"
          href={videoPosterSrc}
          type="image/avif"
          fetchPriority="high"
        />
      </Helmet>

      <section
        ref={sectionRef}
        className={sectionClasses}
        aria-labelledby={ariaLabelledBy}
        data-hero-variant={variant}
      >
        <div className={styles.media} aria-hidden="true">
          {showVideo ? (
            <CrossfadeLoopVideo
              mp4Src={videoMp4Src}
              webmSrc={videoWebmSrc}
              posterSrc={videoPosterSrc}
              videoClassName={styles.videoBg}
              aria-hidden="true"
            />
          ) : (
            <div className={styles.fallbackBg} />
          )}
          <div className={styles.videoOverlay} />
        </div>

        <div className={styles.frame} aria-hidden="true" />

        <div className={contentClasses}>
          <div className={styles.brandRow}>
            <img
              src={logoNavbar}
              alt="VEZvision"
              width="838"
              height="153"
              className={styles.logo}
              loading="eager"
              fetchPriority={brandPriority ? "high" : "auto"}
            />

            {badge && (
              <div className={styles.badge}>
                {icon && <span className={styles.badgeIcon}>{icon}</span>}
                <span>{badge}</span>
              </div>
            )}
          </div>

          <h1
            id={ariaLabelledBy}
            className={styles.title}
            aria-label={typeof title === "string" ? title : undefined}
          >
            {title}
          </h1>

          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => runAction(buttonHref, onButtonClick)}
              className={styles.primaryButton}
            >
              <span>{buttonText}</span>
              <ArrowUpRight aria-hidden="true" />
            </button>

            {secondaryButtonText && (
              <button
                type="button"
                onClick={() =>
                  runAction(secondaryButtonHref, onSecondaryButtonClick)
                }
                className={styles.secondaryButton}
              >
                {secondaryButtonText}
              </button>
            )}
          </div>

          {socialLinks && socialLinks.length > 0 && (
            <div
              className={styles.socialRail}
              aria-label={t("hero.social.aria")}
            >
              <span className={styles.socialLabel}>
                {t("hero.social.label")}
              </span>
              <div className={styles.socialLinks}>
                {socialLinks.map((item) => {
                  const href = safeExternalHref(item.href);
                  return href ? (
                    <a
                      key={item.label}
                      href={href}
                      className={styles.socialLink}
                      aria-label={item.label}
                      target="_blank"
                      rel="me noopener noreferrer"
                    >
                      {item.icon}
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default VideoHeroSection;
