import { getSupabase } from '@/lib/supabase'

export interface LegalContentResult {
  content: string | null
  title: string | null
  hasCustomContent: boolean
  lastUpdated: string | null
  version: string | null
}

interface DBLegalDocument {
  title_pl: string
  title_en: string | null
  content_pl: string
  content_en: string | null
  last_updated: string | null
  version: string | null
  is_published: boolean
}

const emptyLegalContent: LegalContentResult = {
  content: null,
  title: null,
  hasCustomContent: false,
  lastUpdated: null,
  version: null,
}

export async function getPublishedLegalContent(
  pageKey: string,
  language: 'pl' | 'en'
): Promise<LegalContentResult> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('vv_legal_documents')
    .select('title_pl,title_en,content_pl,content_en,last_updated,version,is_published')
    .eq('document_key', pageKey)
    .eq('is_published', true)
    .maybeSingle()

  if (error || !data) return emptyLegalContent

  const document = data as DBLegalDocument
  return {
    title: language === 'en' ? (document.title_en || document.title_pl) : document.title_pl,
    content: language === 'en' ? (document.content_en || document.content_pl) : document.content_pl,
    lastUpdated: document.last_updated ?? null,
    version: document.version ?? null,
    hasCustomContent: true,
  }
}

export function subscribeToLegalContent(pageKey: string, onChange: () => void): () => void {
  let disposed = false
  let removeChannel: (() => void) | null = null

  void getSupabase().then((supabase) => {
    if (disposed) return

    const channel = supabase
      .channel(`legal-content-${pageKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vv_legal_documents',
          filter: `document_key=eq.${pageKey}`,
        },
        onChange,
      )
      .subscribe()

    removeChannel = () => {
      void supabase.removeChannel(channel)
    }
  })

  return () => {
    disposed = true
    removeChannel?.()
  }
}
