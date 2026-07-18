import "../styles/GridBackground.css";
import { lazy } from "react";
import { Info } from "lucide-react";

import VideoHeroSection from "@/components/common/VideoHeroSection";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { usePageSectionConfig } from "@/hooks/usePageSection";
import { CmsPage } from "@/pagekit";
import { useHeroContactAction } from "@/hooks/useHeroContactAction";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import AboutHeader from "@/components/about/AboutHeader";
import AboutCards from "@/components/about/AboutCards";

const ValuesSection = lazy(() => import("@/components/about/ValuesSection"));
const WhyChooseSection = lazy(
  () => import("@/components/why-choose/WhyChooseSection"),
);
const AboutComparison = lazy(
  () => import("@/components/about/AboutComparison"),
);
const FaqSection = lazy(() => import("@/components/faq/FaqSection"));
const ContactSection = lazy(
  () => import("@/components/contact/ContactSection"),
);

function AboutHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const sectionConfig = usePageSectionConfig("about", "hero");
  const handleContactClick = useHeroContactAction(sectionConfig.contactHref);

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t("about.hero.title.line1")}</span>
          <span className="block">
            {t("about.hero.title.line2.before")}{" "}
            <span className="font-sans">
              {t("about.hero.title.line2.italic")}
            </span>
          </span>
        </>
      }
      subtitle={t("about.hero.description")}
      buttonText={t("nav.contact")}
      onButtonClick={handleContactClick}
      badge={t("about.hero.badge")}
      icon={<Info className="w-3.5 h-3.5" />}
      socialLinks={buildHeroSocialLinks(social)}
    />
  );
}

const ABOUT_SECTIONS = {
  hero: { Component: AboutHero, eager: true },
  header: { Component: AboutHeader, eager: true },
  cards: { Component: AboutCards, eager: true },
  values: { Component: ValuesSection, minHeight: "520px" },
  about_comparison: { Component: AboutComparison, minHeight: "680px" },
  why_choose: { Component: WhyChooseSection, minHeight: "640px" },
  faq: { Component: FaqSection, minHeight: "560px" },
  contact: { Component: ContactSection, minHeight: "560px" },
} as const;

const ABOUT_FALLBACK = [
  "hero",
  "header",
  "cards",
  "values",
  "about_comparison",
  "why_choose",
  "faq",
  "contact",
] as const;

export default function About() {
  return (
    <CmsPage
      pageKey="about"
      fallbackKeys={ABOUT_FALLBACK}
      sections={ABOUT_SECTIONS}
      shell={{
        className: "min-h-screen",
        style: { backgroundColor: "#fdfdfc", position: "relative", zIndex: 1 },
      }}
    />
  );
}
