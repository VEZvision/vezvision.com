import { Fragment, memo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import logoNavbar from "../../assets/logo-navbar.svg";

import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import { useLanguageContext } from "../../hooks/useLanguage";
import { usePrefersReducedData } from "@/hooks/usePrefersReducedData";
import { useBackgroundVideoSection } from "@/hooks/useBackgroundVideoSection";
import SectionBadge from "@/components/ui/SectionBadge";
import { Sparkles } from "lucide-react";
import { useSocial } from "@/hooks/useSettings";
import { usePageSectionConfig } from "@/hooks/usePageSection";
import { safeCmsHref } from "@/utils/safeHref";
import { localizeInternalHref } from "@/routing/locale";
import styles from "./Hero.module.scss";

const HERO_VIDEO_SRC = "/hero-bg.mp4";
const HERO_VIDEO_WEBM_SRC = "/hero-bg.webm";
const HERO_VIDEO_RELOAD_KEY = "hero-bg";

const Hero = memo(() => {
  const { t, language } = useLanguageContext();
  const social = useSocial();
  const sectionConfig = usePageSectionConfig("home", "hero");
  const prefersReducedData = usePrefersReducedData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const showVideo = !prefersReducedData;

  useBackgroundVideoSection({
    enabled: showVideo,
    sectionRef,
    videoRef,
    initiallyVisible: true,
    threshold: 0.05,
    rootMargin: "80px",
    reloadKey: HERO_VIDEO_RELOAD_KEY,
  });

  const socialLinks = buildHeroSocialLinks(social);
  const primaryHref = localizeInternalHref(
    safeCmsHref(sectionConfig.primaryHref, "/contact"),
    language,
  );
  const secondaryHref = localizeInternalHref(
    safeCmsHref(sectionConfig.secondaryHref, "/services"),
    language,
  );

  return (
    <section ref={sectionRef} className={styles.sectionHero}>
      <Helmet>
        <link rel="preload" as="image" href={logoNavbar} fetchPriority="high" />
      </Helmet>
      {showVideo && (
        <video
          ref={videoRef}
          className={styles.videoBg}
          width="1920"
          height="1080"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          disableRemotePlayback
          x-webkit-airplay="deny"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
          <source src={HERO_VIDEO_WEBM_SRC} type="video/webm" />
        </video>
      )}

      <div className={styles.videoOverlay} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className="flex flex-col items-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center gap-[10px] bg-[#f3f4f6] border border-[#e5e7eb] rounded-full px-[12px] py-[8px]">
              <SectionBadge
                text={t("hero.badge")}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="mb-5 flex items-center justify-center">
            <img
              src={logoNavbar}
              alt="VezVision"
              width="838"
              height="153"
              className="h-[48px] sm:h-[64px] w-auto object-contain"
              fetchPriority="high"
            />
          </div>

          {/* Main heading for SEO & accessibility */}
          <h1 className="text-[20px] sm:text-[24px] leading-[30px] sm:leading-[34px] tracking-[-0.36px] text-[#020617] font-semibold mb-6 max-w-[936px] mx-auto">
            {t("hero.subtitle")}
          </h1>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={primaryHref}
              className="inline-flex items-center rounded-lg bg-[#04070d] text-white font-semibold text-[16px] px-5 py-3 transition-transform hover:-translate-y-0.5"
            >
              {t("hero.cta.consult")}
            </Link>
            <Link
              to={secondaryHref}
              className="inline-flex items-center justify-center rounded-lg bg-[#f5f5f5] text-black font-medium text-[14px] px-6 py-[11px] shadow-[inset_0px_3px_1px_0px_#ffffff,0px_1px_1px_-1px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-0.5"
            >
              {t("hero.cta.services")}
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
                    rel="me noopener noreferrer"
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

Hero.displayName = "Hero";

export default Hero;
