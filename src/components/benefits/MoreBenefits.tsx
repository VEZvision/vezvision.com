import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useLanguageContext } from "@/hooks/useLanguage";
import BenefitItem from "./BenefitItem";
import styles from "./MoreBenefits.module.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import virtualAssistanceIcon from "../../assets/virtual-assistance-icon.svg";
import scalableSolutionsIcon from "../../assets/scalable-solutions-icon.svg";
import personalizedExperiencesIcon from "../../assets/personalized-experiences-icon.svg";
import fasterInnovationIcon from "../../assets/faster-innovation-icon.svg";

const MARQUEE_SPEED_PX_PER_SEC = 20;
const MIN_COPIES = 3;

const MoreBenefits: React.FC = () => {
  const { t } = useLanguageContext();
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const offsetRef = useRef(0);

  const benefits = useMemo(
    () => [
      { icon: fasterInnovationIcon, text: t("potential.card1.title") },
      { icon: virtualAssistanceIcon, text: t("potential.card2.title") },
      { icon: scalableSolutionsIcon, text: t("potential.card3.title") },
      { icon: personalizedExperiencesIcon, text: t("potential.card4.title") },
    ],
    [t],
  );

  useEffect(() => {
    if (reducedMotion) return;

    const track = trackRef.current;
    const set = setRef.current;
    const container = trackRef.current?.closest(
      `.${styles.moreBenefitsContainer}`,
    );
    if (!track || !set || !container) return;

    let setWidth = 0;
    let isVisible = true;

    const measure = () => {
      const w = Math.ceil(set.getBoundingClientRect().width);
      if (w <= 0) return;
      setWidth = w;
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(set);
    resizeObserver.observe(track);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
      },
      { rootMargin: "100px 0px" },
    );
    visibilityObserver.observe(container);

    let lastTime = 0;

    const animate = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
        rafId.current = requestAnimationFrame(animate);
        return;
      }

      const deltaSec = (time - lastTime) / 1000;
      lastTime = time;

      if (isVisible && setWidth > 0) {
        offsetRef.current += MARQUEE_SPEED_PX_PER_SEC * deltaSec;
        if (offsetRef.current >= setWidth) {
          offsetRef.current -= setWidth;
        }
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId.current);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [benefits, reducedMotion]);

  if (reducedMotion) {
    return (
      <div className={styles.moreBenefitsContainer}>
        <div className={styles.slider}>
          <div className={`${styles.slideTrack} ${styles.slideTrackStatic}`}>
            {benefits.map((benefit, index) => (
              <BenefitItem
                key={index}
                icon={benefit.icon}
                text={benefit.text}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initialCopyCount = MIN_COPIES;

  return (
    <div className={styles.moreBenefitsContainer}>
      <div className={styles.slider}>
        <div
          ref={trackRef}
          className={styles.slideTrack}
          style={{ willChange: "transform" } as CSSProperties}
        >
          {Array.from({ length: initialCopyCount }, (_, copyIndex) => (
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
