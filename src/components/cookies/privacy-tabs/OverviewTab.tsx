import { Database, Settings, ShieldCheck } from "lucide-react";
import type { CookieConsentState } from "@/types/cookies";
import styles from "../PrivacyCenter.module.css";

interface OverviewTabProps {
  t: (key: string) => string;
  language: string;
  state: CookieConsentState;
  activeCookiesCount: number;
  totalCookiesCount: number;
  onShowPreferences: () => void;
}

const categories = [
  "necessary",
  "functional",
  "analytics",
  "marketing",
] as const;

export function OverviewTab({
  t,
  language,
  state,
  activeCookiesCount,
  totalCookiesCount,
  onShowPreferences,
}: OverviewTabProps) {
  return (
    <div id="panel-overview" role="tabpanel" className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t("privacy.overview.status")}</h3>
        <div className={styles.summaryGrid}>
          <article className={styles.summary}>
            <ShieldCheck className={styles.summaryIcon} aria-hidden="true" />
            <p className={styles.summaryLabel}>
              {t("privacy.overview.consent.granted")}
            </p>
            <p className={styles.summaryValue}>
              {new Date(state.lastUpdated).toLocaleDateString(
                language === "pl" ? "pl-PL" : "en-US",
              )}
            </p>
          </article>
          <article className={styles.summary}>
            <Database className={styles.summaryIcon} aria-hidden="true" />
            <p className={styles.summaryLabel}>
              {t("privacy.overview.cookies.active")}
            </p>
            <p className={styles.summaryValue}>
              {activeCookiesCount} {t("common.of")} {totalCookiesCount}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("privacy.overview.preferences")}
        </h3>
        <div className={styles.list}>
          {categories.map((categoryId) => {
            const isEnabled = state.preferences[categoryId];
            return (
              <div key={categoryId} className={styles.row}>
                <div>
                  <h4 className={styles.rowTitle}>
                    {t(`privacy.category.${categoryId}`)}
                  </h4>
                  <p className={styles.rowDescription}>
                    {t(`privacy.category.${categoryId}.desc`)}
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
            );
          })}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onShowPreferences}
            className={styles.primaryButton}
          >
            <Settings size={16} aria-hidden="true" />
            {t("privacy.overview.change")}
          </button>
        </div>
      </section>
    </div>
  );
}
