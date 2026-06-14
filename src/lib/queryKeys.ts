export const queryKeys = {
  blog: {
    all: ['blog'] as const,
    list: (language: string) => [...queryKeys.blog.all, 'list', language] as const,
    detail: (slug: string, language: string) => [...queryKeys.blog.all, 'detail', slug, language] as const,
  },
  portfolio: {
    all: ['portfolio'] as const,
    list: (filterKey: string) => [...queryKeys.portfolio.all, 'list', filterKey] as const,
    detail: (slug: string) => [...queryKeys.portfolio.all, 'detail', slug] as const,
  },
  services: {
    all: ['services'] as const,
    list: (language: string) => [...queryKeys.services.all, 'list', language] as const,
  },
  faq: {
    all: ['faq'] as const,
    list: (language: string) => [...queryKeys.faq.all, 'list', language] as const,
  },
} as const
