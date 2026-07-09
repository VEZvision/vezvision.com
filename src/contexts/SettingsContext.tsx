import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  readPublicSettingsCache,
  writePublicSettingsCache,
  writeMaintenanceFlagToCache,
} from "@/lib/publicSettingsCache";
import type {
  SettingsContextType,
  SettingsState,
} from "./SettingsContextDefinition";
import { defaultSnapshot, defaultState } from "./SettingsContextDefinition";
import { scheduleAfterWindowLoad } from "@/lib/scheduleAfterWindowLoad";

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
  const [canFetch, setCanFetch] = useState(false);

  useEffect(() => scheduleAfterWindowLoad(() => setCanFetch(true), 5000), []);

  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { loadSettingsSnapshot } = await import("./settings/loaders");
      return loadSettingsSnapshot();
    },
    enabled: canFetch,
    initialData: cachedSnapshot
      ? { ...cachedSnapshot.settings, error: null, degraded: false }
      : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const queryData = query.data;
  const snapshot = queryData ?? defaultSnapshot;
  const error = snapshot.error;
  const degraded = snapshot.degraded;
  const settings = useMemo(() => {
    const {
      error: _error,
      degraded: _degraded,
      ...settingsSnapshot
    } = snapshot;
    return settingsSnapshot;
  }, [snapshot]);

  const loading = canFetch && query.isLoading && !query.data;

  useEffect(() => {
    if (!queryData) return;
    const {
      error: _error,
      degraded: _degraded,
      ...settingsToCache
    } = queryData;
    writePublicSettingsCache(settingsToCache);
    if (queryData.maintenance) {
      writeMaintenanceFlagToCache(queryData.maintenance.enabled);
    }
  }, [queryData]);

  const { refetch } = query;
  const refreshSettings = useCallback(async () => {
    await refetch();
  }, [refetch]);

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
