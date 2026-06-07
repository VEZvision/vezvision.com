import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLanguageContext } from '@/hooks/useLanguage';
import BenefitItem from './BenefitItem';
import styles from './MoreBenefits.module.css';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import virtualAssistanceIcon from '../../assets/virtual-assistance-icon.svg';
import scalableSolutionsIcon from '../../assets/scalable-solutions-icon.svg';
import personalizedExperiencesIcon from '../../assets/personalized-experiences-icon.svg';
import fasterInnovationIcon from '../../assets/faster-innovation-icon.svg';

const MARQUEE_SPEED_PX_PER_SEC = 20;
const MIN_MARQUEE_COPIES = 3;

function getMarqueeCopyCount(setWidthPx: number, viewportWidthPx: number): number {
  if (setWidthPx <= 0) return MIN_MARQUEE_COPIES;
  return Math.max(MIN_MARQUEE_COPIES, Math.ceil((viewportWidthPx + setWidthPx) / setWidthPx));
}

const MoreBenefits: React.FC = () => {
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();
  const sliderRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [loopShiftPx, setLoopShiftPx] = useState(0);
  const [copyCount, setCopyCount] = useState(MIN_MARQUEE_COPIES);

  const benefits = useMemo(
    () => [
      { icon: fasterInnovationIcon, text: t('potential.card1.title') },
      { icon: virtualAssistanceIcon, text: t('potential.card2.title') },
      { icon: scalableSolutionsIcon, text: t('potential.card3.title') },
      { icon: personalizedExperiencesIcon, text: t('potential.card4.title') },
    ],
    [t],
  );

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const node = setRef.current;
    const slider = sliderRef.current;
    if (!node || !slider) return;

    const measure = () => {
      const setWidthPx = Math.ceil(node.getBoundingClientRect().width);
      if (setWidthPx <= 0) return;

      const viewportWidthPx = slider.clientWidth;
      setLoopShiftPx(setWidthPx);
      setCopyCount(getMarqueeCopyCount(setWidthPx, viewportWidthPx));
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    resizeObserver.observe(slider);
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [benefits, reducedMotion]);

  const marqueeDurationSec =
    loopShiftPx > 0 ? Math.max(48, loopShiftPx / MARQUEE_SPEED_PX_PER_SEC) : 0;

  const marqueeStyle =
    loopShiftPx > 0
      ? ({
          ['--marquee-shift' as string]: `${loopShiftPx}px`,
          ['--marquee-duration' as string]: `${marqueeDurationSec}s`,
        } as CSSProperties)
      : undefined;

  if (reducedMotion) {
    return (
      <div className={styles.moreBenefitsContainer}>
        <div className={styles.slider}>
          <div className={`${styles.slideTrack} ${styles.slideTrackStatic}`}>
            {benefits.map((benefit, index) => (
              <BenefitItem key={index} icon={benefit.icon} text={benefit.text} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.moreBenefitsContainer}>
      <div ref={sliderRef} className={styles.slider}>
        <div
          className={`${styles.slideTrack} ${loopShiftPx > 0 ? styles.slideTrackActive : ''}`}
          style={marqueeStyle}
        >
          {Array.from({ length: copyCount }, (_, copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 0 ? setRef : undefined}
              className={styles.marqueeSet}
              aria-hidden={copyIndex > 0 ? true : undefined}
            >
              {benefits.map((benefit, index) => (
                <BenefitItem
                  key={`${copyIndex}-${index}`}
                  icon={benefit.icon}
                  text={benefit.text}
                  ariaHidden={copyIndex > 0}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreBenefits;
