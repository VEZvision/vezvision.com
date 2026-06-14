import { Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import AppBootShell from '@/components/layout/AppBootShell';
import { useSettings } from '@/hooks/useSettings';
import {
  fetchMaintenanceAccess,
  fetchMaintenanceEnabledFromDb,
  isSiteAccessible,
} from '@/services/maintenanceAccess';

const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));

export type MaintenanceAccessState = 'loading' | 'allowed' | 'blocked';

type MaintenanceGuardProps = {
  children: ReactNode;
};

/**
 * Fail-closed until core CMS settings resolve.
 * Always verifies maintenance via edge (never trusts cached "off" alone).
 */
export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { maintenance, loading: settingsLoading, error: settingsError } = useSettings();
  const [access, setAccess] = useState<MaintenanceAccessState>('loading');
  const hasMaintenanceSettings = maintenance != null;
  const settingsMaintenanceEnabled = maintenance?.enabled === true;

  useEffect(() => {
    if (settingsLoading) return;

    let cancelled = false;

    const resolveAccess = async () => {
      setAccess('loading');

      const snapshot = await fetchMaintenanceAccess();
      if (cancelled) return;

      const needsDbFallback =
        snapshot.unavailable || Boolean(settingsError) || !hasMaintenanceSettings;

      const dbMaintenanceEnabled = needsDbFallback
        ? await fetchMaintenanceEnabledFromDb()
        : null;

      if (cancelled) return;

      setAccess(
        isSiteAccessible(snapshot, settingsMaintenanceEnabled, dbMaintenanceEnabled)
          ? 'allowed'
          : 'blocked',
      );
    };

    void resolveAccess();

    return () => {
      cancelled = true;
    };
  }, [settingsLoading, settingsError, hasMaintenanceSettings, settingsMaintenanceEnabled]);

  const gateLoading = settingsLoading || access === 'loading';

  if (gateLoading) {
    return <AppBootShell />;
  }

  if (access === 'blocked') {
    return (
      <Suspense fallback={<AppBootShell />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return <>{children}</>;
}
