import PageSeo from "@/components/seo/PageSeo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/seo/Breadcrumbs";
import LegalMarkdown from "@/components/legal/LegalMarkdown";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useLegalContent } from "@/hooks/useLegalContent";
import { SectionLoader } from "@/components/loading";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { useState, useEffect } from "react";
import type { LegalTemplates } from "@/data/legalTemplates";

const CookiePolicy = () => {
  const { t, language } = useLanguageContext();
  const { content, title, loading, lastUpdated } = useLegalContent(
    "cookie_policy",
    language,
  );
  const [templates, setTemplates] = useState<LegalTemplates | null>(null);

  useEffect(() => {
    if (!loading && !content) {
      void import("@/data/legalTemplates").then((m) => {
        setTemplates(m.LEGAL_TEMPLATES);
      });
    }
  }, [loading, content]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <SectionLoader label={t("common.loading")} />
      </div>
    );
  }

  const fallbackContent =
    language === "en"
      ? templates?.cookie_policy.en
      : templates?.cookie_policy.pl;
  const fallbackTitle =
    language === "en" ? "Cookie Policy" : "Polityka Plików Cookies";
  const renderedContent = content || fallbackContent || "";
  const renderedTitle = title || fallbackTitle;
  const effectiveDate = lastUpdated
    ? new Date(lastUpdated)
    : new Date("2026-03-31");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t("nav.home"), href: "/" },
    { label: renderedTitle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <PageSeo pageKey="cookie-policy" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <SectionReveal className="bg-white rounded-lg shadow-lg p-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {renderedTitle}
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            {t("cookiePolicy.lastUpdated")}: {formatDate(effectiveDate)}
          </p>

          <div className="prose max-w-none">
            <LegalMarkdown content={renderedContent} />
          </div>
        </SectionReveal>
      </div>
    </div>
  );
};

export default CookiePolicy;
