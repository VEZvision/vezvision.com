import "../styles/GridBackground.css";
import { lazy } from "react";
import { useHeroContactAction } from "@/hooks/useHeroContactAction";
import { Briefcase } from "lucide-react";

import VideoHeroSection from "@/components/common/VideoHeroSection";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { StaticPage } from "@/pagekit";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";

const Group23Section = lazy(
  () => import("@/components/services/group23/Group23Section"),
);
const WorkflowSection = lazy(
  () => import("@/components/services/workflow/WorkflowSection"),
);
const ServicesSection = lazy(
  () => import("@/components/services/ServicesSection"),
);
const NewsletterSection = lazy(
  () => import("@/components/newsletter/NewsletterSection"),
);
const ContactSection = lazy(
  () => import("@/components/contact/ContactSection"),
);

function ServicesHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const handleContactClick = useHeroContactAction();

  return (
    <VideoHeroSection
      title={
        <>
          <span className="block">{t("services.hero.title.line1")}</span>
          {" "}
          <span className="block">
            {t("services.hero.title.line2")}{" "}
            <span className="font-sans">
              {t("services.hero.title.emphasis")}
            </span>
          </span>
        </>
      }
      subtitle={t("services.hero.description")}
      buttonText={t("services.hero.contact")}
      onButtonClick={handleContactClick}
      badge={t("services.hero.badge")}
      icon={<Briefcase className="w-3.5 h-3.5" />}
      socialLinks={buildHeroSocialLinks(social)}
    />
  );
}

export default function Services() {
  return (
    <StaticPage
      seoKey="services"
      shell={{
        className: "min-h-screen",
        style: { backgroundColor: "transparent" },
      }}
      sections={[
        { key: "hero", Component: ServicesHero, eager: true },
        { key: "group23", Component: Group23Section, minHeight: "620px" },
        { key: "workflow", Component: WorkflowSection, minHeight: "640px" },
        { key: "services", Component: ServicesSection, minHeight: "680px" },
        { key: "newsletter", Component: NewsletterSection, minHeight: "420px" },
        { key: "contact", Component: ContactSection, minHeight: "560px" },
      ]}
    />
  );
}
