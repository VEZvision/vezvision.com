import styles from "./ContactFormSection.module.scss";
import {
  normalizeContactEmail,
  normalizeContactPhone,
  formatTelHref,
} from "@/utils/contactValidation";
import type { LanguageContextType } from "@/hooks/useLanguage";

interface ContactInfo {
  email: string;
  phone: string | null;
  address: string | null;
}

interface ContactInfoCardsProps {
  t: LanguageContextType["t"];
  contact: ContactInfo;
  loading: boolean;
  hasContact: boolean;
}

function normalizeAddress(value: string | null | undefined): string | null {
  const address = value?.trim();
  if (!address || address.length > 300 || /[<>]/.test(address)) return null;
  return address;
}

export function ContactInfoCards({
  t,
  contact,
  loading,
  hasContact,
}: ContactInfoCardsProps) {
  const displayEmail = contact.email?.trim() || "contact@vezvision.com";
  const displayPhone =
    contact.phone?.trim() || t("contact.form.phone.fallback");
  const displayAddress =
    contact.address?.trim() || t("contact.form.address.fallback");

  const mailtoHref = (() => {
    const email = normalizeContactEmail(displayEmail);
    return email ? `mailto:${email}` : "#";
  })();

  const telHref = (() => {
    const phoneResult = normalizeContactPhone(contact.phone);
    return phoneResult.phone ? formatTelHref(phoneResult.phone) : "#";
  })();

  const mapHref = (() => {
    const address = normalizeAddress(contact.address);
    return address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : "#";
  })();

  const loadingSkeleton = (width: string) =>
    loading || !hasContact ? (
      <span
        className={`inline-block ${width} h-5 bg-gray-200 rounded-sm animate-pulse`}
      />
    ) : null;

  return (
    <div className={styles.contacts}>
      <a href={mailtoHref} className={styles.contactCard}>
        <div className={styles.iconContainer}>
          <div className={styles.iconEmail} />
        </div>
        <p className={styles.contactText}>
          {t("contact.form.email.prompt.line1")}
          <br />
          {t("contact.form.email.prompt.line2")}
        </p>
        <div className={styles.link}>
          {loadingSkeleton("w-40") || (
            <span className={styles.contactInfo}>{displayEmail}</span>
          )}
        </div>
      </a>

      <a href={telHref} className={styles.contactCard}>
        <div className={styles.iconContainer}>
          <div className={styles.iconPhone} />
        </div>
        <p className={styles.contactText}>
          {t("contact.form.phone.prompt.line1")}
          <br />
          {t("contact.form.phone.prompt.line2")}
        </p>
        <div className={styles.link}>
          {loadingSkeleton("w-32") || (
            <span className={styles.contactInfo}>{displayPhone}</span>
          )}
        </div>
      </a>

      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.contactCard}
      >
        <div className={styles.iconContainer}>
          <div className={styles.iconAddress} />
        </div>
        <p className={styles.contactText}>
          {t("contact.tile.address.title")}
          <br />
          {t("contact.tile.address.desc")}
        </p>
        <div className={styles.link}>
          {loadingSkeleton("w-48") || (
            <span className={styles.contactInfo}>{displayAddress}</span>
          )}
        </div>
      </a>
    </div>
  );
}
