import '../styles/GridBackground.css';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Newspaper, ShieldCheck } from 'lucide-react';
import PageSeo from '@/components/seo/PageSeo';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { useLanguageContext } from '@/hooks/useLanguage';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

const HIGHLIGHT_KEYS = [
  {
    titleKey: 'newsletter.page.highlight.new.title',
    descriptionKey: 'newsletter.page.highlight.new.description',
    icon: Mail,
  },
  {
    titleKey: 'newsletter.page.highlight.tips.title',
    descriptionKey: 'newsletter.page.highlight.tips.description',
    icon: Newspaper,
  },
  {
    titleKey: 'newsletter.page.highlight.control.title',
    descriptionKey: 'newsletter.page.highlight.control.description',
    icon: ShieldCheck,
  },
] as const;

const Newsletter = () => {
  const { language, t } = useLanguageContext();
  const { toLocalizedPath } = useLocalizedPath();

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <PageSeo pageKey="newsletter" />
      <div className="grid-background" />

      <div className="relative z-10 pt-32">
        <section className="px-6 pb-12">
          <SectionReveal>
            <div className="mx-auto max-w-5xl text-center">
              <Link
                to={toLocalizedPath('blog')}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:border-slate-950 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('newsletter.page.back')}
              </Link>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t('newsletter.page.eyebrow')}
              </p>
              <h1
                className="mx-auto mb-5 max-w-3xl font-sans text-[clamp(38px,6.5vw,80px)] font-normal leading-[1.05] tracking-[-1.6px] text-black"
                aria-label={t('newsletter.page.title')}
              >
                {language === 'pl' ? 'Newsletter ' : 'VezVision '}
                <span className="font-sans">{language === 'pl' ? 'VezVision' : 'Newsletter'}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                {t('newsletter.page.description')}
              </p>
            </div>
          </SectionReveal>
        </section>

        <section className="px-6 pb-4">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {HIGHLIGHT_KEYS.map((item, index) => {
              const Icon = item.icon;
              return (
                <SectionReveal key={item.titleKey} delay={index * 0.08}>
                  <div className="h-full rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-950">{t(item.titleKey)}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.descriptionKey)}</p>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </section>

        <NewsletterSection />
      </div>
    </div>
  );
};

export default Newsletter;
