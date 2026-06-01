import PageSeo from '@/components/seo/PageSeo';
import LegalMarkdown from '@/components/legal/LegalMarkdown';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useLegalContent } from '@/hooks/useLegalContent';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { LegalTemplates } from '@/data/legalTemplates';

const CookiePolicy = () => {
  const { t, language } = useLanguageContext();
  const { content, title, loading, lastUpdated } = useLegalContent('cookie_policy', language);
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

  const fallbackContent = language === 'en' ? templates?.cookie_policy.en : templates?.cookie_policy.pl;
  const fallbackTitle = language === 'en' ? 'Cookie Policy' : 'Polityka Plików Cookies';
  const renderedContent = content || fallbackContent || '';
  const renderedTitle = title || fallbackTitle;
  const effectiveDate = lastUpdated ? new Date(lastUpdated) : new Date('2026-03-31');

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <PageSeo pageKey="cookie-policy" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {renderedTitle}
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            {t('cookiePolicy.lastUpdated')}: {formatDate(effectiveDate)}
          </p>

          <div className="prose max-w-none">
            <LegalMarkdown content={renderedContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
