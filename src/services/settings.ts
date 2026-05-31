import { supabase } from '@/lib/supabase'
import { safeAbsoluteHttpUrl, safeExternalHref, safeImageUrl, safePublicHref } from '@/utils/safeHref'

export interface ContactSettings {
  email: string
  phone: string
  address: string
  addressLine1: string
  city: string
  postalCode: string
  country: string
}

export interface SocialSettings {
  facebook: string
  instagram: string
  linkedin: string
  github: string
  x: string
}

export interface SeoSettings {
  siteTitle: string
  siteDescription: string
  keywords: string[]
  siteUrl: string
  robots: string
  ogSiteName: string
}

export interface MaintenanceSettings {
  enabled: boolean
  message: string
  description: string
  allowedIps: string[]
}

export interface SeoFilesSettings {
  robotsTxt: string
  sitemapXml: string
}

export interface IdentitySettings {
  siteName: string
  logoUrl: string
  faviconUrl: string
  defaultOgImageUrl: string
}

export interface CodeInjectionSettings {
  head: string
  body: string
}

export interface CompanySettings {
  legalName: string
  krs: string
  nip: string
  regon: string
}

interface LocalizedLinkItem {
  id: string
  href: string
  labelPl: string
  labelEn: string
  enabled: boolean
}

export interface NavigationSettings {
  items: LocalizedLinkItem[]
  contactButtonLabelPl: string
  contactButtonLabelEn: string
  contactButtonHref: string
}

export interface FooterSettings {
  subtitlePl: string
  subtitleEn: string
  taglinePl: string
  taglineEn: string
  ctaLabelPl: string
  ctaLabelEn: string
  ctaHref: string
  legalLinks: LocalizedLinkItem[]
}

export interface PublicSiteSettings {
  identity: IdentitySettings
  contact: ContactSettings
  social: SocialSettings
  seo: SeoSettings
  code: CodeInjectionSettings
  maintenance: MaintenanceSettings
  seo_files: SeoFilesSettings
  company: CompanySettings
  navigation: NavigationSettings
  footer: FooterSettings
}

export interface SettingEntry {
  key: string
  value: unknown
  updated_at: string
}

const PUBLIC_SETTINGS_KEYS = [
  'site_identity',
  'contact',
  'social',
  'seo',
  'code_injection',
  'maintenance_mode',
  'seo_files',
  'company',
  'navigation',
  'footer',
] as const

const EMPTY_PUBLIC_SETTINGS: PublicSiteSettings = {
  identity: {
    siteName: '',
    logoUrl: '',
    faviconUrl: '',
    defaultOgImageUrl: '',
  },
  contact: {
    email: '',
    phone: '',
    address: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
  },
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    github: '',
    x: '',
  },
  seo: {
    siteTitle: '',
    siteDescription: '',
    keywords: [],
    siteUrl: '',
    robots: '',
    ogSiteName: '',
  },
  code: {
    head: '',
    body: '',
  },
  maintenance: {
    enabled: false,
    message: '',
    description: '',
    allowedIps: [],
  },
  seo_files: {
    robotsTxt: '',
    sitemapXml: '',
  },
  company: {
    legalName: '',
    krs: '',
    nip: '',
    regon: '',
  },
  navigation: {
    items: [],
    contactButtonLabelPl: '',
    contactButtonLabelEn: '',
    contactButtonHref: '',
  },
  footer: {
    subtitlePl: '',
    subtitleEn: '',
    taglinePl: '',
    taglineEn: '',
    ctaLabelPl: '',
    ctaLabelEn: '',
    ctaHref: '',
    legalLinks: [],
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : []
}

function asBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false
}

function normalizeLocalizedLinkItems(value: unknown): LocalizedLinkItem[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item, index) => {
    if (!isRecord(item)) return []

    const href = safePublicHref(item.href)
    const labelPl = asString(item.labelPl)
    const labelEn = asString(item.labelEn)

    if (!href || !labelPl) return []

    return [{
      id: asString(item.id) || `link-${index}`,
      href,
      labelPl,
      labelEn,
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    }]
  })
}

function normalizeAddress(record: Record<string, unknown>): ContactSettings {
  const address = asString(record.address)
  const addressLine1 = asString(record.addressLine1)
  const city = asString(record.city)
  const postalCode = asString(record.postalCode)
  const country = asString(record.country)

  const computedAddress = address || [addressLine1, city].filter(Boolean).join(', ')

  return {
    email: asString(record.email),
    phone: asString(record.phone),
    address: computedAddress,
    addressLine1,
    city,
    postalCode,
    country,
  }
}

function normalizeIdentity(value: unknown): IdentitySettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.identity

  return {
    siteName: asString(value.siteName),
    logoUrl: safeImageUrl(value.logoUrl),
    faviconUrl: safeImageUrl(value.faviconUrl),
    defaultOgImageUrl: safeImageUrl(value.defaultOgImageUrl),
  }
}

