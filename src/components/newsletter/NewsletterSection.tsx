import { useCallback, useId, useState } from "react";
import styles from "./NewsletterSection.module.css";
import { Mail } from "lucide-react";
import { subscribeToNewsletter } from "../../services/newsletter";
import { logError } from "@/lib/logger";
import { toast } from "sonner";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { useLanguageContext } from "@/hooks/useLanguage";
import TurnstileField from "@/components/security/TurnstileField";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { normalizeContactEmail } from "@/utils/contactValidation";

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const emailFieldId = useId();
  const { t, language } = useLanguageContext();
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = normalizeContactEmail(email);
    if (!normalizedEmail) {
      toast.error(
        email.trim()
          ? t("newsletter.error.invalid")
          : t("newsletter.error.empty"),
      );
      return;
    }

    if (isTurnstileEnabled() && !turnstileToken) {
      toast.error(t("newsletter.error.captcha"));
      return;
    }

    setLoading(true);

    try {
      const result = await subscribeToNewsletter(
        normalizedEmail,
        language,
        "home",
        turnstileToken,
        privacyAccepted,
      );

      if (result.success) {
        toast.success(t("newsletter.success"));
        setEmail("");
        setTurnstileToken("");
        setTurnstileResetKey((key) => key + 1);
        setPrivacyAccepted(false);
      } else {
        const errorMessage = result.error || "";
        if (
          errorMessage.includes("unique constraint") ||
          errorMessage.toLowerCase().includes("już zapisany")
        ) {
          toast.info(t("newsletter.duplicate"));
        } else {
          toast.error(errorMessage || t("newsletter.error.general"));
        }
      }
    } catch (error) {
      logError("newsletterSection.subscribe", error);
      toast.error(t("newsletter.error.unexpected"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.newsletterSection}>
      <SectionReveal>
        <div className={styles.container}>
          <div className={styles.iconWrapper}>
            <Mail size={32} />
          </div>

          <h2 className={styles.title}>{t("newsletter.title")}</h2>
          <p className={styles.description}>{t("newsletter.description")}</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputRow}>
              <label htmlFor={emailFieldId} className="sr-only">
                {t("newsletter.placeholder")}
              </label>
              <input
                id={emailFieldId}
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("newsletter.placeholder")}
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? t("newsletter.submitting") : t("newsletter.submit")}
              </button>
            </div>
            <TurnstileField
              action="newsletter"
              onTokenChange={handleTurnstileToken}
              resetKey={turnstileResetKey}
              className={styles.turnstile}
              loadErrorMessage={t("newsletter.error.captcha")}
            />
            <label className={styles.consent}>
              <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required />
              <span>{t("newsletter.consent")}</span>
            </label>
          </form>

          <p className={styles.disclaimer}>{t("newsletter.disclaimer")}</p>
        </div>
      </SectionReveal>
    </section>
  );
}

export default NewsletterSection;
