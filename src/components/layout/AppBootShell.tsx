import logoNavbar from "@/assets/logo-navbar.svg";
import styles from "@/components/loading/LoadingScreen/LoadingScreen.module.css";

/** Branded loading shell used before language/settings/routes are ready. */
export default function AppBootShell() {
  return (
    <div
      className={styles.container}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className={styles.logoContainer}>
        <img
          src={logoNavbar}
          alt="VEZvision"
          width="838"
          height="153"
          className={styles.logo}
        />
      </div>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner} aria-hidden="true" />
      </div>
      <div className={styles.message}>Loading</div>
    </div>
  );
}
