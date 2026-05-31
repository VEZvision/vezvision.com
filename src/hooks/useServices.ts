import { useState, useEffect, useCallback } from 'react'
import { logError } from '@/lib/logger'
import { listActiveServicesContent } from '@/services/services'
import {
  ServiceCategory,
  ServiceTranslation,
  ServiceWithDetails,
} from '@/types/services'

export function useServices() {
  const [services, setServices] = useState<ServiceWithDetails[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await listActiveServicesContent(controller.signal)
        setServices(result.services)
        setCategories(result.categories)
      } catch (err) {
        if (controller.signal.aborted || (err instanceof Error && err.message === 'Request aborted')) {
          return
        }
        if (err instanceof Error && err.message === 'Network unavailable') {
          setError(null)
          return
        }
        logError('useServices.load', err)
        setServices([])
        setCategories([])
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania usług')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void run()

    return () => controller.abort()
  }, [refreshKey])

  const getServiceTranslation = useCallback((service: ServiceWithDetails, language: 'pl' | 'en'): ServiceTranslation => {
    return service.translations.find((translation) => translation.language === language) || service.translations[0]
  }, [])

  const getFeaturedServices = useCallback(() => {
    return services.filter((service) => service.is_featured)
  }, [services])

  const getServicesByCategory = useCallback((categoryId: string) => {
    return services.filter((service) => service.categories.some((category) => category.id === categoryId))
  }, [services])

  const refreshServices = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return {
    services,
    categories,
    loading,
    error,
    getServiceTranslation,
    getFeaturedServices,
    getServicesByCategory,
    refreshServices,
  }
}
