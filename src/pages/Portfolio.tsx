import "../styles/GridBackground.css";
import { Briefcase, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import { usePortfolio } from "../hooks/usePortfolio";
import PageSeo from "@/components/seo/PageSeo";
import VideoHeroSection from "@/components/common/VideoHeroSection";
import PortfolioFeatures from "../components/portfolio/PortfolioFeatures";
import ContactSection from "@/components/contact/ContactSection";
import { SectionReveal } from "@/components/ui/SectionReveal";
import styles from "./Portfolio.module.css";
import { useSettings } from "@/hooks/useSettings";
import { buildHeroSocialLinks } from "@/components/common/heroSocialLinks";
import PortfolioEmptyState from "./PortfolioEmptyState";

const Portfolio = () => {
  const { t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();
  const { social } = useSettings();
  const navigate = useNavigate();
  const { loading, error } = usePortfolio();

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

      <VideoHeroSection
        title={
          <>
            <span className="block font-sans">
              {t("portfolio.hero.title.line1")}
            </span>
            {t("portfolio.hero.title.line2.italic") && (
              <span className="block font-sans">
                {t("portfolio.hero.title.line2.italic")}
              </span>
            )}
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

          <div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
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
            ) : (
              <PortfolioEmptyState
                title={t("portfolio.grid.empty")}
                description={t("portfolio.grid.empty_desc")}
                ctaTitle={t("portfolio.grid.empty_cta.title")}
                ctaLabel={t("portfolio.grid.empty_cta.button")}
                ctaHref={toLocalizedPath("contact")}
              />
            )}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
};

export default Portfolio;
