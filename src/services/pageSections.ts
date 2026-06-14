import { getSupabase } from '@/lib/supabase'

export interface PageSectionEntry {
  page_key: string
  section_key: string
  order_index: number
  enabled: boolean
  content_pl: Record<string, string>
  content_en: Record<string, string>
  config: Record<string, string | boolean | number>
  updated_at: string
}

export type PageSectionsMap = Record<string, PageSectionEntry[]>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeStringRecord(value: unknown, prefix = ''): Record<string, string> {
  if (!isRecord(value)) return {}

  const normalizedEntries = Object.entries(value).flatMap(([key, entryValue]) => {
    const normalizedKey = prefix ? `${prefix}.${key}` : key

    if (isRecord(entryValue)) {
      return Object.entries(normalizeStringRecord(entryValue, normalizedKey))
    }

    if (!['string', 'number', 'boolean'].includes(typeof entryValue)) return []

    const trimmedValue = String(entryValue).trim()
    if (!trimmedValue) return []

    return [[normalizedKey, trimmedValue] as const]
  })

  return Object.fromEntries(normalizedEntries)
}

function normalizeConfigRecord(value: unknown): Record<string, string | boolean | number> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => ['string', 'boolean', 'number'].includes(typeof entryValue))
  ) as Record<string, string | boolean | number>
}

export function normalizePageSections(entries: unknown[]): PageSectionsMap {
  const sections = entries.flatMap((entry) => {
    if (!isRecord(entry)) return []

    const pageKey = typeof entry.page_key === 'string' ? entry.page_key : ''
    const sectionKey = typeof entry.section_key === 'string' ? entry.section_key : ''

    if (!pageKey || !sectionKey) return []

    return [{
      page_key: pageKey,
      section_key: sectionKey,
      order_index: typeof entry.order_index === 'number' ? entry.order_index : 0,
      enabled: typeof entry.enabled === 'boolean' ? entry.enabled : true,
      content_pl: normalizeStringRecord(entry.content_pl),
      content_en: normalizeStringRecord(entry.content_en),
      config: normalizeConfigRecord(entry.config),
      updated_at: typeof entry.updated_at === 'string' ? entry.updated_at : '',
    } satisfies PageSectionEntry]
  })

  return sections.reduce<PageSectionsMap>((acc, section) => {
    acc[section.page_key] ??= []
    acc[section.page_key].push(section)
    acc[section.page_key].sort((left, right) => left.order_index - right.order_index)
    return acc
  }, {})
}

export function flattenCmsTranslations(pageSections: PageSectionsMap) {
  return Object.values(pageSections).flat().reduce(
    (acc, section) => {
      Object.assign(acc.pl, section.content_pl)
      Object.assign(acc.en, section.content_en)
      return acc
    },
    { pl: {} as Record<string, string>, en: {} as Record<string, string> }
  )
}

export async function getPublicPageSections(): Promise<{ data: unknown[]; error: string | null }> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('vv_page_sections')
    .select('page_key,section_key,order_index,enabled,content_pl,content_en,config,updated_at')
    .eq('is_public', true)
    .order('page_key', { ascending: true })
    .order('order_index', { ascending: true })

  return { data: data ?? [], error: error?.message ?? null }
}