function normalizeContact(value: unknown): ContactSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.contact
  return normalizeAddress(value)
}

function normalizeSocial(value: unknown): SocialSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.social

  return {
    facebook: safeExternalHref(value.facebook),
    instagram: safeExternalHref(value.instagram),
    linkedin: safeExternalHref(value.linkedin),
    github: safeExternalHref(value.github),
    x: safeExternalHref(value.x),
  }
}

function normalizeSeo(value: unknown): SeoSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.seo

  return {
    siteTitle: asString(value.siteTitle),
    siteDescription: asString(value.siteDescription),
    keywords: asStringArray(value.keywords),
    siteUrl: safeAbsoluteHttpUrl(value.siteUrl),
    robots: asString(value.robots),
    ogSiteName: asString(value.ogSiteName),
  }
}

function normalizeCodeInjection(value: unknown): CodeInjectionSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.code

  return {
    head: asString(value.head),
    body: asString(value.body),
  }
}

function normalizeMaintenance(value: unknown): MaintenanceSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.maintenance

  return {
    enabled: asBoolean(value.enabled),
    message: asString(value.message),
    description: asString(value.description),
    allowedIps: asStringArray(value.allowedIps),
  }
}

function normalizeSeoFiles(value: unknown): SeoFilesSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.seo_files

  return {
    robotsTxt: asString(value.robotsTxt),
    sitemapXml: asString(value.sitemapXml),
  }
}

function normalizeCompany(value: unknown): CompanySettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.company

  return {
    legalName: asString(value.legalName),
    krs: asString(value.krs),
    nip: asString(value.nip),
    regon: asString(value.regon),
  }
}

function normalizeNavigation(value: unknown): NavigationSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.navigation

  return {
    items: normalizeLocalizedLinkItems(value.items),
    contactButtonLabelPl: asString(value.contactButtonLabelPl),
    contactButtonLabelEn: asString(value.contactButtonLabelEn),
    contactButtonHref: safePublicHref(value.contactButtonHref),
  }
}

function normalizeFooter(value: unknown): FooterSettings {
  if (!isRecord(value)) return EMPTY_PUBLIC_SETTINGS.footer

  return {
    subtitlePl: asString(value.subtitlePl),
    subtitleEn: asString(value.subtitleEn),
    taglinePl: asString(value.taglinePl),
    taglineEn: asString(value.taglineEn),
    ctaLabelPl: asString(value.ctaLabelPl),
    ctaLabelEn: asString(value.ctaLabelEn),
    ctaHref: safePublicHref(value.ctaHref),
    legalLinks: normalizeLocalizedLinkItems(value.legalLinks),
  }
}

export function normalizeSettingsEntries(entries: SettingEntry[]): PublicSiteSettings {
  const settingsMap = new Map(entries.map((entry) => [entry.key, entry.value]))

  return {
    identity: normalizeIdentity(settingsMap.get('site_identity')),
    contact: normalizeContact(settingsMap.get('contact')),
    social: normalizeSocial(settingsMap.get('social')),
    seo: normalizeSeo(settingsMap.get('seo')),
    code: normalizeCodeInjection(settingsMap.get('code_injection')),
    maintenance: normalizeMaintenance(settingsMap.get('maintenance_mode')),
    seo_files: normalizeSeoFiles(settingsMap.get('seo_files')),
    company: normalizeCompany(settingsMap.get('company')),
    navigation: normalizeNavigation(settingsMap.get('navigation')),
    footer: normalizeFooter(settingsMap.get('footer')),
  }
}

export async function getSettings(key: 'ALL'): Promise<{ data: SettingEntry[] }>
export async function getSettings(key: string): Promise<unknown | null>
export async function getSettings(key: string): Promise<{ data: SettingEntry[] } | unknown | null> {
  if (key === 'ALL') {
    const { data, error } = await supabase
      .from('vv_site_settings')
      .select('key, value, updated_at')
      .eq('is_public', true)
      .in('key', [...PUBLIC_SETTINGS_KEYS])

    if (error) {
      throw new Error(`Failed to fetch public site settings: ${error.message}`)
    }

    return { data: (data ?? []) as SettingEntry[] }
  }

  const { data, error } = await supabase
    .from('vv_site_settings')
    .select('value')
    .eq('key', key)
    .eq('is_public', true)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch setting '${key}': ${error.message}`)
  }

  return data?.value ?? null
}

/**
 * Admin-only helper. Public site context does not expose this API.
 * Upsert updates value only and preserves the existing `is_public` flag.
 */
export async function saveSettings(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('vv_site_settings')
    .upsert({ key, value: value as import('@/types/database.types').Json }, { onConflict: 'key' })

  if (error) {
    throw new Error(`Failed to save setting '${key}': ${error.message}`)
  }
}
