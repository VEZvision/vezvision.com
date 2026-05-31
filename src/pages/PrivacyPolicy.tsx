import PageSeo from '@/components/seo/PageSeo';
import LegalMarkdown from '@/components/legal/LegalMarkdown';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useLegalContent } from '@/hooks/useLegalContent';
import { Loader2 } from 'lucide-react';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { useState, useEffect } from 'react';
import type { LegalTemplates } from '@/data/legalTemplates';

const PrivacyPolicy = () => {
  const { language, t } = useLanguageContext();
  const { content, title, loading, lastUpdated } = useLegalContent('privacy_policy', language);
  const [templates, setTemplates] = useState<LegalTemplates | null>(null);

  useEffect(() => {
    if (!loading && !content) {
      void import('@/data/legalTemplates').then(m => { setTemplates(m.LEGAL_TEMPLATES); });
    }
  }, [loading, content]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const fallbackContent = language === 'en' ? templates?.privacy_policy.en : templates?.privacy_policy.pl;
  const fallbackTitle = language === 'en' ? 'Privacy Policy' : 'Polityka Prywatności';
  const renderedContent = content || fallbackContent || '';
  const renderedTitle = title || fallbackTitle;
  const effectiveDate = lastUpdated ? new Date(lastUpdated) : new Date('2026-03-31');

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <PageSeo pageKey="privacy-policy" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h1 className="mb-6 text-3xl font-bold text-gray-900">
              {renderedTitle}
            </h1>

            <p className="mb-8 text-sm text-gray-600">
              {t('legal.last_updated')}: {formatDate(effectiveDate)}
            </p>

            <div className="prose max-w-none">
              <LegalMarkdown content={renderedContent} />
            </div>
          </div>
        </SectionReveal>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
