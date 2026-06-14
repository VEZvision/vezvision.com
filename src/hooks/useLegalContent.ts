import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    getPublishedLegalContent,
    subscribeToLegalContent,
} from '@/services/legalContent'

interface UseLegalContentResult {
    content: string | null
    title: string | null
    loading: boolean
    hasCustomContent: boolean
    lastUpdated: string | null
    version: string | null
}

/**
 * Hook do pobierania treści prawnych z bazy danych
 * @param pageKey - klucz strony: 'privacy_policy' | 'terms' | 'cookie_policy'
 * @param language - 'pl' | 'en'
 */
export function useLegalContent(pageKey: string, language: 'pl' | 'en'): UseLegalContentResult {
    const queryClient = useQueryClient()
    const queryKey = useMemo(() => ['legal-content', pageKey, language] as const, [pageKey, language])

    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: () => getPublishedLegalContent(pageKey, language),
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        const unsubscribe = subscribeToLegalContent(pageKey, () => {
            void queryClient.invalidateQueries({ queryKey })
        })
        return unsubscribe
    }, [pageKey, queryClient, queryKey])

    return {
        content: data?.content ?? null,
        title: data?.title ?? null,
        loading: isLoading,
        hasCustomContent: data?.hasCustomContent ?? false,
        lastUpdated: data?.lastUpdated ?? null,
        version: data?.version ?? null,
    }
}
