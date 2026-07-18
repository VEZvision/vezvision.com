import { ArrowUpRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import logoNavbar from "@brand/wordmark-horizontal-dark.svg";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import PageSeo from "@/components/seo/PageSeo";
import styles from "./NotFound.module.scss";

const NotFound = () => {
  const { t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();

  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <PageSeo pageKey="not-found" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.topline}>
          <img
            src={logoNavbar}
            alt={t("notfound.logoAlt")}
            width="838"
            height="153"
            className={styles.logo}
          />
          <span className={styles.code}>404</span>
        </div>
        <div className={styles.content}>
          <div className={styles.icon}>
            <Compass size={22} strokeWidth={1.6} aria-hidden="true" />
          </div>
          <p className={styles.eyebrow}>{t("notfound.eyebrow")}</p>
          <h1 id="not-found-title" className={styles.title}>
            {t("notfound.title")}
          </h1>
          <p className={styles.description}>{t("notfound.description")}</p>
          <div className={styles.actions}>
            <Link to={toLocalizedPath()} className={styles.primaryButton}>
              {t("notfound.cta.home")}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to={toLocalizedPath("contact")}
              className={styles.secondaryButton}
            >
              {t("notfound.cta.contact")}
            </Link>
          </div>
        </div>
        <nav
          className={styles.suggestions}
          aria-label={t("notfound.help.text")}
        >
          <span>{t("notfound.help.text")}</span>
          <Link to={toLocalizedPath("services")}>
            {t("notfound.help.services")}
          </Link>
          <Link to={toLocalizedPath("portfolio")}>
            {t("notfound.help.portfolio")}
          </Link>
          <Link to={toLocalizedPath("blog")}>{t("notfound.help.blog")}</Link>
        </nav>
      </div>
    </section>
  );
};

export default NotFound;
