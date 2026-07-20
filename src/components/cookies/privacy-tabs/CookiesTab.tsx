import {
  COOKIE_CATEGORIES,
  COOKIE_DEFINITIONS,
} from "@/data/cookieDefinitions";
import type { CookiePreferences } from "@/types/cookies";
import styles from "../PrivacyCenter.module.css";

interface CookiesTabProps {
  t: (key: string) => string;
  preferences: CookiePreferences;
}

export function CookiesTab({ t, preferences }: CookiesTabProps) {
  return (
    <div id="panel-cookies" role="tabpanel" className={styles.panel}>
      <h3 className={styles.sectionTitle}>
        {t("privacy.cookies.details.title")}
      </h3>
      <p className={styles.lead}>{t("privacy.cookies.details.description")}</p>
      <div>
        {COOKIE_CATEGORIES.map((category) => {
          const isEnabled = preferences[category.id];
          const categoryCookies = COOKIE_DEFINITIONS.filter(
            (cookie) => cookie.category === category.id,
          );
          return (
            <section key={category.id} className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div>
                  <h4 className={styles.detailTitle}>
                    {t(`privacy.category.${category.id}`)}
                  </h4>
                  <p className={styles.detailDescription}>
                    {t(`privacy.category.${category.id}.desc`)}
                  </p>
                </div>
                <span
                  className={`${styles.status} ${isEnabled ? styles.statusOn : ""}`}
                >
                  {isEnabled
                    ? t("privacy.overview.enabled")
                    : t("privacy.overview.disabled")}
                </span>
              </div>
              {categoryCookies.length > 0 ? (
                <div className={styles.tableScroll}>
                  <table className={styles.cookieTable}>
                    <thead>
                      <tr>
                        <th>{t("privacy.cookies.table.name")}</th>
                        <th>{t("privacy.cookies.purpose")}</th>
                        <th>{t("privacy.cookies.provider")}</th>
                        <th>{t("privacy.cookies.validity")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryCookies.map((cookie) => (
                        <tr key={cookie.name}>
                          <td className={styles.cookieName}>{cookie.name}</td>
                          <td>{t(`privacy.cookie.${cookie.name}.purpose`)}</td>
                          <td>{cookie.provider}</td>
                          <td>{t(`privacy.cookie.${cookie.name}.expiry`)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.empty}>{t("privacy.cookies.empty")}</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
