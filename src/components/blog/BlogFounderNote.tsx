import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './BlogFounderNote.module.scss';

type QuoteSegment = {
  text: string;
  highlight?: boolean;
  quote?: boolean;
};

const QUOTE_LINES: Array<{ id: string; segments: QuoteSegment[] }> = [
  {
    id: 'line-one',
    segments: [
      { text: '"', quote: true },
      { text: 'We use ' },
      { text: 'your data', highlight: true },
      { text: ' to understand your audience,' },
    ],
  },
  {
    id: 'line-two',
    segments: [
      { text: 'and use ' },
      { text: 'AI', highlight: true },
      { text: ' to help your brand communicate more clearly.' },
    ],
  },
  {
    id: 'line-three',
    segments: [
      { text: 'Most importantly, ' },
      { text: 'we build it', highlight: true },
      { text: ' with you.' },
      { text: '"', quote: true },
    ],
  },
];

interface AnimatedCharacter {
  char: string;
  highlight: boolean;
  quote: boolean;
  key: string;
}

interface BlogFounderNoteProps {
  className?: string;
}

const BlogFounderNote: React.FC<BlogFounderNoteProps> = ({ className = '' }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -15%',
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const preparedLines = useMemo(() =>
    QUOTE_LINES.map((line) => {
      const characters: AnimatedCharacter[] = [];

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

      return {
        ...line,
        characters,
      };
    }),
  [],
  );

  const CHAR_DELAY = 46;
  const LINE_DELAY = 320;

  return (
    <section ref={sectionRef} className={`${styles.section} ${className}`} aria-labelledby="founder-note-heading">
      <div className={styles.inner}>
        <h2 id="founder-note-heading" className="sr-only">
          Founder quote
        </h2>
        {preparedLines.map((line, lineIndex) => {
          const baseDelay = lineIndex * LINE_DELAY;

          return (
            <p key={line.id} className={styles.line} data-visible={isVisible ? 'true' : 'false'}>
              {line.characters.map((character, charIndex) => {
                const delay = baseDelay + charIndex * CHAR_DELAY;
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

export default BlogFounderNote;
