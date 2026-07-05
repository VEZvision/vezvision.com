import { Helmet } from "react-helmet-async";

import { useSettings } from "@/hooks/useSettings";
import { useLanguageContext } from "@/hooks/useLanguage";
import {
  joinUrlPath,
  safeAbsoluteHttpUrl,
  safeExternalHref,
  safeImageUrl,
} from "@/utils/safeHref";
import { safeJsonLd } from "@/utils/safeJsonLd";
import { SUPPORTED_LOCALES } from "@/routing/routes.config";

export function GlobalJsonLd() {
  const { identity, seo, social, contact, company } = useSettings();
  const { language } = useLanguageContext();

  const siteUrl = safeAbsoluteHttpUrl(seo?.siteUrl);
  const siteName =
    seo?.ogSiteName || identity?.siteName || seo?.siteTitle || "VEZvision";
  const logoUrl =
    safeImageUrl(identity?.logoUrl) ||
    safeImageUrl(identity?.defaultOgImageUrl);
  const description = seo?.siteDescription || "";

  if (!siteUrl) return null;

  const sameAs = [
    safeExternalHref(social?.linkedin),
    safeExternalHref(social?.x),
    safeExternalHref(social?.facebook),
    safeExternalHref(social?.instagram),
    safeExternalHref(social?.github),
  ].filter((href): href is string => Boolean(href));

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": joinUrlPath(siteUrl, "/#organization"),
    name: siteName,
    url: siteUrl,
    description,
    logo: logoUrl ? { "@type": "ImageObject", url: logoUrl } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: [
      "AI integration",
      "Web development",
      "Automation",
      "Product design",
      "UX/UI design",
      "React development",
      "TypeScript",
      "LLM-based features",
      "Business automation",
    ],
  };

  if (company?.legalName) {
    organization.legalName = company.legalName;
  }

  if (contact?.email || contact?.phone) {
    organization.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: contact?.email || undefined,
      telephone: contact?.phone || undefined,
      areaServed: contact?.country || "PL",
      availableLanguage: SUPPORTED_LOCALES.map((locale) =>
        locale === "pl" ? "Polish" : "English",
      ),
    };
  }

  const website: Record<string, unknown> = {
    "@type": "WebSite",
    "@id": joinUrlPath(siteUrl, "/#website"),
    name: siteName,
    url: siteUrl,
    inLanguage: language === "pl" ? "pl-PL" : "en-US",
    publisher: { "@id": joinUrlPath(siteUrl, "/#organization") },
  };

  const graph: Record<string, unknown>[] = [organization, website];

  if (contact?.email || contact?.phone || company?.legalName) {
    const localBusiness: Record<string, unknown> = {
      "@type": "ProfessionalService",
      "@id": joinUrlPath(siteUrl, "/#business"),
      name: company?.legalName || siteName,
      url: siteUrl,
      email: contact?.email || undefined,
      telephone: contact?.phone || undefined,
      address:
        contact?.addressLine1 || contact?.city
          ? {
              "@type": "PostalAddress",
              streetAddress: contact?.addressLine1 || undefined,
              addressLocality: contact?.city || undefined,
              postalCode: contact?.postalCode || undefined,
              addressCountry: contact?.country || "PL",
            }
          : undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    };

    if (company?.nip) localBusiness.taxID = company.nip;
    if (company?.regon) localBusiness.identifier = company.regon;

    graph.push(localBusiness);
  }

  graph.push({
    "@type": "Service",
    "@id": joinUrlPath(siteUrl, "/#service"),
    serviceType: "AI integration, web development, automation",
    provider: { "@id": joinUrlPath(siteUrl, "/#organization") },
    areaServed: ["PL", "EU", "Global"],
    description,
    url: siteUrl,
  });

  return (
    <Helmet>
      <script type="application/ld+json">
        {safeJsonLd({ "@context": "https://schema.org", "@graph": graph })}
      </script>
    </Helmet>
  );
}
