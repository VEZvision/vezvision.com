import "../styles/GridBackground.css";
import { lazy } from "react";
import { Phone } from "lucide-react";

import VideoHeroSection from "@/components/common/VideoHeroSection";
import ContactFormPageSection from "@/components/contact/ContactFormPageSection";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { usePageSectionConfig } from "@/hooks/usePageSection";
import { scrollToElement } from "@/scroll";
import { CmsPage } from "@/pagekit";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";

const FaqSection = lazy(() => import("@/components/faq/FaqSection"));
const ContactSection = lazy(
  () => import("@/components/contact/ContactSection"),
);

function ContactHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const sectionConfig = usePageSectionConfig("contact", "hero");

  const handleScrollToForm = () => {
    if (typeof document === "undefined") return;
    const targetId =
      typeof sectionConfig.formTargetId === "string"
        ? sectionConfig.formTargetId
        : "contact-form-section";
    const formSection =
      document.getElementById(targetId) ||
      document.getElementById("contact-form");
    scrollToElement(formSection, { offset: -96, behavior: "smooth" });
  };

  const socialLinks = buildHeroSocialLinks(social);

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t("contact.hero.title.line1")}</span>
          <span className="block font-sans">
            {t("contact.hero.title.line2.italic")}
          </span>
        </>
      }
      subtitle={t("contact.hero.description")}
      buttonText={t("nav.contact")}
      onButtonClick={handleScrollToForm}
      badge={t("contact.hero.badge")}
      icon={<Phone className="w-3.5 h-3.5" />}
      socialLinks={socialLinks}
      ariaLabelledBy="contact-hero-title"
    />
  );
}

const CONTACT_SECTIONS = {
  hero: { Component: ContactHero, eager: true },
  form: { Component: ContactFormPageSection, eager: true },
  faq: {
    Component: FaqSection,
    props: { showContactCta: false },
    minHeight: "560px",
  },
  contact: { Component: ContactSection, minHeight: "560px" },
} as const;

const CONTACT_FALLBACK = ["hero", "form", "faq", "contact"] as const;

export default function Contact() {
  return (
    <CmsPage
      pageKey="contact"
      fallbackKeys={CONTACT_FALLBACK}
      sections={CONTACT_SECTIONS}
      shell={{
        className: "min-h-screen",
        style: { backgroundColor: "#f5f5f5", position: "relative", zIndex: 1 },
      }}
    />
  );
}
