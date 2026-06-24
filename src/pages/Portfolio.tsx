import "../styles/GridBackground.css";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, FolderOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { usePortfolio } from "../hooks/usePortfolio";
import PageSeo from "@/components/seo/PageSeo";
import VideoHeroSection from "@/components/common/VideoHeroSection";
import PortfolioFeatures from "../components/portfolio/PortfolioFeatures";
import ContactSection from "@/components/contact/ContactSection";
import {
  SectionReveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/ui/SectionReveal";
import { safeJsonLd } from "@/utils/safeJsonLd";
import { joinUrlPath, safeAbsoluteHttpUrl } from "@/utils/safeHref";
import styles from "./Portfolio.module.css";
import { useSettings } from "@/hooks/useSettings";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import PortfolioEmptyState from "./PortfolioEmptyState";
import PortfolioProjectCard from "./PortfolioProjectCard";

const Portfolio = () => {
  const { t, language } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();
  const { social, seo } = useSettings();
  const navigate = useNavigate();
  const { projects, loading, error } = usePortfolio();
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const currentLang = (language as "pl" | "en") || "pl";
  const siteUrl =
    safeAbsoluteHttpUrl(seo?.siteUrl) ||
    import.meta.env.VITE_SITE_URL ||
    "https://vezvision.com";

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(projects.map((p) => p.category)));
    return ["all", ...uniqueCats];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  const getCategoryLabel = (cat: string) => {
    if (cat === "all") return t("portfolio.filters.all");
    return cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleContactClick = () => {
    if (typeof document === "undefined") return;
    const contactSection =
      document.getElementById("kontakt") ??
      document.getElementById("contact-form-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      void navigate(toLocalizedPath("contact") + "#kontakt");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="grid-background"></div>
      <PageSeo pageKey="portfolio" />

      {!loading && projects.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {safeJsonLd({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name:
                language === "pl"
                  ? "Portfolio VezVision"
                  : "VezVision Portfolio",
              itemListElement: projects.map((project, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name:
                  project.translations[currentLang]?.title ||
                  project.translations["pl"]?.title ||
                  project.slug,
                url: joinUrlPath(
                  siteUrl,
                  `/${language}/portfolio/${project.slug}`,
                ),
              })),
            })}
          </script>
        </Helmet>
      )}

      <VideoHeroSection
        title={
          <>
            <span className="block">{t("portfolio.hero.title.line1")}</span>
            <span className="block font-sans">
              {t("portfolio.hero.title.line2.italic")}
            </span>
          </>
        }
        subtitle={t("portfolio.hero.description")}
        buttonText={t("nav.contact")}
        onButtonClick={handleContactClick}
        badge={t("portfolio.hero.badge")}
        icon={<FolderOpen className="w-3.5 h-3.5" />}
        socialLinks={buildHeroSocialLinks(social)}
        ariaLabelledBy="portfolio-hero-title"
      />

      <PortfolioFeatures />

      <section className={styles.section} id="portfolio-grid">
        <div className={styles.container}>
          <SectionReveal>
            <div className={styles.header}>
              <div className={styles.badge}>
                <Briefcase className={styles.badgeIcon} />
                <span>PORTFOLIO</span>
              </div>
              <h2 className={styles.title}>
                {t("portfolio.projects.title.line1")}{" "}
                <span className="font-sans font-semibold">
                  {t("portfolio.projects.title.line2.italic")}
                </span>
              </h2>
              <p className={styles.subtitle}>
                {t("portfolio.projects.subtitle")}
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.08}>
            {projects.length > 0 && (
              <div className={styles.filters}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setVisibleCount(6);
                    }}
                    className={`${styles.filterTab} ${activeCategory === category ? styles.filterTabActive : ""}`}
                  >
                    {getCategoryLabel(category)}
                    <span className={styles.filterCount}>
                      {category === "all"
                        ? projects.length
                        : projects.filter((p) => p.category === category)
                            .length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SectionReveal>

          <div>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeleton}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonContent}>
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonLineShort}`}
                    />
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonLineLong}`}
                    />
                    <div
                      className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`}
                    />
                  </div>
                </div>
              ))
            ) : error ? (
              <PortfolioEmptyState
                compact
                title={t("portfolio.grid.error")}
                description={error.message}
              />
            ) : projects.length === 0 ? (
              <PortfolioEmptyState
                title={t("portfolio.grid.empty")}
                description={t("portfolio.grid.empty_desc")}
                ctaTitle={t("portfolio.grid.empty_cta.title")}
                ctaLabel={t("portfolio.grid.empty_cta.button")}
                ctaHref={toLocalizedPath("contact")}
              />
            ) : filteredProjects.length === 0 ? (
              <PortfolioEmptyState
                title={t("portfolio.empty.title")}
                description={t("portfolio.empty.description")}
              />
            ) : (
              <StaggerReveal className={styles.grid}>
                {visibleProjects.map((project, index) => (
                  <StaggerItem key={`${activeCategory}-${project.id}-${index}`}>
                    <PortfolioProjectCard
                      project={project}
                      language={currentLang}
                      href={toLocalizedPath(`portfolio/${project.slug}`)}
                    />
                  </StaggerItem>
                ))}
              </StaggerReveal>
            )}
          </div>

          {!loading && visibleCount < filteredProjects.length && (
            <SectionReveal delay={0.12}>
              <div className={styles.loadMore}>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className={styles.loadMoreBtn}
                >
                  {t("portfolio.categories.buttons.showMore")}
                </button>
              </div>
            </SectionReveal>
          )}
        </div>
      </section>

      <ContactSection />
    </div>
  );
};

export default Portfolio;
