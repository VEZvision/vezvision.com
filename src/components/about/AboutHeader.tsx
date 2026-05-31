import { useState, useEffect, useRef } from 'react';

import { useInView } from 'framer-motion';
import { useLanguageContext } from '@/hooks/useLanguage';
import SectionBadge from '@/components/ui/SectionBadge';
import { User } from 'lucide-react';

const AboutHeader: React.FC = () => {
  const titleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isTitleVisible = useInView(titleRef, { once: true, amount: 0.3 });
  const isTextVisible = useInView(textRef, { once: true, amount: 0.3 });
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const { t } = useLanguageContext();
  const fullText = t('about.header.fullText');
  const beforeWord = t('about.header.beforeWord');
  const tempWord = t('about.header.tempWord');
  const finalWord = t('about.header.finalWord');



  useEffect(() => {
    // Uruchamiaj animację tylko wtedy, gdy tekstowy blok jest faktycznie widoczny w viewport
    if (!isTextVisible) return;
    const typeSpeed = 50;
    const deleteSpeed = 30;
    const pauseTime = 1000;

    let timeoutId: NodeJS.Timeout;

    const animateText = () => {
      switch (currentPhase) {
        case 0: // Type text up to "tworzenia "
          if (displayText.length < beforeWord.length) {
            timeoutId = setTimeout(() => {
              setDisplayText(beforeWord.slice(0, displayText.length + 1));
            }, typeSpeed);
          } else {
            setCurrentPhase(1);
          }
          break;

        case 1: // Type "klasycznych"
          {
            const currentTempLength = displayText.length - beforeWord.length;
            if (currentTempLength < tempWord.length) {
              timeoutId = setTimeout(() => {
                setDisplayText(beforeWord + tempWord.slice(0, currentTempLength + 1));
              }, typeSpeed);
            } else {
              timeoutId = setTimeout(() => setCurrentPhase(2), pauseTime);
            }
          }
          break;

        case 2: // Delete "klasycznych"
          {
            const tempLength = displayText.length - beforeWord.length;
            if (tempLength > 0) {
              timeoutId = setTimeout(() => {
                setDisplayText(beforeWord + tempWord.slice(0, tempLength - 1));
              }, deleteSpeed);
            } else {
              setCurrentPhase(3);
            }
          }
          break;

        case 3: // Type "nowoczesnych"
          {
            const currentFinalLength = displayText.length - beforeWord.length;
            if (currentFinalLength < finalWord.length) {
              timeoutId = setTimeout(() => {
                setDisplayText(beforeWord + finalWord.slice(0, currentFinalLength + 1));
              }, typeSpeed);
            } else {
              setCurrentPhase(4);
            }
          }
          break;

        case 4: // Type rest of the text
          if (displayText.length < fullText.length) {
            timeoutId = setTimeout(() => {
              setDisplayText(fullText.slice(0, displayText.length + 1));
            }, typeSpeed);
          } else {
            setCurrentPhase(5);
          }
          break;

        case 5: // Animation complete
          break;
      }
    };

    animateText();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [displayText, currentPhase, beforeWord, finalWord, fullText, tempWord, isTextVisible]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ background: '#ffffff' }}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge "O Nas" with Icon */}
        <div
          ref={titleRef}
          className="inline-flex items-center justify-center mb-6 sm:mb-8 md:mb-10"
          style={{
            opacity: isTitleVisible ? 1 : 0,
            transform: isTitleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <SectionBadge text={t('about.header.badge')} icon={<User className="w-3.5 h-3.5" />} />
        </div>

        {/* Main Content with Typing Effect */}
        <div
          ref={textRef}
          className="max-w-3xl mx-auto"
          style={{
            opacity: isTextVisible ? 1 : 0,
            transform: isTextVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}
        >
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed sm:leading-relaxed md:leading-loose text-gray-800 font-medium text-center sm:text-justify px-2 sm:px-4 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px]" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span
              className="font-playfair"
            >
              {displayText}
            </span>
            <span className={`inline-block w-0.5 h-5 sm:h-6 md:h-7 lg:h-8 bg-gray-800 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHeader;