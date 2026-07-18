import { memo } from "react";
import { Sparkles } from "lucide-react";

import VideoHeroSection from "@/components/common/VideoHeroSection";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSocial } from "@/hooks/useSettings";
import { usePageSectionConfig } from "@/hooks/usePageSection";
import { safeCmsHref } from "@/utils/safeHref";

const Hero = memo(() => {
  const { t } = useLanguageContext();
  const social = useSocial();
  const sectionConfig = usePageSectionConfig("home", "hero");

  return (
    <VideoHeroSection
      variant="home"
      videoMp4Src="/hero-bg.mp4?v=65de2eb"
      videoWebmSrc="/hero-bg.webm"
      title={<span>{t("hero.subtitle")}</span>}
      subtitle={t("hero.description")}
      badge={t("hero.badge")}
      icon={<Sparkles />}
      buttonText={t("hero.cta.consult")}
      buttonHref={safeCmsHref(sectionConfig.primaryHref, "/contact")}
      secondaryButtonText={t("hero.cta.services")}
      secondaryButtonHref={safeCmsHref(
        sectionConfig.secondaryHref,
        "/services",
      )}
      socialLinks={buildHeroSocialLinks(social)}
      ariaLabelledBy="home-hero-title"
      brandPriority
    />
  );
});

Hero.displayName = "Hero";

export default Hero;
