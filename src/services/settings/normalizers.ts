import {
  safeAbsoluteHttpUrl,
  safeExternalHref,
  safeImageUrl,
  safePublicHref,
} from "@/utils/safeHref";
import type {
  CompanySettings,
  ContactSettings,
  FooterSettings,
  IdentitySettings,
  LocalizedLinkItem,
  MaintenanceSettings,
  NavigationSettings,
  PublicSiteSettings,
  SeoFilesSettings,
  SeoSettings,
  SocialSettings,
  SettingEntry,
} from "./types";
import { EMPTY_PUBLIC_SETTINGS } from "./defaults";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function asBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function normalizeLocalizedLinkItems(value: unknown): LocalizedLinkItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];

    const href = safePublicHref(item.href);
    const labelPl = asString(item.labelPl);
    const labelEn = asString(item.labelEn);

    if (!href || !labelPl) return [];

    return [
      {
        id: asString(item.id) || `link-${index}`,
        href,
        labelPl,
        labelEn,
        enabled: typeof item.enabled === "boolean" ? item.enabled : true,
      },
    ];
  });
}

function normalizeAddress(record: Record<string, unknown>): ContactSettings {
  const address = asString(record.address);
  const addressLine1 = asString(record.addressLine1);
  const city = asString(record.city);
  const postalCode = asString(record.postalCode);
  const country = asString(record.country);

  const computedAddress =
    address || [addressLine1, city].filter(Boolean).join(", ");

  return {
    email: asString(record.email),
    phone: asString(record.phone),
    address: computedAddress,
    addressLine1,
    city,
    postalCode,
    country,
  };
}

function normalizeIdentity(value: unknown): IdentitySettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.identity;
  return {
    siteName: asString(value.siteName),
    logoUrl: safeImageUrl(value.logoUrl),
    faviconUrl: safeImageUrl(value.faviconUrl),
    defaultOgImageUrl: safeImageUrl(value.defaultOgImageUrl),
  };
}

function normalizeContact(value: unknown): ContactSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.contact;
  return normalizeAddress(value);
}

function normalizeSocial(value: unknown): SocialSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.social;
  return {
    facebook: safeExternalHref(value.facebook),
    instagram: safeExternalHref(value.instagram),
    linkedin: safeExternalHref(value.linkedin),
    github: safeExternalHref(value.github),
    x: safeExternalHref(value.x),
  };
}

function normalizeSeo(value: unknown): SeoSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.seo;
  return {
    siteTitle: asString(value.siteTitle),
    siteDescription: asString(value.siteDescription),
    keywords: asStringArray(value.keywords),
    siteUrl: safeAbsoluteHttpUrl(value.siteUrl),
    robots: asString(value.robots),
    ogSiteName: asString(value.ogSiteName),
  };
}

function normalizeMaintenance(value: unknown): MaintenanceSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.maintenance;
  return {
    enabled: asBoolean(value.enabled),
    message: asString(value.message),
    description: asString(value.description),
  };
}

function normalizeSeoFiles(value: unknown): SeoFilesSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.seo_files;
  return {
    robotsTxt: asString(value.robotsTxt),
    sitemapXml: asString(value.sitemapXml),
  };
}

function normalizeCompany(value: unknown): CompanySettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.company;
  return {
    legalName: asString(value.legalName),
    krs: asString(value.krs),
    nip: asString(value.nip),
    regon: asString(value.regon),
  };
}

function normalizeNavigation(value: unknown): NavigationSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.navigation;
  return {
    items: normalizeLocalizedLinkItems(value.items),
    contactButtonLabelPl: asString(value.contactButtonLabelPl),
    contactButtonLabelEn: asString(value.contactButtonLabelEn),
    contactButtonHref: safePublicHref(value.contactButtonHref),
  };
}

function normalizeFooter(value: unknown): FooterSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.footer;
  return {
    subtitlePl: asString(value.subtitlePl),
    subtitleEn: asString(value.subtitleEn),
    taglinePl: asString(value.taglinePl),
    taglineEn: asString(value.taglineEn),
    ctaLabelPl: asString(value.ctaLabelPl),
    ctaLabelEn: asString(value.ctaLabelEn),
    ctaHref: safePublicHref(value.ctaHref),
    legalLinks: normalizeLocalizedLinkItems(value.legalLinks),
  };
}

export function normalizeSettingsEntries(
  entries: SettingEntry[],
): PublicSiteSettings {
  const settingsMap = new Map(entries.map((entry) => [entry.key, entry.value]));
  return {
    identity: normalizeIdentity(settingsMap.get("site_identity")),
    contact: normalizeContact(settingsMap.get("contact")),
    social: normalizeSocial(settingsMap.get("social")),
    seo: normalizeSeo(settingsMap.get("seo")),
    maintenance: normalizeMaintenance(settingsMap.get("maintenance_mode")),
    seo_files: normalizeSeoFiles(settingsMap.get("seo_files")),
    company: normalizeCompany(settingsMap.get("company")),
    navigation: normalizeNavigation(settingsMap.get("navigation")),
    footer: normalizeFooter(settingsMap.get("footer")),
  };
}
