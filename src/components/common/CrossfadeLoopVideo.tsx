import { useEffect, useRef, type CSSProperties, type FC } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // With loop=true, muted, playsInline, and preload=auto most browsers
    // loop seamlessly. Safari sometimes stops at the loop boundary.
    // The "seeked" + "ended" listeners below catch that edge case and
    // restart playback instantly without any visible freeze.
    const handleEnded = () => {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    };

    const handleSeeked = () => {
      if (video.paused && document.visibilityState === "visible") {
        void video.play().catch(() => undefined);
      }
    };

    const handlePause = () => {
      if (document.visibilityState !== "visible") return;
      // If the video paused itself at the loop boundary, restart it.
      if (
        video.currentTime > 0 &&
        video.duration > 0 &&
        video.currentTime >= video.duration - 0.1
      ) {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      }
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const containerClasses = [styles.container, className ?? ""]
    .filter(Boolean)
    .join(" ");
  const videoClasses = [styles.video, videoClassName ?? "", styles.videoSizing]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} style={style} aria-hidden={ariaHidden}>
      <video
        ref={videoRef}
        className={videoClasses}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterSrc}
        tabIndex={-1}
        disableRemotePlayback
        x-webkit-airplay="deny"
      >
        <source src={webmSrc} type="video/webm" />
        <source src={mp4Src} type="video/mp4" />
      </video>
    </div>
  );
};

export default CrossfadeLoopVideo;
