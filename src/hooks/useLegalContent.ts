import { useState, useEffect } from 'react'
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
    const [content, setContent] = useState<string | null>(null)
    const [title, setTitle] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [hasCustomContent, setHasCustomContent] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)
    const [version, setVersion] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        const fetchLegalContent = async () => {
            setLoading(true)
            const result = await getPublishedLegalContent(pageKey, language)
            if (!active) return

            setTitle(result.title)
            setContent(result.content)
            setLastUpdated(result.lastUpdated)
            setVersion(result.version)
            setHasCustomContent(result.hasCustomContent)
            setLoading(false)
        }

        void fetchLegalContent()

        const unsubscribe = subscribeToLegalContent(pageKey, () => {
            void fetchLegalContent()
        })

        return () => {
            active = false
            unsubscribe()
        }
    }, [pageKey, language])

    return { content, title, loading, hasCustomContent, lastUpdated, version }
}
