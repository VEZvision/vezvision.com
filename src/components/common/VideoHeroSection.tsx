import type { FC, ReactNode } from "react";
import { Fragment, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { usePrefersReducedData } from "@/hooks/usePrefersReducedData";
import SectionBadge from "@/components/ui/SectionBadge";
import logoNavbar from "@/assets/logo-navbar.svg";
import { safeExternalHref, safePublicHref } from "@/utils/safeHref";
import { scrollToElement } from "@/scroll";
import styles from "./VideoHeroSection.module.css";

export interface SocialLink {
  href: string | undefined;
  icon: ReactNode;
  label: string;
}

interface VideoHeroSectionProps {
  title: ReactNode;
  subtitle: string;
  buttonText: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  socialLinks?: SocialLink[];
  badge?: string;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  ariaLabelledBy?: string;
}

const VideoHeroSection: FC<VideoHeroSectionProps> = ({
  title,
  subtitle,
  buttonText,
  buttonHref,
  onButtonClick,
  socialLinks,
  badge,
  icon,
  className,
  contentClassName,
  ariaLabelledBy,
}) => {
  const navigate = useNavigate();
  const { toLocalizedPath } = useLocalizedPath();
  const prefersReducedData = usePrefersReducedData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      prefersReducedData ||
      !sectionRef.current ||
      !videoRef.current
    ) {
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

    if ("IntersectionObserver" in window) {
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
  }, [prefersReducedData]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
      return;
    }

    const safeButtonHref = safePublicHref(buttonHref);
    if (safeButtonHref) {
      if (safeButtonHref.startsWith("#")) {
        const target = document.getElementById(safeButtonHref.slice(1));
        if (target) {
          scrollToElement(target, { offset: -96, behavior: "smooth" });
          return;
        }
      }

      if (safeButtonHref.startsWith("/")) {
        void navigate(toLocalizedPath(safeButtonHref.replace(/^\//, "")));
      } else if (safeButtonHref.startsWith("#")) {
        void navigate(safeButtonHref);
      } else if (typeof window !== "undefined") {
        window.location.assign(safeButtonHref);
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className={
        className ??
        "relative flex min-h-[72vh] w-full items-center justify-center overflow-hidden bg-white px-4 pt-[112px] pb-[56px] md:min-h-[76vh] md:pt-[120px] md:pb-[68px]"
      }
      aria-labelledby={ariaLabelledBy}
    >
      {prefersReducedData ? (
        <div
          className="absolute inset-0 z-0 bg-gradient-to-br from-[#f3f4f6] via-white to-[#e5e7eb]"
          aria-hidden="true"
        />
      ) : (
        <video
          ref={videoRef}
          className={styles.videoBg}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/og-image.png"
          aria-hidden="true"
          onError={() => {}}
          disableRemotePlayback
          x-webkit-airplay="deny"
        >
          <source src="/footer-bg.webm" type="video/webm" />
          <source src="/footer-bg.mp4" type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-white/90 z-10" />

      <div
        className={`relative z-20 mx-auto text-center ${
          contentClassName ?? "max-w-[980px]"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center justify-center">
              <img
                src={logoNavbar}
                alt="VezVision"
                className="h-[48px] sm:h-[64px] w-auto object-contain"
              />
            </div>
          </div>

          {badge && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center gap-[10px] bg-[#f3f4f6] border border-[#e5e7eb] rounded-full px-[12px] py-[8px]">
                <SectionBadge text={badge} icon={icon} />
              </div>
            </div>
          )}

          <h1
            className="mb-5 font-sans text-[clamp(38px,6.5vw,80px)] font-normal leading-[1.05] tracking-[-1.6px] text-black"
            aria-label={typeof title === "string" ? title : undefined}
          >
            {title}
          </h1>

          <p className="text-[16px] leading-[26px] tracking-[-0.32px] text-[#0f0f0f] mb-6 max-w-[936px] mx-auto">
            {subtitle}
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleButtonClick}
              className="inline-flex items-center rounded-lg bg-[#04070d] text-white font-semibold text-[16px] px-5 py-3 transition-transform hover:-translate-y-0.5"
            >
              {buttonText}
            </button>
          </div>

          {socialLinks && socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-6">
              {socialLinks.map((item, index) => (
                <Fragment key={item.label}>
                  {safeExternalHref(item.href) ? (
                    <a
                      href={safeExternalHref(item.href)}
                      className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                      aria-label={item.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="w-6 h-6 inline-flex items-center justify-center">
                        {item.icon}
                      </span>
                    </a>
                  ) : (
                    <span
                      className="w-6 h-6 inline-flex items-center justify-center opacity-50"
                      aria-hidden={item.label ? undefined : "true"}
                    >
                      {item.icon}
                    </span>
                  )}
                  {index < socialLinks.length - 1 && (
                    <div
                      className="w-0.5 h-6 bg-[#0a0a0a]"
                      aria-hidden="true"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoHeroSection;
