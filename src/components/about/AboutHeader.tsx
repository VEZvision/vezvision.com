import { useState, useEffect, useRef, useCallback } from "react";

import styles from "./AboutHeader.module.css";
import { registerRevealElement } from "@/reveal/revealRegistry";
import { useLanguageContext } from "@/hooks/useLanguage";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SectionBadge from "@/components/ui/SectionBadge";
import { User } from "lucide-react";

function AboutHeader() {
  const titleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();
  const fullText = t("about.header.fullText");
  const beforeWord = t("about.header.beforeWord");
  const tempWord = t("about.header.tempWord");
  const finalWord = t("about.header.finalWord");

  const onTitleReveal = useCallback(() => setIsTitleVisible(true), []);
  const onTextReveal = useCallback(() => setIsTextVisible(true), []);

  useEffect(() => {
    const titleEl = titleRef.current;
    const textEl = textRef.current;
    const cleanups: Array<() => void> = [];

    if (titleEl) {
      cleanups.push(
        registerRevealElement(titleEl, {
          once: true,
          amount: 0.3,
          onReveal: onTitleReveal,
        }),
      );
    }
    if (textEl) {
      cleanups.push(
        registerRevealElement(textEl, {
          once: true,
          amount: 0.3,
          onReveal: onTextReveal,
        }),
      );
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [onTitleReveal, onTextReveal]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(fullText);
      setCurrentPhase(5);
      return;
    }

    if (!isTextVisible) return;
    const typeSpeed = 50;
    const deleteSpeed = 30;
    const pauseTime = 1000;

    let timeoutId: NodeJS.Timeout;

    const animateText = () => {
      switch (currentPhase) {
        case 0:
          if (displayText.length < beforeWord.length) {
            timeoutId = setTimeout(() => {
              setDisplayText(beforeWord.slice(0, displayText.length + 1));
            }, typeSpeed);
          } else {
            setCurrentPhase(1);
          }
          break;

        case 1: {
          const currentTempLength = displayText.length - beforeWord.length;
          if (currentTempLength < tempWord.length) {
            timeoutId = setTimeout(() => {
              setDisplayText(
                beforeWord + tempWord.slice(0, currentTempLength + 1),
              );
            }, typeSpeed);
          } else {
            timeoutId = setTimeout(() => setCurrentPhase(2), pauseTime);
          }
          break;
        }

        case 2: {
          const tempLength = displayText.length - beforeWord.length;
          if (tempLength > 0) {
            timeoutId = setTimeout(() => {
              setDisplayText(beforeWord + tempWord.slice(0, tempLength - 1));
            }, deleteSpeed);
          } else {
            setCurrentPhase(3);
          }
          break;
        }

        case 3: {
          const currentFinalLength = displayText.length - beforeWord.length;
          if (currentFinalLength < finalWord.length) {
            timeoutId = setTimeout(() => {
              setDisplayText(
                beforeWord + finalWord.slice(0, currentFinalLength + 1),
              );
            }, typeSpeed);
          } else {
            setCurrentPhase(4);
          }
          break;
        }

        case 4:
          if (displayText.length < fullText.length) {
            timeoutId = setTimeout(() => {
              setDisplayText(fullText.slice(0, displayText.length + 1));
            }, typeSpeed);
          } else {
            setCurrentPhase(5);
          }
          break;

        case 5:
          break;
      }
    };

    animateText();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    displayText,
    currentPhase,
    beforeWord,
    finalWord,
    fullText,
    tempWord,
    isTextVisible,
    reducedMotion,
  ]);

  useEffect(() => {
    if (reducedMotion) {
      setShowCursor(false);
      return;
    }

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [reducedMotion]);

  return (
    <section
      className={`py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 ${styles.section}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <div
          ref={titleRef}
          className={`inline-flex items-center justify-center mb-6 sm:mb-8 md:mb-10 ${styles.reveal} ${isTitleVisible ? styles.revealVisible : ""}`}
        >
          <SectionBadge
            text={t("about.header.badge")}
            icon={<User className="w-3.5 h-3.5" />}
          />
        </div>

        <div
          ref={textRef}
          className={`max-w-3xl mx-auto ${styles.revealDelayed} ${isTextVisible ? styles.revealDelayedVisible : ""}`}
        >
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed sm:leading-relaxed md:leading-loose text-gray-800 font-medium text-center sm:text-justify px-2 sm:px-4 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px]">
            <span className="font-sans">{displayText}</span>
            <span
              aria-hidden="true"
              className={`inline-block w-0.5 h-5 sm:h-6 md:h-7 lg:h-8 bg-gray-800 ml-1 ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
            />
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutHeader;
