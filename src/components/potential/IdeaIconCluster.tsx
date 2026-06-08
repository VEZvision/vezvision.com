import styles from './PotentialSection.module.css';
import logoNavbar from '@/assets/logo-navbar.svg';

const SATELLITES = [
  {
    id: 'globe',
    className: styles.satelliteGlobe,
    children: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
  {
    id: 'github',
    className: styles.satelliteGithub,
    children: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
      </svg>
    ),
  },
  {
    id: 'robot',
    className: styles.satelliteRobot,
    children: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="4" y="8" width="16" height="10" rx="2" />
        <circle cx="9" cy="13" r="1.5" fill="currentColor" />
        <circle cx="15" cy="13" r="1.5" fill="currentColor" />
        <path d="M8 6l-2-2M16 6l2-2" />
      </svg>
    ),
  },
  {
    id: 'cube',
    className: styles.satelliteCube,
    children: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" />
        <line x1="12" y1="22" x2="12" y2="8" />
        <line x1="2" y1="8" x2="12" y2="12" />
        <line x1="22" y1="8" x2="12" y2="12" />
      </svg>
    ),
  },
] as const;

/** Pure CSS cluster — no Framer Motion (breaks with Lenis + stays at opacity:0). */
const IdeaIconCluster: React.FC = () => (
  <div className={styles.iconCluster} aria-hidden>
    <div className={styles.centralLogoPlate}>
      <img src={logoNavbar} alt="" className="w-10 h-10 object-contain" />
    </div>
    {SATELLITES.map((sat) => (
      <div key={sat.id} className={`${styles.appCircle} ${sat.className}`}>
        {sat.children}
      </div>
    ))}
  </div>
);

export default IdeaIconCluster;
