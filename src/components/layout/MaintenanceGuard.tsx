import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import AppBootShell from "@/components/layout/AppBootShell";
import { useSettings } from "@/hooks/useSettings";
import { readMaintenanceFlagFromCache } from "@/lib/publicSettingsCache";
import { scheduleAfterWindowLoad } from "@/lib/scheduleAfterWindowLoad";

const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));

export type MaintenanceAccessState = "checking" | "clear" | "blocked";

type MaintenanceGuardProps = {
  children: ReactNode;
};

/**
 * Optimistic: renders children immediately, checks maintenance in background.
 * Only swaps to MaintenancePage if maintenance is confirmed active.
 */
export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const isPrerender = window.__VEZ_PRERENDER__ === true;
  const {
    maintenance,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const [access, setAccess] = useState<MaintenanceAccessState>(
    isPrerender || readMaintenanceFlagFromCache() !== true
      ? "checking"
      : "blocked",
  );
  const hasMaintenanceSettings = maintenance != null;
  const settingsMaintenanceEnabled = maintenance?.enabled === true;

  useEffect(() => {
    if (isPrerender) return;
    if (settingsLoading) return;

    let cancelled = false;

    const resolveAccess = async () => {
      const {
        fetchMaintenanceAccess,
        fetchMaintenanceEnabledFromDb,
        isSiteAccessible,
      } = await import("@/services/maintenanceAccess");
      const snapshot = await fetchMaintenanceAccess();
      if (cancelled) return;

      const needsDbFallback =
        snapshot.unavailable ||
        Boolean(settingsError) ||
        !hasMaintenanceSettings;

      const dbMaintenanceEnabled = needsDbFallback
        ? await fetchMaintenanceEnabledFromDb()
        : null;

      if (cancelled) return;

      const accessible = isSiteAccessible(
        snapshot,
        settingsMaintenanceEnabled,
        dbMaintenanceEnabled,
      );

      setAccess(accessible ? "clear" : "blocked");
    };

    const cancelSchedule = scheduleAfterWindowLoad(() => {
      void resolveAccess();
    }, 5000);

    return () => {
      cancelled = true;
      cancelSchedule();
    };
  }, [
    isPrerender,
    settingsLoading,
    settingsError,
    hasMaintenanceSettings,
    settingsMaintenanceEnabled,
  ]);

  if (access === "blocked") {
    return (
      <Suspense fallback={<AppBootShell />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return <>{children}</>;
}
