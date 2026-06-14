import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './FounderNote.module.css';
import { useLanguageContext } from '../hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { registerRevealElement, revealImmediately } from '@/reveal/revealRegistry';

type FounderNoteProps = {
  className?: string;
  variant?: 'home' | 'blog';
};

function FounderNote({ className = '', variant = 'home' }: FounderNoteProps) { const sectionRef = useRef<HTMLElement>(null);
const { t } = useLanguageContext();
const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const isBlog = variant === 'blog';
  const sectionClass = isBlog ? styles.blogSection : styles.section;
  const innerClass = isBlog ? styles.blogInner : styles.inner;
  const lineClass = isBlog ? styles.blogLine : styles.line;

const quoteLines = useMemo(() => {
  const prefix = isBlog ? 'founder.blog' : 'founder';

  return [
    {
      id: 'line-one',
      segments: [
        { text: '"', quote: true },
        { text: t(`${prefix}.line1.a`) },
        { text: t(`${prefix}.line1.b`), highlight: true },
        { text: t(`${prefix}.line1.c`) },
      ],
    },
    {
      id: 'line-two',
      segments: [
        { text: t(`${prefix}.line2.a`) },
        { text: t(`${prefix}.line2.b`), highlight: true },
        { text: t(`${prefix}.line2.c`) },
      ],
    },
    {
      id: 'line-three',
      segments: [
        { text: t(`${prefix}.line3.a`) },
        { text: t(`${prefix}.line3.b`), highlight: true },
        { text: t(`${prefix}.line3.c`) },
        { text: '"', quote: true },
      ],
    },
  ];
}, [isBlog, t]);

const preparedLines = useMemo(() => {
  return quoteLines.map((line) => {
    const characters: Array<{
      char: string;
      highlight: boolean;
      quote: boolean;
      key: string;
    }> = [];

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
  });
}, [quoteLines]);

const accessibleQuote = useMemo(
  () => quoteLines.map((line) => line.segments.map((segment) => segment.text).join('')).join(' '),
  [quoteLines],
);

useEffect(() => {
  const target = sectionRef.current;
  if (!target) return;

  if (reducedMotion) {
    revealImmediately(target);
    setVisible(true);
    return;
  }

  return registerRevealElement(target, {
    once: true,
    amount: isBlog ? 0.3 : 0,
    rootMargin: isBlog ? '0px 0px -15% 0px' : undefined,
    onReveal: () => setVisible(true),
  });
}, [reducedMotion, isBlog]);

return (
  <section
    ref={sectionRef}
      className={`${sectionClass} ${className}`}
    aria-labelledby="founder-note-heading"
  >
      <div className={innerClass}>
      <h2 id="founder-note-heading" className="sr-only">
        {t('founder.srHeading')}
      </h2>
      <p className="sr-only">{accessibleQuote}</p>
      {preparedLines.map((line, lineIndex) => (
        <p
          key={line.id}
            className={lineClass}
          data-visible={visible ? 'true' : 'false'}
          aria-hidden="true"
        >
          {line.characters.map((character, charIndex) => {
            const characterClassName = [
              styles.char,
              character.highlight ? styles.charHighlight : '',
              character.quote ? styles.charQuote : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <span
                key={character.key}
                className={characterClassName}
                style={{ '--i': charIndex, '--line': lineIndex } as React.CSSProperties}
              >
                {character.char === ' ' ? '\u00A0' : character.char}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  </section>
); };

export default FounderNote;
