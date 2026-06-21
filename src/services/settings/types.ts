export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  linkedin: string;
  github: string;
  x: string;
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  siteUrl: string;
  robots: string;
  ogSiteName: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  description: string;
}

export interface SeoFilesSettings {
  robotsTxt: string;
  sitemapXml: string;
}

export interface IdentitySettings {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  defaultOgImageUrl: string;
}

export interface CompanySettings {
  legalName: string;
  krs: string;
  nip: string;
  regon: string;
}

export interface LocalizedLinkItem {
  id: string;
  href: string;
  labelPl: string;
  labelEn: string;
  enabled: boolean;
}

export interface NavigationSettings {
  items: LocalizedLinkItem[];
  contactButtonLabelPl: string;
  contactButtonLabelEn: string;
  contactButtonHref: string;
}

export interface FooterSettings {
  subtitlePl: string;
  subtitleEn: string;
  taglinePl: string;
  taglineEn: string;
  ctaLabelPl: string;
  ctaLabelEn: string;
  ctaHref: string;
  legalLinks: LocalizedLinkItem[];
}

export interface PublicSiteSettings {
  identity: IdentitySettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo: SeoSettings;
  maintenance: MaintenanceSettings;
  seo_files: SeoFilesSettings;
  company: CompanySettings;
  navigation: NavigationSettings;
  footer: FooterSettings;
}

export interface SettingEntry {
  key: string;
  value: unknown;
  updated_at: string;
}
