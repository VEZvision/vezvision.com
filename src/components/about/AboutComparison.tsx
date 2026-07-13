import styles from "./AboutComparison.module.css";
import { useHeroContactAction } from "@/hooks/useHeroContactAction";
import SectionHeader from "@/components/ui/SectionHeader";

// Import icons
import iconDifferenceTag from "@/assets/comparison/difference-tag-icon.svg";
import iconCheckVez from "@/assets/comparison/check-vez.svg";
import iconCrossOther from "@/assets/comparison/cross-other.svg";
import {
  SectionReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/ui/SectionReveal";
import { useLanguageContext } from "@/hooks/useLanguage";
import { usePageSectionConfig } from "@/hooks/usePageSection";

function AboutComparison() {
  const { t } = useLanguageContext();
  const homeConfig = usePageSectionConfig("home", "about_comparison");
  const aboutConfig = usePageSectionConfig("about", "about_comparison");
  const handleContactClick = useHeroContactAction(
    homeConfig.contactHref ?? aboutConfig.contactHref,
  );

  const title = (
    <>
      {t("comparison.title.line1")}{" "}
      <span className="font-sans font-semibold">
        {t("comparison.title.line2.italic")}
      </span>
    </>
  );

  return (
    <section className={styles.container} id="about-comparison">
      <SectionReveal>
        <SectionHeader
          badgeText={t("comparison.tag")}
          badgeIcon={
            <img
              src={iconDifferenceTag}
              alt=""
              width="14"
              height="14"
              className="w-3.5 h-3.5"
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          }
          title={title}
          subtitle={t("comparison.subtitle")}
          className="mb-16"
        />
      </SectionReveal>

      <StaggerReveal className={styles.comparisonGrid}>
        <StaggerItem>
          <div className={styles.comparisonCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{t("comparison.left.title")}</h3>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b1")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b2")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b3")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b4")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b5")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b6")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCheckVez}
                  alt={t("comparison.alt.check")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.left.b7")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleContactClick}
              className={styles.ctaButton}
            >
              <span>{t("nav.contact")}</span>
            </button>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className={styles.comparisonCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                {t("comparison.right.title")}
              </h3>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <img
                  src={iconCrossOther}
                  alt={t("comparison.alt.cross")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.right.b1")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCrossOther}
                  alt={t("comparison.alt.cross")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.right.b2")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCrossOther}
                  alt={t("comparison.alt.cross")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.right.b3")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCrossOther}
                  alt={t("comparison.alt.cross")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.right.b4")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCrossOther}
                  alt={t("comparison.alt.cross")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.right.b5")}
                </span>
              </div>
              <div className={styles.benefitItem}>
                <img
                  src={iconCrossOther}
                  alt={t("comparison.alt.cross")}
                  width="15"
                  height="15"
                  className={styles.benefitIcon}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.benefitText}>
                  {t("comparison.right.b6")}
                </span>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerReveal>
    </section>
  );
}

export default AboutComparison;
