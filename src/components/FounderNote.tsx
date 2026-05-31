import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './FounderNote.module.css';
import { useLanguageContext } from '../hooks/useLanguage';



const FounderNote: React.FC<{ className?: string }> = ({ className = '' }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguageContext();

  const QUOTE_LINES = useMemo(() => ([
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
  ]), [t]);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -15%' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const preparedLines = useMemo(() =>
    QUOTE_LINES.map((line) => {
      const characters: { char: string; highlight: boolean; quote: boolean; key: string }[] = [];

      line.segments.forEach((segment, segmentIndex) => {
        segment.text.split('').forEach((char, charIndex) => {
          characters.push({
            char,
            highlight: Boolean(segment.highlight),
            quote: Boolean(segment.quote),
            key: `${line.id}-seg${segmentIndex}-char${charIndex}`,
          });
        });
      });

      return { ...line, characters };
    }),
    [QUOTE_LINES]);

  const accessibleQuote = useMemo(
    () => QUOTE_LINES.map((line) => line.segments.map((segment) => segment.text).join('')).join(' '),
    [QUOTE_LINES]
  );

  const CHAR_DELAY = 46;
  const LINE_DELAY = 320;

  return (
    <section ref={sectionRef} className={`${styles.section} ${className}`} aria-labelledby="founder-note-heading">
      <div className={styles.inner}>
        <h2 id="founder-note-heading" className="sr-only">Founder quote</h2>
        <p className="sr-only">{accessibleQuote}</p>
        {preparedLines.map((line, lineIndex) => {
          const baseDelay = lineIndex * LINE_DELAY;

          return (
            <p key={line.id} className={styles.line} data-visible={isVisible ? 'true' : 'false'} aria-hidden="true">
              {line.characters.map((character, charIndex) => {
                const delay = baseDelay + charIndex * CHAR_DELAY;
                const characterClassName = [
                  styles.char,
                  character.highlight ? styles.charHighlight : '',
                  character.quote ? styles.charQuote : '',
                ].filter(Boolean).join(' ');

                return (
                  <span
                    key={character.key}
                    className={characterClassName}
                    style={isVisible ? { animationDelay: `${delay}ms` } : undefined}
                  >
                    {character.char === ' ' ? '\u00A0' : character.char}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    </section>
  );
};

export default FounderNote;
