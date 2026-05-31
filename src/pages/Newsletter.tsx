import '../styles/GridBackground.css';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Newspaper, ShieldCheck } from 'lucide-react';
import PageSeo from '@/components/seo/PageSeo';
import NewsletterSection from '@/components/newsletter/NewsletterSection';
import Footer from '@/components/footer/Footer';
import SectionReveal from '@/components/ui/SectionReveal';
import { useLanguageContext } from '@/hooks/useLanguage';

const COPY = {
  pl: {
    title: 'Newsletter VezVision',
    eyebrow: 'Wiedza bez spamu',
    description: 'Zapisz się, jeśli chcesz dostawać konkretne materiały o stronach, aplikacjach, AI i pracy z technologią.',
    back: 'Wróć do bloga',
    highlights: [
      { title: 'Nowe artykuły', description: 'Napiszemy, gdy pojawi się nowy tekst na blogu.' },
      { title: 'Praktyczne wskazówki', description: 'Krótko, konkretnie i bez marketingowego szumu.' },
      { title: 'Pełna kontrola', description: 'Możesz wypisać się w każdej chwili z linku w wiadomości.' },
    ],
  },
  en: {
    title: 'VezVision Newsletter',
    eyebrow: 'Useful notes, no spam',
    description: 'Leave your email if you want practical notes about websites, apps, AI and working with technology.',
    back: 'Back to blog',
    highlights: [
      { title: 'New articles', description: 'We will write when there is a new blog post.' },
      { title: 'Practical notes', description: 'Short, concrete and free from marketing noise.' },
      { title: 'Full control', description: 'Unsubscribe anytime from the link in each message.' },
    ],
  },
} as const;

const ICONS = [Mail, Newspaper, ShieldCheck] as const;

interface HighlightItem {
  title: string;
  description: string;
}

const Newsletter = () => {
  const { language } = useLanguageContext();
  const copy = COPY[language];
  const highlights: readonly HighlightItem[] = copy.highlights;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <PageSeo pageKey="newsletter" />
      <div className="grid-background" />

      <div className="relative z-10 pt-32">
        <section className="px-6 pb-12">
          <SectionReveal>
            <div className="mx-auto max-w-5xl text-center">
              <Link
                to="/blog"
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition-colors hover:border-slate-950 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                {copy.back}
              </Link>

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                {copy.eyebrow}
              </p>
              <h1
                className="mx-auto mb-5 max-w-3xl font-inter text-[clamp(38px,6.5vw,80px)] font-normal leading-[1.05] tracking-[-1.6px] text-black"
                aria-label={copy.title}
              >
                {language === 'pl' ? 'Newsletter ' : 'VezVision '}
                <span className="font-serif italic">{language === 'pl' ? 'VezVision' : 'Newsletter'}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                {copy.description}
              </p>
            </div>
          </SectionReveal>
        </section>

        <section className="px-6 pb-4">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = ICONS[index];
              return (
                <SectionReveal key={item.title} delay={index * 0.08}>
                  <div className="h-full rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-950">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </SectionReveal>
              );
            })}
          </div>
        </section>

        <NewsletterSection />
      </div>

      <Footer />
    </div>
  );
};

export default Newsletter;
