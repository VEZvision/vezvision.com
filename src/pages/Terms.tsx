import { Link } from 'react-router-dom';
import LegalMarkdown from '@/components/legal/LegalMarkdown';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useLegalContent } from '@/hooks/useLegalContent';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PageSeo from '@/components/seo/PageSeo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import type { BreadcrumbItem } from '@/components/seo/Breadcrumbs';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { useState, useEffect } from 'react';
import type { LegalTemplates } from '@/data/legalTemplates';

const Terms = () => {
    const { language, t } = useLanguageContext();
    const { toLocalizedPath } = useLocalizedPath();
    const { content, title, loading, lastUpdated } = useLegalContent('terms', language);
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

    const fallbackContent = language === 'en' ? templates?.terms.en : templates?.terms.pl;
    const fallbackTitle = language === 'en' ? 'Terms of Service' : 'Regulamin świadczenia usług';
    const renderedContent = content || fallbackContent || '';
    const renderedTitle = title || fallbackTitle;
    const effectiveDate = lastUpdated ? new Date(lastUpdated) : new Date('2026-03-31');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: t('nav.home'), href: '/' },
        { label: renderedTitle },
    ];

    return (
        <>
            <PageSeo pageKey="terms" />

            <div className="min-h-screen bg-white pt-24 pb-16">
                <SectionReveal className="mx-auto max-w-3xl px-6">
                    <Breadcrumbs items={breadcrumbItems} />
                    {/* Back Link */}
                    <Link
                        to={toLocalizedPath()}
                        className="mb-8 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900"
                    >
                        <ArrowLeft size={18} />
                        <span>{t('legal.back')}</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="mb-3 text-3xl font-bold text-gray-900">
                            {renderedTitle}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {t('legal.last_updated')}: {formatDate(effectiveDate)}
                        </p>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <LegalMarkdown content={renderedContent} />
                    </div>
                </SectionReveal>
            </div>
        </>
    );
};

export default Terms;
