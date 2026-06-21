import type { PublicSiteSettings } from "./types";

export const PUBLIC_SETTINGS_KEYS = [
  "site_identity",
  "contact",
  "social",
  "seo",
  "maintenance_mode",
  "seo_files",
  "company",
  "navigation",
  "footer",
] as const;

export const EMPTY_PUBLIC_SETTINGS: PublicSiteSettings = {
  identity: {
    siteName: "",
    logoUrl: "",
    faviconUrl: "",
    defaultOgImageUrl: "",
  },
  contact: {
    email: "",
    phone: "",
    address: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "",
  },
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    github: "",
    x: "",
  },
  seo: {
    siteTitle: "",
    siteDescription: "",
    keywords: [],
    siteUrl: "",
    robots: "",
    ogSiteName: "",
  },
  maintenance: {
    enabled: false,
    message: "",
    description: "",
  },
  seo_files: {
    robotsTxt: "",
    sitemapXml: "",
  },
  company: {
    legalName: "",
    krs: "",
    nip: "",
    regon: "",
  },
  navigation: {
    items: [],
    contactButtonLabelPl: "",
    contactButtonLabelEn: "",
    contactButtonHref: "",
  },
  footer: {
    subtitlePl: "",
    subtitleEn: "",
    taglinePl: "",
    taglineEn: "",
    ctaLabelPl: "",
    ctaLabelEn: "",
    ctaHref: "",
    legalLinks: [],
  },
};
