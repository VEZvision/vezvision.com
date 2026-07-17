import { useCallback, useState, type FormEvent } from "react";
import { Palette, GraduationCap, Briefcase, Cpu } from "lucide-react";
import { toast } from "sonner";

import SectionHeader from "@/components/ui/SectionHeader";
import {
  SectionReveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/ui/SectionReveal";
import { useLanguageContext } from "@/hooks/useLanguage";
import { subscribeToNewsletter } from "@/services/newsletter";
import TurnstileField from "@/components/security/TurnstileField";
import { isTurnstileEnabled } from "@/lib/turnstile";

export default function ProductsCatalogSection() {
  const { t, language } = useLanguageContext();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  const handleNewsletterSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error(t("products.newsletter.error.email"));
      return;
    }
    if (isTurnstileEnabled() && !turnstileToken) {
      toast.error(t("newsletter.error.captcha"));
      return;
    }

    setIsSubmitting(true);
    const result = await subscribeToNewsletter(email, language, "products", turnstileToken, privacyAccepted);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(t("products.newsletter.success"));
      setEmail("");
      setPrivacyAccepted(false);
      setTurnstileToken("");
      setTurnstileResetKey((key) => key + 1);
      return;
    }

    toast.error(result.error || t("products.newsletter.error.generic"));
  };

  return (
    <div className="relative z-10 grow px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 text-center">
          <SectionReveal>
            <SectionHeader
              badgeText={t("products.badge")}
              title={
                <>
                  {t("products.title.line1")}{" "}
                  <span className="font-sans font-normal">
                    {t("products.title.line2.italic")}
                  </span>
                </>
              }
              subtitle={t("products.subtitle")}
              className="mb-16"
            />
          </SectionReveal>

          <StaggerReveal className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Palette, key: "products.category.creative" },
              { icon: GraduationCap, key: "products.category.educational" },
              { icon: Briefcase, key: "products.category.business" },
              { icon: Cpu, key: "products.category.technology" },
            ].map((category) => (
              <StaggerItem key={category.key}>
                <div className="group rounded-[14px] border border-slate-200/80 bg-white/65 p-6 shadow-xs transition-shadow hover:shadow-md">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-[12px] bg-slate-100/80 p-3 transition-colors group-hover:bg-black/5">
                      <category.icon
                        className="h-8 w-8 text-gray-900"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {t(category.key)}
                  </h3>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <SectionReveal delay={0.16}>
            <div className="mx-auto max-w-4xl rounded-[18px] border border-slate-200/80 bg-white/65 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_34px_rgba(16,24,40,0.06)] md:p-12">
              <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className="text-left">
                  <h2 className="mb-4 text-2xl font-normal text-gray-900">
                    {t("products.card.title")}
                  </h2>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    {t("products.card.text")}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    {t("products.coming.subtitle")}
                  </div>
                </div>

                <div className="rounded-[14px] border border-slate-200/80 bg-slate-50/80 p-6">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {t("products.notify.prompt")}
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    {t("products.newsletter.desc")}
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("products.newsletter.placeholder")}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-black"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting
                        ? t("products.newsletter.button.subscribing")
                        : t("products.notify.button")}
                    </button>
                    <TurnstileField action="newsletter" onTokenChange={handleTurnstileToken} resetKey={turnstileResetKey} loadErrorMessage={t("newsletter.error.captcha")} />
                    <label className="flex items-start gap-2 text-left text-xs text-gray-600">
                      <input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required />
                      <span>{t("newsletter.consent")}</span>
                    </label>
                  </form>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
