import { useState, useMemo, useEffect, FC } from 'react';
import styles from './FaqSection.module.css';
import { useLanguageContext } from '@/hooks/useLanguage';
import arrowRight from '@/assets/arrow-right.svg';
import SectionHeader from '@/components/ui/SectionHeader';
import { MessageSquare } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { safeJsonLd } from '@/utils/safeJsonLd';
import { listActiveFaqItems, type FaqItem } from '@/services/faq';

import { ChevronDown, Mail } from 'lucide-react';

interface FaqSectionProps {
  showContactCta?: boolean;
}

const FaqSection: FC<FaqSectionProps> = ({ showContactCta = true }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [dbFaqItems, setDbFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const { t, language } = useLanguageContext();
  const { contact, loading: settingsLoading, error } = useSettings();
  const contactEmail = contact?.email || '';

  const title = (
    <>
      {t('faq.title.line1')} <span className="font-playfair italic font-medium">{t('faq.title.line2.italic')}</span>
    </>
  );

  const faqItems = useMemo(() => {
    const fallbackItems = [1, 2, 3, 4, 5].map((index) => ({
      id: `faq-${index}`,
      question: t(`faq.q${index}`),
      answer: t(`faq.a${index}`),
    }));

    if (dbFaqItems.length > 0) return dbFaqItems;
    return fallbackItems;
  }, [dbFaqItems, t]);

  useEffect(() => {
    let cancelled = false;

    const fetchFaqFromDb = async () => {
      try {
        setFaqLoading(true);

        const mapped = await listActiveFaqItems(language);

        if (!cancelled) {
          setDbFaqItems(mapped);
        }
      } finally {
        if (!cancelled) setFaqLoading(false);
      }
    };

    void fetchFaqFromDb();

    return () => {
      cancelled = true;
    };
  }, [language]);

  // Generate JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <section className={styles.faqSection} aria-labelledby="faq-heading">
      {/* Heading */}
      <SectionHeader
        badgeText={t('faq.badge')}
        badgeIcon={<MessageSquare className="w-3.5 h-3.5" />}
        title={title}
        subtitle={t('faq.subtitle')}
        className="mb-16"
      />

      {/* Accordion */}
      <SectionReveal className={styles.accordion} delay={0.1} y={24}>
        <Helmet>
          <script type="application/ld+json">
            {safeJsonLd(jsonLd)}
          </script>
        </Helmet>

        <div className="w-full flex flex-col gap-6 mb-8">
          <div className="space-y-4">
            {faqLoading && faqItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">{t('faq.loading')}</div>
            )}
            {faqItems.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-shadow hover:shadow-sm"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white cursor-pointer select-none focus:outline-none"
                  aria-expanded={openItem === faq.id}
                >
                  <span className="text-lg font-medium text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openItem === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-gray-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openItem === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div
                          className="prose prose-sm max-w-none text-gray-600 prose-a:text-blue-600 border-t border-gray-100 pt-4"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Contact and CTA */}
      {showContactCta && (
        <SectionReveal delay={0.2} y={20}>
          <div className={styles.contactRow}>
            <Mail className="w-5 h-5 text-gray-900" />
            <span className={styles.contactText}>
              {t('faq.contact.text')}
              {settingsLoading || (!contact && !error) ? (
                <span className="inline-block w-32 h-4 bg-gray-200 rounded animate-pulse align-middle ml-1" />
              ) : contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  title={t('faq.contact.title')}
                  rel="noopener"
                >
                  {contactEmail}
                </a>
              ) : null}
            </span>
          </div>
          <div className={styles.ctaWrap}>
            <a
              className={styles.ctaButton}
              href="/contact"
              aria-label={t('faq.cta.aria')}
            >
              <span>{t('nav.contact')}</span>
              <img src={arrowRight} alt={t('comparison.alt.arrow')} className={styles.ctaIcon} />
            </a>
          </div>
        </SectionReveal>
      )}
    </section>
  );
};

export default FaqSection;
