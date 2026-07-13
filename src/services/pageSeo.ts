import { getSupabase } from "@/lib/supabase";

export interface PageSeoEntry {
  page_key: string;
  title_pl: string;
  title_en: string;
  description_pl: string;
  description_en: string;
  og_title_pl: string;
  og_title_en: string;
  og_description_pl: string;
  og_description_en: string;
  og_image_url: string;
  canonical_url: string;
  robots: string;
  indexable: boolean;
  structured_data_json: string;
}

export type PageSeoMap = Record<string, PageSeoEntry>;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

export function normalizePageSeoEntries(entries: unknown[]): PageSeoMap {
  return entries.reduce<PageSeoMap>((acc, entry) => {
    if (!entry || typeof entry !== "object") return acc;

    const record = entry as Record<string, unknown>;
    const pageKey = asString(record.page_key);
    if (!pageKey) return acc;

    acc[pageKey] = {
      page_key: pageKey,
      title_pl: asString(record.title_pl),
      title_en: asString(record.title_en),
      description_pl: asString(record.description_pl),
      description_en: asString(record.description_en),
      og_title_pl: asString(record.og_title_pl),
      og_title_en: asString(record.og_title_en),
      og_description_pl: asString(record.og_description_pl),
      og_description_en: asString(record.og_description_en),
      og_image_url: asString(record.og_image_url),
      canonical_url: asString(record.canonical_url),
      robots: asString(record.robots),
      indexable: asBoolean(record.indexable),
      structured_data_json: asString(record.structured_data_json),
    };

    return acc;
  }, {});
}

export async function getAllPageSeo(): Promise<PageSeoMap> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vv_page_seo")
    .select(
      "page_key,title_pl,title_en,description_pl,description_en,og_title_pl,og_title_en,og_description_pl,og_description_en,og_image_url,canonical_url,robots,indexable,structured_data_json",
    )
    .eq("is_public", true);

  if (error) {
    throw new Error(`Failed to fetch page SEO entries: ${error.message}`);
  }

  return normalizePageSeoEntries(data ?? []);
}
