import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { useLanguageContext } from "@/hooks/useLanguage";
import { listActiveServicesContent } from "@/services/servicesContent";
import type { ServiceTranslation, ServiceWithDetails } from "@/types/services";

export function useServices() {
  const queryClient = useQueryClient();
  const { language } = useLanguageContext();
  const contentLanguage = language;

  const listQuery = useQuery({
    queryKey: queryKeys.services.list(contentLanguage),
    queryFn: ({ signal }) => listActiveServicesContent(signal, contentLanguage),
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Network unavailable")
        return false;
      return failureCount < 1;
    },
  });

  const services = useMemo(
    () => listQuery.data?.services ?? [],
    [listQuery.data?.services],
  );
  const categories = useMemo(
    () => listQuery.data?.categories ?? [],
    [listQuery.data?.categories],
  );

  const getServiceTranslation = useCallback(
    (service: ServiceWithDetails, lang: "pl" | "en"): ServiceTranslation => {
      return (
        service.translations.find(
          (translation) => translation.language === lang,
        ) || service.translations[0]
      );
    },
    [],
  );

  const getFeaturedServices = useCallback(
    () => services.filter((service) => service.is_featured),
    [services],
  );

  const getServicesByCategory = useCallback(
    (categoryId: string) =>
      services.filter((service) =>
        service.categories.some((category) => category.id === categoryId),
      ),
    [services],
  );

  const refreshServices = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
  }, [queryClient]);

  const networkError =
    listQuery.error instanceof Error &&
    listQuery.error.message === "Network unavailable";

  return {
    services,
    categories,
    loading: listQuery.isLoading,
    error: networkError
      ? null
      : listQuery.error instanceof Error
        ? listQuery.error.message
        : listQuery.error
          ? String(listQuery.error)
          : null,
    getServiceTranslation,
    getFeaturedServices,
    getServicesByCategory,
    refreshServices,
  };
}
