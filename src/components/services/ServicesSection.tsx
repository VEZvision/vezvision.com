import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import SectionBadge from "@/components/ui/SectionBadge";
import { LayoutGrid } from "lucide-react";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useServices } from "@/hooks/useServices";
import ServiceCard from "./ServiceCard";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import {
  SectionReveal,
  StaggerReveal,
  StaggerItem,
} from "@/components/ui/SectionReveal";
import { safeJsonLd } from "@/utils/safeJsonLd";
import { joinUrlPath, safeAbsoluteHttpUrl } from "@/utils/safeHref";
import { useSettings } from "@/hooks/useSettings";
import { SectionLoader } from "@/components/loading";

function ServicesSection() {
  const { t, language } = useLanguageContext();
  const { services, loading, error, getServiceTranslation } = useServices();
  const navigate = useNavigate();
  const { toLocalizedPath } = useLocalizedPath();
  const sectionRef = useRef<HTMLElement>(null);
  const { seo } = useSettings();
  const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl);

  if (loading) {
    return <SectionLoader label={t("common.loading")} />;
  }

  if (error) {
    return (
      <div className="py-24 text-center text-red-600" role="alert">
        {t("services.section.load_error")}: {error}
      </div>
    );
  }

  const servicesJsonLd = services.map((service) => {
    const translation = getServiceTranslation(service, language);
    return {
      "@type": "Service",
      "@id": siteUrl
        ? joinUrlPath(siteUrl, `/${language}/services#${service.slug}`)
        : undefined,
      name: translation?.title || service.slug,
      description:
        translation?.excerpt || translation?.description || undefined,
      provider: {
        "@id": siteUrl ? joinUrlPath(siteUrl, "/#organization") : undefined,
      },
      serviceType: service.categories[0]?.name || undefined,
      offers:
        service.price > 0
          ? {
              "@type": "Offer",
              price: service.price,
              priceCurrency: "PLN",
            }
          : undefined,
      areaServed: ["PL", "EU", "Global"],
    };
  });

  const graph = {
    "@context": "https://schema.org",
    "@graph": servicesJsonLd,
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-1 py-12 md:py-24 lg:py-32 px-4 w-full flex flex-col items-center"
    >
      {services.length > 0 && (
        <Helmet>
          <script type="application/ld+json">{safeJsonLd(graph)}</script>
        </Helmet>
      )}
      <div className="flex flex-col items-center justify-center max-w-7xl w-full gap-8 md:gap-16">
        {/* Header */}
        <SectionReveal className="flex flex-col items-center justify-center w-full max-w-3xl gap-6 text-center">
          <div className="flex items-center justify-center">
            <SectionBadge
              text={t("services.section.badge")}
              icon={<LayoutGrid className="w-3.5 h-3.5" />}
            />
          </div>

          <h2
            id="services-heading"
            className="font-['Inter'] text-4xl md:text-5xl font-bold leading-tight tracking-[-0.02em] text-black"
          >
            {t("services.section.title")}
          </h2>

          <p className="font-['Inter'] text-lg text-gray-600 max-w-2xl leading-relaxed">
            {t("services.section.subtitle")}
          </p>
        </SectionReveal>

        {/* Services Grid */}
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {services.map((service) => {
            const translation = getServiceTranslation(service, language);
            return (
              <StaggerItem key={service.id}>
                <ServiceCard
                  title={translation?.title || service.slug}
                  description={
                    translation?.excerpt || translation?.description || ""
                  }
                  className="hover:scale-[1.01] transition-transform duration-300"
                  icon={service.icon}
                />
              </StaggerItem>
            );
          })}
        </StaggerReveal>

        {/* CTA Section */}
        <SectionReveal
          delay={0.15}
          className="w-full max-w-4xl bg-linear-to-br from-gray-50 to-gray-100 rounded-3xl p-12 text-center shadow-[inset_0_3px_1px_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.05)] border border-gray-100"
        >
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <h3 className="font-['Inter'] text-2xl font-semibold text-black tracking-[-0.01em]">
              {t("services.section.cta.title")}
            </h3>
            <p className="font-['Inter'] text-base text-gray-600">
              {t("services.section.cta.desc")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => navigate(toLocalizedPath("contact"))}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-xs"
              >
                {t("services.section.cta.primary")}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="stroke-current stroke-2"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigate(toLocalizedPath("portfolio"))}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 font-medium hover:border-black hover:bg-white transition-all"
              >
                {t("services.section.cta.secondary")}
              </button>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

export default ServicesSection;
