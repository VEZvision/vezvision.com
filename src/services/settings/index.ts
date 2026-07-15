import { getApiClient } from "@/lib/api";
import type { SettingEntry } from "./types";
import { PUBLIC_SETTINGS_KEYS } from "./defaults";

export { normalizeSettingsEntries } from "./normalizers";
export { EMPTY_PUBLIC_SETTINGS, PUBLIC_SETTINGS_KEYS } from "./defaults";
export type {
  ContactSettings,
  SocialSettings,
  SeoSettings,
  MaintenanceSettings,
  SeoFilesSettings,
  IdentitySettings,
  CompanySettings,
  LocalizedLinkItem,
  NavigationSettings,
  FooterSettings,
  PublicSiteSettings,
  SettingEntry,
} from "./types";

export async function getSettings(
  key: "ALL",
): Promise<{ data: SettingEntry[] }>;
export async function getSettings(key: string): Promise<unknown | null>;
export async function getSettings(
  key: string,
): Promise<{ data: SettingEntry[] } | unknown | null> {
  const api = getApiClient();

  if (key === "ALL") {
    const { data, error } = await api
      .from<SettingEntry[]>("vv_site_settings")
      .select("key, value, updated_at")
      .eq("is_public", true)
      .in("key", [...PUBLIC_SETTINGS_KEYS]);

    if (error) {
      throw new Error(`Failed to fetch public site settings: ${error.message}`);
    }

    return { data: data ?? [] };
  }

  const { data, error } = await api
    .from<{ value: unknown }>("vv_site_settings")
    .select("value")
    .eq("key", key)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch setting '${key}': ${error.message}`);
  }

  return data?.value ?? null;
}
