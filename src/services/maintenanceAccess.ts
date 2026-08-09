import { logError } from "@/lib/logger";
import { getApiClient } from "@/lib/api";

export interface MaintenanceAccessSnapshot {
  maintenance: boolean;
  bypass: boolean;
  unavailable: boolean;
}

const ACCESSIBLE: MaintenanceAccessSnapshot = {
  maintenance: false,
  bypass: true,
  unavailable: false,
};

/**
 * PostgREST replacement for the old Supabase Edge Function.
 * Reads the maintenance_mode setting directly from vv_site_settings.
 */
export async function fetchMaintenanceEnabledFromDb(): Promise<boolean | null> {
  const api = getApiClient();
  const { data, error } = await api
    .from<{ value: { enabled?: boolean } }>("vv_site_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    logError("maintenanceAccess.db", error);
    return null;
  }

  const settings = data?.value ?? null;
  return settings?.enabled === true;
}

/**
 * Checks maintenance access via PostgREST.
 * If the database is unreachable, default to accessible (optimistic)
 * so the site stays up during transient DB issues.
 */
export async function fetchMaintenanceAccess(): Promise<MaintenanceAccessSnapshot> {
  try {
    const dbMaintenance = await fetchMaintenanceEnabledFromDb();
    if (dbMaintenance === null) {
      // DB unreachable — be optimistic, don't block the site
      return ACCESSIBLE;
    }
    return {
      maintenance: dbMaintenance,
      bypass: !dbMaintenance,
      unavailable: false,
    };
  } catch (error) {
    logError("maintenanceAccess.fetch", error);
    return ACCESSIBLE;
  }
}

export function isSiteAccessible(
  snapshot: MaintenanceAccessSnapshot,
  settingsMaintenanceEnabled = false,
  dbMaintenanceEnabled: boolean | null = null,
): boolean {
  if (snapshot.unavailable) {
    // If we know maintenance is explicitly enabled in CMS or DB, block
    if (settingsMaintenanceEnabled) return false;
    if (dbMaintenanceEnabled === true) return false;
    // Unknown state — be optimistic, let users in
    return true;
  }

  if (!snapshot.maintenance) return true;
  return snapshot.bypass;
}
