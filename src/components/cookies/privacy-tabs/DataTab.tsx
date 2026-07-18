import { Download, Trash2 } from "lucide-react";
import type { CookieConsentState } from "@/types/cookies";
import styles from "../PrivacyCenter.module.css";

interface DataTabProps {
  t: (key: string) => string;
  language: string;
  state: CookieConsentState;
  isExporting: boolean;
  onExport: () => void;
  onDelete: () => void;
}

export function DataTab({
  t,
  language,
  state,
  isExporting,
  onExport,
  onDelete,
}: DataTabProps) {
  return (
    <div id="panel-data" role="tabpanel" className={styles.panel}>
      <h3 className={styles.sectionTitle}>{t("privacy.data.management")}</h3>
      <p className={styles.lead}>{t("privacy.data.management.description")}</p>
      <div className={styles.dataGrid}>
        <article className={styles.actionCard}>
          <Download aria-hidden="true" />
          <h4 className={styles.actionTitle}>
            {t("privacy.data.export.title")}
          </h4>
          <p className={styles.actionDescription}>
            {t("privacy.data.export.description")}
          </p>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className={styles.secondaryButton}
          >
            <Download size={15} aria-hidden="true" />
            {isExporting
              ? t("privacy.data.export.loading")
              : t("privacy.data.export.button")}
          </button>
        </article>
        <article className={styles.actionCard}>
          <Trash2 aria-hidden="true" />
          <h4 className={styles.actionTitle}>
            {t("privacy.data.delete.title")}
          </h4>
          <p className={styles.actionDescription}>
            {t("privacy.data.delete.description")}
          </p>
          <button
            type="button"
            onClick={onDelete}
            className={styles.dangerButton}
          >
            <Trash2 size={15} aria-hidden="true" />
            {t("privacy.data.delete.button")}
          </button>
        </article>
      </div>
      <section className={styles.meta}>
        <h4 className={styles.rowTitle}>{t("privacy.data.consent.info")}</h4>
        <div className={styles.metaGrid}>
          <span>{t("privacy.data.consent.id")}</span>
          <span>{state.consentId}</span>
          <span>{t("privacy.data.consent.version")}</span>
          <span>{state.version}</span>
          <span>{t("privacy.data.consent.updated")}</span>
          <span>
            {new Date(state.lastUpdated).toLocaleString(
              language === "pl" ? "pl-PL" : "en-US",
            )}
          </span>
        </div>
      </section>
    </div>
  );
}
