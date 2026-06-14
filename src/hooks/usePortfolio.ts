import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/queryKeys'
import { getProject, listProjects } from '@/services/portfolio'
import type { PortfolioFilter, PortfolioProject } from '@/types/portfolio'

function filterKey(filter?: PortfolioFilter): string {
  return JSON.stringify(filter ?? {})
}

export function usePortfolio(filter?: PortfolioFilter) {
  const queryClient = useQueryClient()
  const key = filterKey(filter)

  const listQuery = useQuery({
    queryKey: queryKeys.portfolio.list(key),
    queryFn: ({ signal }) => listProjects(filter, signal),
    staleTime: 5 * 60_000,
  })

  const projects = useMemo(() => listQuery.data?.projects ?? [], [listQuery.data?.projects])
  const total = listQuery.data?.total ?? 0

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all })
  }, [queryClient])

  const getProjectBySlug = useCallback(
    async (slug: string, signal?: AbortSignal): Promise<PortfolioProject | null> => {
      const cached = projects.find((p) => p.slug === slug)
      if (cached) return cached

      const detailKey = queryKeys.portfolio.detail(slug)
      const cachedDetail = queryClient.getQueryData<PortfolioProject>(detailKey)
      if (cachedDetail) return cachedDetail

      const project = await getProject(slug, signal)
      if (project) queryClient.setQueryData(detailKey, project)
      return project
    },
    [projects, queryClient],
  )

  return {
    projects,
    total,
    loading: listQuery.isLoading,
    error: listQuery.error instanceof Error ? listQuery.error : listQuery.error ? new Error(String(listQuery.error)) : null,
    refresh,
    getProjectBySlug,
  }
}

export function useProject(slug: string | null) {
  const query = useQuery({
    queryKey: queryKeys.portfolio.detail(slug ?? ''),
    queryFn: ({ signal }) => {
      if (!slug) return Promise.resolve(null)
      return getProject(slug, signal)
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  })

  return {
    project: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : query.error ? new Error(String(query.error)) : null,
  }
}
