import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import styles from './FounderNote.module.css';
import { useLanguageContext } from '../hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const FounderNote: React.FC<{ className?: string }> = ({ className = '' }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();

  const quoteLines = useMemo(
    () => [
      {
        id: 'line-one',
        segments: [
          { text: '"', quote: true },
          { text: t('founder.line1.a') },
          { text: t('founder.line1.b'), highlight: true },
          { text: t('founder.line1.c') },
        ],
      },
      {
        id: 'line-two',
        segments: [
          { text: t('founder.line2.a') },
          { text: t('founder.line2.b'), highlight: true },
          { text: t('founder.line2.c') },
        ],
      },
      {
        id: 'line-three',
        segments: [
          { text: t('founder.line3.a') },
          { text: t('founder.line3.b'), highlight: true },
          { text: t('founder.line3.c') },
          { text: '"', quote: true },
        ],
      },
    ],
    [t],
  );

  const accessibleQuote = useMemo(
    () => quoteLines.map((line) => line.segments.map((segment) => segment.text).join('')).join(' '),
    [quoteLines],
  );

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    if (reducedMotion) {
      target.dataset.visible = 'true';
      return;
    }

    const reveal = () => {
      target.dataset.visible = 'true';
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '80px 0px -4% 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${className}`}
      aria-labelledby="founder-note-heading"
    >
      <div className={styles.inner}>
        <h2 id="founder-note-heading" className="sr-only">
          Founder quote
        </h2>
        <p className="sr-only">{accessibleQuote}</p>
        {quoteLines.map((line, lineIndex) => (
          <p
            key={line.id}
            className={styles.line}
            style={{ '--line-i': lineIndex } as CSSProperties}
            aria-hidden="true"
          >
            {line.segments.map((segment, segmentIndex) => {
              const segmentClass = [
                styles.segment,
                segment.highlight ? styles.charHighlight : '',
                segment.quote ? styles.charQuote : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <span key={`${line.id}-${segmentIndex}`} className={segmentClass}>
                  {segment.text}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </section>
  );
};

export default FounderNote;
