import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/lib/queryKeys'
import { listActiveFaqItems } from '@/services/faq'

export function useFaqItems(language: 'pl' | 'en') {
  return useQuery({
    queryKey: queryKeys.faq.list(language),
    queryFn: ({ signal }) => listActiveFaqItems(language, signal),
    staleTime: 5 * 60_000,
  })
}
