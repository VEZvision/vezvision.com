import "../styles/GridBackground.css";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, FolderOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguageContext } from "@/hooks/useLanguage";
import { usePortfolio } from "../hooks/usePortfolio";
import { getProjectImageUrl } from "@/services/portfolio";
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
import { safeAbsoluteHttpUrl } from "@/utils/safeHref";
import styles from "./Portfolio.module.css";
import { useSettings } from "@/hooks/useSettings";
import FacebookIcon from "@/assets/social-facebook";
import LinkedInIcon from "@/assets/social-linkedin";
import socialInstagram from "@/assets/products/social-instagram.svg";

const Portfolio = () => {
  const { t, language } = useLanguageContext();
  const { social, seo } = useSettings();
  const navigate = useNavigate();
  const { projects, loading, error } = usePortfolio();
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const currentLang = (language as "pl" | "en") || "pl";
  const siteUrl =
    safeAbsoluteHttpUrl(seo?.siteUrl) ??
    (typeof window !== "undefined" ? window.location.origin : "");

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
      void navigate("/contact#kontakt");
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
                url: `${siteUrl}/${language}/portfolio/${project.slug}`,
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
        socialLinks={[
          {
            href: social?.facebook || social?.x,
            icon: <FacebookIcon />,
            label: "Facebook",
          },
          {
            href: social?.instagram,
            icon: <img src={socialInstagram} className="w-6 h-6" alt="" />,
            label: "Instagram",
          },
          { href: social?.linkedin, icon: <LinkedInIcon />, label: "LinkedIn" },
        ]}
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
                      : projects.filter((p) => p.category === category).length}
                  </span>
                </button>
              ))}
            </div>
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
              <div className={styles.empty}>
                <FolderOpen className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>
                  {t("portfolio.grid.error")}
                </h3>
                <p className={styles.emptyDesc}>{error.message}</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className={styles.empty}>
                <FolderOpen className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>
                  {t("portfolio.grid.empty")}
                </h3>
                <p className={styles.emptyDesc}>
                  {t("portfolio.grid.empty_desc")}
                </p>
              </div>
            ) : (
              <StaggerReveal className={styles.grid}>
                {visibleProjects.map((project, index) => {
                  const title =
                    project.translations[currentLang]?.title ||
                    project.translations["pl"]?.title;
                  const description =
                    project.translations[currentLang]?.short_description ||
                    project.translations["pl"]?.short_description;

                  return (
                    <StaggerItem
                      key={`${activeCategory}-${project.id}-${index}`}
                    >
                      <Link
                        to={`/portfolio/${project.slug}`}
                        className="block no-underline"
                      >
                        <article className={styles.card}>
                          <div className={styles.cardImage}>
                            {project.cover_path ? (
                              <img
                                src={getProjectImageUrl(project.cover_path)}
                                alt={title}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className={styles.cardImagePlaceholder}>
                                <FolderOpen size={32} />
                              </div>
                            )}
                          </div>
                          <div className={styles.cardContent}>
                            <span className={styles.cardCategory}>
                              {project.category?.replace("-", " ")}
                            </span>
                            <h3 className={styles.cardTitle}>{title}</h3>
                            {description && (
                              <p className={styles.cardDesc}>{description}</p>
                            )}
                            {project.technologies &&
                              project.technologies.length > 0 && (
                                <div className={styles.cardTech}>
                                  {project.technologies
                                    .slice(0, 3)
                                    .map((tech) => (
                                      <span
                                        key={tech.id || tech.name}
                                        className={styles.techTag}
                                      >
                                        {tech.name}
                                      </span>
                                    ))}
                                </div>
                              )}
                          </div>
                        </article>
                      </Link>
                    </StaggerItem>
                  );
                })}
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
