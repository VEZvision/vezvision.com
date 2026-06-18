import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import AppBootShell from "@/components/layout/AppBootShell";
import { useSettings } from "@/hooks/useSettings";
import {
  fetchMaintenanceAccess,
  fetchMaintenanceEnabledFromDb,
  isSiteAccessible,
} from "@/services/maintenanceAccess";

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
  const {
    maintenance,
    loading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const [access, setAccess] = useState<MaintenanceAccessState>("checking");
  const hasMaintenanceSettings = maintenance != null;
  const settingsMaintenanceEnabled = maintenance?.enabled === true;

  useEffect(() => {
    if (settingsLoading) return;

    let cancelled = false;

    const resolveAccess = async () => {
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

    void resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [
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
