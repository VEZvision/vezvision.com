import { useMemo } from 'react'

import { useSettings } from '@/hooks/useSettings'

export function usePageSections(pageKey: string) {
  const { pageSections } = useSettings()

  return useMemo(() => {
    return (pageSections[pageKey] ?? []).filter((section) => section.enabled)
  }, [pageKey, pageSections])
}

export function usePageSectionConfig(pageKey: string, sectionKey: string) {
  const { pageSections } = useSettings()

  return useMemo(() => {
    return pageSections[pageKey]?.find((section) => section.section_key === sectionKey)?.config ?? {}
  }, [pageKey, pageSections, sectionKey])
}
