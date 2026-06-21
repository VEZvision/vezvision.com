import type { SettingsState } from "@/contexts/SettingsContext";

const CACHE_KEY = "vez-public-settings-v1";
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAINTENANCE_FLAG_KEY = "vez-maintenance-flag";

export type CachedPublicSettings = {
  savedAt: number;
  settings: SettingsState;
};

/** Maintenance must never be served from cache — gate always needs a fresh flag. */
function stripVolatileSettings(settings: SettingsState): SettingsState {
  return {
    ...settings,
    maintenance: null,
  };
}

export function readPublicSettingsCache(): CachedPublicSettings | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as CachedPublicSettings;
    if (!parsed?.savedAt || !parsed.settings) return undefined;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return undefined;

    return {
      savedAt: parsed.savedAt,
      settings: stripVolatileSettings(parsed.settings),
    };
  } catch {
    return undefined;
  }
}

export function writePublicSettingsCache(settings: SettingsState): void {
  if (typeof window === "undefined") return;

  try {
    const payload: CachedPublicSettings = {
      savedAt: Date.now(),
      settings: stripVolatileSettings(settings),
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode — ignore.
  }
}

export function readMaintenanceFlagFromCache(): boolean | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(MAINTENANCE_FLAG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { enabled: boolean };
    return parsed.enabled === true;
  } catch {
    return null;
  }
}

export function writeMaintenanceFlagToCache(enabled: boolean): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      MAINTENANCE_FLAG_KEY,
      JSON.stringify({ enabled }),
    );
  } catch {
    // Quota or private mode — ignore.
  }
}
