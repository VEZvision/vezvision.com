import { supabase } from '@/lib/supabase'
import { logError } from '@/lib/logger'
import { isAbortLikeError, isSupabaseNetworkLikeError } from './utils'
import {
  ServiceTranslation,
  ServiceCategory,
  ServiceWithDetails,
} from '@/types/services'

interface DBService {
  id: string
  slug: string
  status: string
  featured: boolean
  order_index?: number
  icon?: string
  price?: number
  duration?: string
  title_pl?: string
  title_en?: string
  description_pl?: string
  description_en?: string
  features_pl?: string[]
  features_en?: string[]
  short_desc_pl?: string
  short_desc_en?: string
  meta_title_pl?: string
  meta_title_en?: string
  meta_desc_pl?: string
  meta_desc_en?: string
  created_at: string
  updated_at: string
  vv_service_category_assignments?: {
    vv_service_categories?: {
      id: string
      slug: string
      name_pl?: string
      color?: string
      created_at: string
    }
  }[]
}

interface DBServiceCategory {
  id: string
  slug: string
  name_pl?: string
  color?: string
  created_at: string
}

const mapCategoryFromDB = (category: DBServiceCategory): ServiceCategory => ({
  id: category.id,
  slug: category.slug,
  name: category.name_pl || category.slug,
  color: category.color || '#000000',
  created_at: category.created_at,
})

const mapServiceFromDB = (data: DBService): ServiceWithDetails => {
  const translations: ServiceTranslation[] = [
    {
      id: `${data.id}-pl`,
      service_id: data.id,
      language: 'pl',
      title: data.title_pl || '',
      description: data.description_pl || '',
      features: data.features_pl || [],
      excerpt: data.short_desc_pl || '',
      seo_title: data.meta_title_pl || null,
      seo_description: data.meta_desc_pl || null,
      seo_keywords: null,
    },
    {
      id: `${data.id}-en`,
      service_id: data.id,
      language: 'en',
      title: data.title_en || '',
      description: data.description_en || '',
      features: data.features_en || [],
      excerpt: data.short_desc_en || '',
      seo_title: data.meta_title_en || null,
      seo_description: data.meta_desc_en || null,
      seo_keywords: null,
    },
  ]

  const categories: ServiceCategory[] = (data.vv_service_category_assignments || [])
    .map((assignment) => assignment.vv_service_categories)
    .filter((category): category is NonNullable<typeof category> => Boolean(category))
    .map((category) => mapCategoryFromDB(category))

  return {
    id: data.id,
    slug: data.slug,
    price: data.price || 0,
    duration: data.duration || '',
    status: data.status === 'active' ? 'active' : 'inactive',
    is_featured: data.featured || false,
    icon: data.icon,
    order_index: data.order_index,
    created_at: data.created_at,
    updated_at: data.updated_at,
    translations,
    categories,
  }
}

export async function listActiveServicesContent(signal?: AbortSignal): Promise<{
  services: ServiceWithDetails[]
  categories: ServiceCategory[]
}> {
  try {
    const { data: servicesData, error: servicesError } = await supabase
      .from('vv_services')
      .select(`
        *,
        vv_service_category_assignments(vv_service_categories(*))
      `)
      .eq('status', 'active')
      .order('order_index', { ascending: true })
      .limit(100)
      .abortSignal(signal)

    if (servicesError) throw servicesError

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('vv_service_categories')
      .select('*')
      .order('order_index', { ascending: true })
      .limit(100)
      .abortSignal(signal)

    if (categoriesError) throw categoriesError

    return {
      services: (servicesData || []).map((service) => mapServiceFromDB(service as unknown as DBService)),
      categories: (categoriesData || []).map((category) => mapCategoryFromDB(category as DBServiceCategory)),
    }
  } catch (error) {
    if (isAbortLikeError(error)) throw new Error('Request aborted')
    if (isSupabaseNetworkLikeError(error)) throw new Error('Network unavailable')
    logError('services.list', error)
    throw new Error('Failed to list services content')
  }
}
