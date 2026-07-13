import styles from "./LoadingScreen.module.css";
import logoNavbar from "@brand/wordmark-horizontal-dark.svg";
import type { LoadingScreenProps } from "../types/loading.types";
import { useLanguageContext } from "@/hooks/useLanguage";

function LoadingScreen({
  message,
  showProgress = false,
  progress = 0,
  showLogo = true,
  className,
  style,
  "data-testid": dataTestId,
}: LoadingScreenProps) {
  const { t } = useLanguageContext();
  const messageToShow = message ?? t("loading.message");
  return (
    <div
      className={`${styles.container} ${className || ""}`}
      style={style}
      data-testid={dataTestId}
      role="status"
      aria-live="polite"
      aria-label={messageToShow}
    >
      {showLogo && (
        <div className={styles.logoContainer}>
          <img
            src={logoNavbar}
            alt={t("common.logoAlt")}
            width="838"
            height="153"
            className={styles.logo}
          />
        </div>
      )}

      <div className={styles.spinnerContainer}>
        <div className={styles.spinner} aria-hidden="true" />
      </div>

      {messageToShow && <div className={styles.message}>{messageToShow}</div>}

      {showProgress && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{
              transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})`,
            }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
