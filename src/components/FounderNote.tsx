import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './FounderNote.module.css';
import { useLanguageContext } from '../hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { registerRevealElement, revealImmediately } from '@/reveal/revealRegistry';

type FounderNoteProps = {
  className?: string;
  variant?: 'home' | 'blog';
};

const TYPE_SPEED = 45;

function FounderNote({ className = '', variant = 'home' }: FounderNoteProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const isBlog = variant === 'blog';
  const sectionClass = isBlog ? styles.blogSection : styles.section;
  const innerClass = isBlog ? styles.blogInner : styles.homeInner;

  const quoteLines = useMemo(() => {
    const prefix = isBlog ? 'founder.blog' : 'founder';

    return [
      {
        id: 'line-one',
        segments: [
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
        ],
      },
    ];
  }, [isBlog, t]);

  const fullText = useMemo(() => {
    const lines = quoteLines.map((line) => line.segments.map((segment) => segment.text).join(''));
    return isBlog ? lines.join('\n') : lines.join('');
  }, [isBlog, quoteLines]);

  const accessibleQuote = useMemo(
    () => quoteLines.map((line) => line.segments.map((segment) => segment.text).join('')).join(' '),
    [quoteLines],
  );

  const onReveal = useCallback(() => setIsRevealed(true), []);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    if (reducedMotion) {
      revealImmediately(target);
      setIsRevealed(true);
      return;
    }

    return registerRevealElement(target, {
      once: true,
      amount: isBlog ? 0.3 : 0,
      rootMargin: isBlog ? '0px 0px -15% 0px' : undefined,
      onReveal,
    });
  }, [reducedMotion, isBlog, onReveal]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(fullText);
      setShowCursor(false);
      return;
    }

    if (!isRevealed || !fullText) return;

    let timeoutId: NodeJS.Timeout;

    if (displayText.length < fullText.length) {
      timeoutId = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, TYPE_SPEED);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [displayText, fullText, isRevealed, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      setShowCursor(false);
      return;
    }

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [reducedMotion]);

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

        {isBlog ? (
          <p
            className={styles.blogLine}
            data-visible={isRevealed ? 'true' : 'false'}
            aria-hidden="true"
          >
            <span className={styles.typedText}>
              {displayText}
            </span>
            <span
              className={`${styles.cursor} ${showCursor ? styles.cursorVisible : styles.cursorHidden}`}
            />
          </p>
        ) : (
          <p
            className={styles.homeLine}
            data-visible={isRevealed ? 'true' : 'false'}
            aria-hidden="true"
          >
            <span className={styles.typedText}>
              {displayText}
            </span>
            <span
              className={`${styles.cursor} ${showCursor ? styles.cursorVisible : styles.cursorHidden}`}
            />
          </p>
        )}
      </div>
    </section>
  );
}

export default FounderNote;
