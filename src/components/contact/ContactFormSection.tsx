import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Loader2, Send } from "lucide-react";
import styles from "./ContactFormSection.module.scss";
import SectionHeader from "@/components/ui/SectionHeader";
import { useSettings } from "@/hooks/useSettings";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import {
  frontendContactFormSchema,
  type FrontendContactFormInput,
} from "@shared/contactSchema";
import {
  ContactFormError,
  submitContactForm,
  type ContactSubmissionPayload,
} from "@/services/contact";
import { logError } from "@/lib/logger";
import TurnstileField from "@/components/security/TurnstileField";
import { isTurnstileEnabled } from "@/lib/turnstile";
import { ContactInfoCards } from "./ContactInfoCards";
import type { LanguageContextType } from "@/hooks/useLanguage";

interface Props {
  t: LanguageContextType["t"];
}

function ContactFormSection({ t }: Props) {
  const { toLocalizedPath } = useLocalizedPath();
  const {
    contact,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const { language } = useLanguageContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FrontendContactFormInput>({
    resolver: zodResolver(frontendContactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      consent: false,
    },
  });

  const handleTurnstileToken = useCallback(
    (token: string) => setTurnstileToken(token),
    [],
  );

  const onSubmit = async (data: FrontendContactFormInput) => {
    if (isTurnstileEnabled() && !turnstileToken) {
      toast.error(t("contact.form.error.captcha"));
      return;
    }

    setIsSubmitting(true);
    const payload: ContactSubmissionPayload = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      language,
      ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
    };

    try {
      await submitContactForm(payload);
      reset();
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);
      toast.success(t("contact.form.success"));
    } catch (err) {
      logError("contactForm.submit", err);
      if (err instanceof ContactFormError) {
        toast.error(err.message);
      } else {
        toast.error(err instanceof Error ? err.message : t("common.error"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (name: keyof typeof errors) =>
    `${styles.fieldInput} ${errors[name] ? styles.error : ""}`;

  const hasContact = contact != null && !settingsError;

  return (
    <section
      id="contact-form-section"
      className={styles.sectionContactContainer}
    >
      <div>
        <SectionHeader
          badgeText={t("contact.form.badge")}
          badgeIcon={<Mail className="w-3.5 h-3.5" />}
          title={
            <>
              {t("contact.form.title.line1")}{" "}
              <span className="font-sans font-semibold">
                {t("contact.form.title.line2.italic")}
              </span>
            </>
          }
          subtitle={t("contact.form.subtitle")}
          className="mb-16"
        />
      </div>

      <div className={styles.section}>
        <ContactInfoCards
          t={t}
          contact={{
            email: contact?.email ?? "",
            phone: contact?.phone ?? null,
            address: contact?.address ?? null,
          }}
          loading={settingsLoading}
          hasContact={hasContact}
        />

        <form
          className={styles.formContainer}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="contact-fullName">
              {t("contact.form.label.fullName")}
            </label>
            <input
              id="contact-fullName"
              type="text"
              {...register("fullName")}
              className={fieldClass("fullName")}
              placeholder={t("contact.form.placeholder.fullName")}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "contact-fullName-error" : undefined
              }
            />
            {errors.fullName && (
              <span
                id="contact-fullName-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.fullName.message ? t(errors.fullName.message) : ""}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="contact-email">
              {t("contact.form.label.email")}
            </label>
            <input
              id="contact-email"
              type="email"
              {...register("email")}
              className={fieldClass("email")}
              placeholder={t("contact.form.placeholder.email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "contact-email-error" : undefined
              }
            />
            {errors.email && (
              <span
                id="contact-email-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.email.message ? t(errors.email.message) : ""}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="contact-phone">
              {t("contact.form.label.phoneOptional")}
            </label>
            <input
              id="contact-phone"
              type="tel"
              {...register("phone")}
              className={`${styles.fieldInput} ${errors.phone ? styles.error : ""}`}
              placeholder={contact?.phone || ""}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? "contact-phone-error" : undefined
              }
            />
            {errors.phone && (
              <span
                id="contact-phone-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.phone.message ? t(errors.phone.message) : ""}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="contact-subject">
              {t("contact.form.label.subject")}
            </label>
            <input
              id="contact-subject"
              type="text"
              {...register("subject")}
              className={fieldClass("subject")}
              placeholder={t("contact.form.placeholder.subject")}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "contact-subject-error" : undefined
              }
            />
            {errors.subject && (
              <span
                id="contact-subject-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.subject.message ? t(errors.subject.message) : ""}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="contact-message">
              {t("contact.form.label.message")}
            </label>
            <textarea
              id="contact-message"
              {...register("message")}
              className={`${styles.fieldTextarea} ${errors.message ? styles.error : ""}`}
              placeholder={t("contact.form.placeholder.message")}
              rows={4}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
            />
            {errors.message && (
              <span
                id="contact-message-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.message.message ? t(errors.message.message) : ""}
              </span>
            )}
          </div>

          <div className={`${styles.formField} !mb-6`}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                id="contact-consent"
                type="checkbox"
                {...register("consent")}
                className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={
                  errors.consent ? "contact-consent-error" : undefined
                }
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                {t("contact.form.consent")}{" "}
                <Link
                  to={toLocalizedPath("privacy-policy")}
                  className="underline hover:text-black"
                >
                  {t("footer.legal.privacy")}
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <span
                id="contact-consent-error"
                className={styles.errorMessage}
                role="alert"
              >
                {errors.consent.message ? t(errors.consent.message) : ""}
              </span>
            )}
          </div>

          <TurnstileField
            onTokenChange={handleTurnstileToken}
            resetKey={turnstileResetKey}
            className="mb-4"
            loadErrorMessage={t("contact.form.error.captcha")}
          />

          <button
            type="submit"
            className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                <span>{t("common.saving") || "Wysyłanie..."}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" strokeWidth={2.5} />
                <span>{t("contact.form.submit")}</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactFormSection;
