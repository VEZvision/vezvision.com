import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  loadSettingsSnapshot,
  defaultSnapshot,
  defaultState,
  readPublicSettingsCache,
  writePublicSettingsCache,
} from "./settings/loaders";
import type {
  SettingsContextType,
  SettingsState,
} from "./SettingsContextDefinition";

export type { SettingsContextType, SettingsState };

const SETTINGS_QUERY_KEY = ["public-settings"] as const;

const SettingsContext = createContext<SettingsContextType>({
  ...defaultState,
  settings: defaultState,
  loading: true,
  error: null,
  degraded: false,
  refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const cachedSnapshot = readPublicSettingsCache();

  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: loadSettingsSnapshot,
    initialData: cachedSnapshot
      ? { ...cachedSnapshot.settings, error: null, degraded: false }
      : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const snapshot = query.data ?? defaultSnapshot;
  const { error, degraded, ...settings } = snapshot;

  const loading = query.isLoading && !query.data;

  useEffect(() => {
    if (!query.data) return;
    const settingsToCache = Object.fromEntries(
      Object.entries(query.data).filter(
        ([key]) => key !== "error" && key !== "degraded",
      ),
    ) as Omit<typeof query.data, "error" | "degraded">;
    writePublicSettingsCache(settingsToCache);
  }, [query.data]);

  const refreshSettings = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const value = useMemo<SettingsContextType>(
    () => ({
      ...settings,
      settings,
      loading,
      error,
      degraded,
      refreshSettings,
    }),
    [settings, loading, error, degraded, refreshSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => useContext(SettingsContext);
