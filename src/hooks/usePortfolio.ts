import { useState, useEffect, useCallback } from 'react';
import { logError } from '@/lib/logger';
import {
  listProjects,
  getProject,
} from '@/services/portfolio';
import {
  PortfolioProject,
  PortfolioFilter
} from '@/types/portfolio';

export function usePortfolio(filter?: PortfolioFilter) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await listProjects(filter, controller.signal);

        setProjects(result.projects);
        setTotal(result.total);
      } catch (err) {
        if (controller.signal.aborted || (err instanceof Error && err.message === 'Request aborted')) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Błąd ładowania projektów');
        logError('usePortfolio.load', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [filter, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return { projects, loading, error, total, refresh };
}

export function useProject(idOrSlug: string | null) {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      if (!idOrSlug) {
        setProject(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getProject(idOrSlug, controller.signal);
        setProject(result);
      } catch (err) {
        if (controller.signal.aborted || (err instanceof Error && err.message === 'Request aborted')) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Błąd ładowania projektu');
        logError('useProject.load', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [idOrSlug, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return { project, loading, error, refresh };
}
