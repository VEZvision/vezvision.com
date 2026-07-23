import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";

import styles from "./CrossfadeLoopVideo.module.css";

export interface CrossfadeLoopVideoProps {
  mp4Src: string;
  webmSrc: string;
  posterSrc?: string;
  className?: string;
  videoClassName?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}

export const CrossfadeLoopVideo: FC<CrossfadeLoopVideoProps> = ({
  mp4Src,
  webmSrc,
  posterSrc,
  className,
  videoClassName,
  style,
  "aria-hidden": ariaHidden,
}) => {
  const [duration, setDuration] = useState<number | null>(null);
  const [phase, setPhase] = useState(0);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const startBoth = useCallback(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB || duration == null) return;

    videoA.currentTime = 0;
    videoB.currentTime = duration / 2;

    void videoA.play().catch(() => undefined);
    void videoB.play().catch(() => undefined);

    startedRef.current = true;
  }, [duration]);

  const onLoadedMetadata = useCallback(
    (target: HTMLVideoElement) => {
      if (target.duration && target.duration > 0) {
        setDuration((prev) =>
          prev == null ? target.duration : Math.max(prev, target.duration),
        );
      }
    },
    [setDuration],
  );

  const restartVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video || duration == null) return;
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    },
    [duration],
  );

  useEffect(() => {
    if (duration == null) return;
    if (!startedRef.current) {
      startBoth();
    }
  }, [duration, startBoth]);

  useEffect(() => {
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    const handleAEnded = () => restartVideo(videoA);
    const handleBEnded = () => restartVideo(videoB);
    const handleAStalled = () => restartVideo(videoA);
    const handleBStalled = () => restartVideo(videoB);
    const handlePause = () => {
      if (document.visibilityState !== "visible") return;
      restartVideo(videoA);
      restartVideo(videoB);
    };

    videoA.addEventListener("ended", handleAEnded);
    videoB.addEventListener("ended", handleBEnded);
    videoA.addEventListener("stalled", handleAStalled);
    videoB.addEventListener("stalled", handleBStalled);
    videoA.addEventListener("pause", handlePause);
    videoB.addEventListener("pause", handlePause);
    document.addEventListener("visibilitychange", startBoth);

    return () => {
      videoA.removeEventListener("ended", handleAEnded);
      videoB.removeEventListener("ended", handleBEnded);
      videoA.removeEventListener("stalled", handleAStalled);
      videoB.removeEventListener("stalled", handleBStalled);
      videoA.removeEventListener("pause", handlePause);
      videoB.removeEventListener("pause", handlePause);
      document.removeEventListener("visibilitychange", startBoth);
    };
  }, [duration, restartVideo, startBoth]);

  useEffect(() => {
    const update = () => {
      const videoA = videoARef.current;
      if (videoA && videoA.duration > 0) {
        const nextPhase = videoA.currentTime / videoA.duration;
        setPhase(nextPhase);
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  let opacityA = 1;
  let opacityB = 0;
  if (phase >= 0.5) {
    opacityA = 2 * (1 - phase);
    opacityB = 2 * (phase - 0.5);
  }

  const containerClasses = [styles.container, className ?? ""]
    .filter(Boolean)
    .join(" ");
  const videoClasses = [styles.video, videoClassName ?? "", styles.videoSizing]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} style={style} aria-hidden={ariaHidden}>
      <video
        ref={videoARef}
        className={videoClasses}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={posterSrc}
        tabIndex={-1}
        disableRemotePlayback
        x-webkit-airplay="deny"
        onLoadedMetadata={(e) => onLoadedMetadata(e.currentTarget)}
        style={{ opacity: opacityA }}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>
      <video
        ref={videoBRef}
        className={videoClasses}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={posterSrc}
        tabIndex={-1}
        disableRemotePlayback
        x-webkit-airplay="deny"
        onLoadedMetadata={(e) => onLoadedMetadata(e.currentTarget)}
        style={{ opacity: opacityB }}
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>
      {/* This overlay smooths the reset instant by hiding any single-frame glitch */}
      <div className={styles.frameOverlay} style={{ opacity: 0 }} />
    </div>
  );
};

export default CrossfadeLoopVideo;
