import { ExternalLink } from "lucide-react";
import styles from "../PrivacyCenter.module.css";

interface RightsTabProps {
  t: (key: string) => string;
  contactEmail: string;
}
const rights = [
  "access",
  "rectification",
  "erasure",
  "portability",
  "objection",
] as const;

export function RightsTab({ t, contactEmail }: RightsTabProps) {
  return (
    <div id="panel-rights" role="tabpanel" className={styles.panel}>
      <h3 className={styles.sectionTitle}>{t("privacy.rights.title")}</h3>
      <p className={styles.lead}>{t("privacy.rights.intro")}</p>
      <div className={styles.rightsGrid}>
        {rights.map((right) => (
          <article key={right} className={styles.rightItem}>
            <h4 className={styles.rightItemTitle}>
              {t(`privacy.rights.${right}.title`)}
            </h4>
            <p className={styles.rightItemDescription}>
              {t(`privacy.rights.${right}.description`)}
            </p>
          </article>
        ))}
      </div>
      <section className={styles.contactBlock}>
        <h4 className={styles.rowTitle}>{t("privacy.rights.contact.title")}</h4>
        <p className={styles.rowDescription}>
          {t("privacy.rights.contact.description")}
        </p>
        {contactEmail ? (
          <a href={`mailto:${contactEmail}`} className={styles.textLink}>
            {contactEmail}
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        ) : null}
      </section>
    </div>
  );
}
