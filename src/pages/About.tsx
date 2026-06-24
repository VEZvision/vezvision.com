import "../styles/GridBackground.css";
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
import ValuesSection from "@/components/about/ValuesSection";
import WhyChooseSection from "@/components/why-choose/WhyChooseSection";
import AboutComparison from "@/components/about/AboutComparison";
import FaqSection from "@/components/faq/FaqSection";
import ContactSection from "@/components/contact/ContactSection";

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
  values: { Component: ValuesSection, eager: true },
  about_comparison: { Component: AboutComparison, eager: true },
  why_choose: { Component: WhyChooseSection, eager: true },
  faq: { Component: FaqSection, eager: true },
  contact: { Component: ContactSection, eager: true },
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
        style: { backgroundColor: "#f5f5f5", position: "relative", zIndex: 1 },
      }}
    />
  );
}
