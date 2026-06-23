import type { FC } from "react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./FaqSection.module.css";
import { useLanguageContext } from "@/hooks/useLanguage";
import SectionHeader from "@/components/ui/SectionHeader";
import { MessageSquare } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Helmet } from "react-helmet-async";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { safeJsonLd } from "@/utils/safeJsonLd";
import { sanitizeCmsHtml } from "@/utils/sanitizeCmsHtml";
import { stripHtmlForJsonLd } from "@/utils/stripHtmlForJsonLd";
import { useFaqItems } from "@/hooks/useFaqItems";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

import { ChevronDown, Mail } from "lucide-react";

interface FaqSectionProps {
  showContactCta?: boolean;
}

const FaqSection: FC<FaqSectionProps> = ({ showContactCta = true }) => {
  const reducedMotion = useReducedMotion();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const { t, language } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();
  const { data: dbFaqItems = [], isLoading: faqLoading } =
    useFaqItems(language);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };
  const { contact, loading: settingsLoading, error } = useSettings();
  const contactEmail = contact?.email || "";

  const title = (
    <>
      {t("faq.title.line1")}{" "}
      <span className="font-sans font-semibold">
        {t("faq.title.line2.italic")}
      </span>
    </>
  );

  const faqItems = useMemo(() => {
    const fallbackItems = [1, 2, 3, 4, 5, 6, 7].map((index) => ({
      id: `faq-${index}`,
      question: t(`faq.q${index}`),
      answer: t(`faq.a${index}`),
    }));

    if (dbFaqItems.length > 0) return dbFaqItems;
    return fallbackItems;
  }, [dbFaqItems, t]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtmlForJsonLd(item.answer),
      },
    })),
  };

  return (
    <section className={styles.faqSection} aria-labelledby="faq-heading">
      <SectionHeader
        id="faq-heading"
        badgeText={t("faq.badge")}
        badgeIcon={<MessageSquare className="w-3.5 h-3.5" />}
        title={title}
        subtitle={t("faq.subtitle")}
        className="mb-16"
      />

      <SectionReveal className={styles.accordion} delay={0.1}>
        <Helmet>
          <script type="application/ld+json">{safeJsonLd(jsonLd)}</script>
        </Helmet>

        <div className="w-full flex flex-col gap-6 mb-8">
          <div className="space-y-4">
            {faqLoading && faqItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t("faq.loading")}
              </div>
            )}
            {faqItems.map((faq) => {
              const isOpen = openItem === faq.id;

              return (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white cursor-pointer select-none focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-lg font-medium text-gray-900 pr-8">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`${styles.chevron} w-5 h-5 ${isOpen ? styles.chevronOpen : ""}`}
                      style={
                        reducedMotion
                          ? { transform: isOpen ? "rotate(180deg)" : undefined }
                          : undefined
                      }
                    />
                  </button>

                  {reducedMotion ? (
                    isOpen ? (
                      <div className="px-5 pb-5 pt-0">
                        <div
                          className="prose prose-sm max-w-none text-gray-600 prose-a:text-blue-600 border-t border-gray-100 pt-4"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeCmsHtml(faq.answer),
                          }}
                        />
                      </div>
                    ) : null
                  ) : (
                    <div
                      className={`${styles.answerPanel} ${isOpen ? styles.answerPanelOpen : ""}`}
                      aria-hidden={!isOpen}
                    >
                      <div className={styles.answerPanelInner}>
                        <div className="px-5 pb-5 pt-0">
                          <div
                            className="prose prose-sm max-w-none text-gray-600 prose-a:text-blue-600 border-t border-gray-100 pt-4"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeCmsHtml(faq.answer),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {showContactCta && (
        <SectionReveal delay={0.2}>
          <div className={styles.contactRow}>
            <Mail className="w-5 h-5 text-gray-900" />
            <span className={styles.contactText}>
              {t("faq.contact.text")}
              {settingsLoading || (!contact && !error) ? (
                <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse align-middle ml-1" />
              ) : contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  title={t("faq.contact.title")}
                  rel="noopener"
                >
                  {contactEmail}
                </a>
              ) : null}
            </span>
          </div>
          <div className={styles.ctaWrap}>
            <Link
              className={styles.ctaButton}
              to={toLocalizedPath("contact")}
              aria-label={t("faq.cta.aria")}
            >
              <span>{t("nav.contact")}</span>
            </Link>
          </div>
        </SectionReveal>
      )}
    </section>
  );
};

export default FaqSection;
