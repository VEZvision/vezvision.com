import { Link } from "react-router-dom";
import styles from "./NotFound.module.scss";
import logoNavbar from "@/assets/logo-navbar.svg";
import arrowRight from "@/assets/arrow-right.svg";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import PageSeo from "@/components/seo/PageSeo";

const NotFound = () => {
  const { t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();
  return (
    <div className={styles.notFoundContainer}>
      <PageSeo pageKey="not-found" />
      <div className={styles.gridBackground}></div>

      <div className={styles.contentWrapper}>
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <img
              className={styles.logo}
              src={logoNavbar}
              alt={t("notfound.logoAlt")}
            />
          </div>
          <h1 className={styles.brandName}>VEZVISION</h1>
        </div>

        <div className={styles.errorSection}>
          <div className={styles.errorCode}>404</div>
          <h2 className={styles.errorTitle}>{t("notfound.title")}</h2>
          <p className={styles.errorDescription}>{t("notfound.description")}</p>
        </div>

        <div className={styles.actionSection}>
          <Link to={toLocalizedPath()} className={styles.primaryButton}>
            <span className={styles.buttonText}>{t("notfound.cta.home")}</span>
            <img className={styles.arrowIcon} src={arrowRight} alt="" />
          </Link>

          <Link
            to={toLocalizedPath("contact")}
            className={styles.secondaryButton}
          >
            <span className={styles.buttonText}>
              {t("notfound.cta.contact")}
            </span>
          </Link>
        </div>

        <div className={styles.helpSection}>
          <p className={styles.helpText}>{t("notfound.help.text")}</p>
          <div className={styles.helpLinks}>
            <Link to={toLocalizedPath("services")} className={styles.helpLink}>
              {t("notfound.help.services")}
            </Link>
            <Link to={toLocalizedPath("portfolio")} className={styles.helpLink}>
              {t("notfound.help.portfolio")}
            </Link>
            <Link to={toLocalizedPath("blog")} className={styles.helpLink}>
              {t("notfound.help.blog")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
