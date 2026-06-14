import { getSupabase } from '@/lib/supabase'
import { logError } from '@/lib/logger'

export interface FaqItem {
  id: string
  question: string
  answer: string
}

interface DBFaqItem {
  id: string
  question_pl: string
  question_en: string | null
  answer_pl: string
  answer_en: string | null
}

export async function listActiveFaqItems(language: 'pl' | 'en', signal?: AbortSignal): Promise<FaqItem[]> {
  try {
    const supabase = await getSupabase()
    let query = supabase
      .from('vv_faq_items')
      .select('id, question_pl, question_en, answer_pl, answer_en')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(100)

    if (signal) query = query.abortSignal(signal)
    const { data, error } = await query

    if (error || !data) return []

    return (data as DBFaqItem[])
      .map((row) => {
        const question = language === 'en' ? (row.question_en || row.question_pl) : row.question_pl
        const answer = language === 'en' ? (row.answer_en || row.answer_pl) : row.answer_pl
        return { id: row.id, question, answer }
      })
      .filter((item) => item.question.trim().length > 0 && item.answer.trim().length > 0)
  } catch (error) {
    logError('faq.list', error)
    return []
  }
}
