import "../styles/GridBackground.css";
import { useHeroContactAction } from "@/hooks/useHeroContactAction";
import { BookOpen } from "lucide-react";

import VideoHeroSection from "@/components/common/VideoHeroSection";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useSettings } from "@/hooks/useSettings";
import { StaticPage } from "@/pagekit";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import FounderNote from "@/components/FounderNote";
import BlogArticlesWithData from "@/components/blog/BlogArticlesWithData";
import NewsletterSection from "@/components/newsletter/NewsletterSection";
import ContactSection from "@/components/contact/ContactSection";

function BlogHero() {
  const { t } = useLanguageContext();
  const { social } = useSettings();
  const handleContactClick = useHeroContactAction();

  return (
    <VideoHeroSection
      title={<span className="block">{t("blog.hero.title")}</span>}
      subtitle={t("blog.hero.description")}
      buttonText={t("blog.hero.cta.text")}
      onButtonClick={handleContactClick}
      badge={t("blog.hero.badge")}
      icon={<BookOpen className="w-3.5 h-3.5" />}
      socialLinks={buildHeroSocialLinks(social)}
      ariaLabelledBy="blog-hero-title"
    />
  );
}

export default function Blog() {
  return (
    <StaticPage
      seoKey="blog"
      shell={{ style: { backgroundColor: "transparent" } }}
      sections={[
        { key: "hero", Component: BlogHero, eager: true },
        {
          key: "founder",
          Component: FounderNote,
          props: { variant: "blog" },
          eager: true,
        },
        { key: "articles", Component: BlogArticlesWithData, eager: true },
        { key: "newsletter", Component: NewsletterSection, eager: true },
        { key: "contact", Component: ContactSection, eager: true },
      ]}
    />
  );
}
