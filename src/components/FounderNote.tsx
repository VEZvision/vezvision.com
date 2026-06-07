import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './FounderNote.module.css';
import { useLanguageContext } from '../hooks/useLanguage';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const CHAR_DELAY = 46;
const LINE_DELAY = 320;
const CHAR_ANIMATION_MS = 880;

const FounderNote: React.FC<{ className?: string }> = ({ className = '' }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [revealedCharKeys, setRevealedCharKeys] = useState<Set<string>>(() => new Set());
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();

  const QUOTE_LINES = useMemo(
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

  const preparedLines = useMemo(
    () =>
      QUOTE_LINES.map((line) => {
        const characters: {
          char: string;
          highlight: boolean;
          quote: boolean;
          key: string;
        }[] = [];

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
    [QUOTE_LINES],
  );

  const totalCharCount = useMemo(
    () => preparedLines.reduce((sum, line) => sum + line.characters.length, 0),
    [preparedLines],
  );

  const accessibleQuote = useMemo(
    () => QUOTE_LINES.map((line) => line.segments.map((segment) => segment.text).join('')).join(' '),
    [QUOTE_LINES],
  );

  const markAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  const handleCharAnimationEnd = useCallback(
    (key: string) => {
      setRevealedCharKeys((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        if (next.size >= totalCharCount) {
          markAnimationComplete();
        }
        return next;
      });
    },
    [markAnimationComplete, totalCharCount],
  );

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      setAnimationComplete(true);
      return;
    }

    const target = sectionRef.current;
    if (!target) return;

    let revealed = false;
    const reveal = () => {
      if (revealed) return true;
      const rect = target.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.top < viewport * 0.94 && rect.bottom > viewport * 0.04) {
        revealed = true;
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (reveal()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          revealed = true;
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '80px 0px -4% 0px' },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!isVisible || reducedMotion || animationComplete) return;

    const lastLineIndex = preparedLines.length - 1;
    const lastLineCharCount = preparedLines[lastLineIndex]?.characters.length ?? 0;
    const fallbackMs =
      lastLineIndex * LINE_DELAY + Math.max(0, lastLineCharCount - 1) * CHAR_DELAY + CHAR_ANIMATION_MS + 120;

    const timeoutId = window.setTimeout(markAnimationComplete, fallbackMs);
    return () => window.clearTimeout(timeoutId);
  }, [animationComplete, isVisible, markAnimationComplete, preparedLines, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${className}`}
      data-animation-complete={animationComplete ? 'true' : 'false'}
      aria-labelledby="founder-note-heading"
    >
      <div className={styles.inner}>
        <h2 id="founder-note-heading" className="sr-only">
          Founder quote
        </h2>
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
                  revealedCharKeys.has(character.key) || animationComplete ? styles.charRevealed : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <span
                    key={character.key}
                    className={characterClassName}
                    style={isVisible && !reducedMotion ? { animationDelay: `${delay}ms` } : undefined}
                    onAnimationEnd={
                      isVisible && !reducedMotion
                        ? () => handleCharAnimationEnd(character.key)
                        : undefined
                    }
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
