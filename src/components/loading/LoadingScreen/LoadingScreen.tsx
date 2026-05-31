import styles from './LoadingScreen.module.css';
import logoHero from '@/assets/logo-hero.svg';
import { LoadingScreenProps } from '../types/loading.types';
import { useLanguageContext } from '@/hooks/useLanguage';

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  showProgress = false,
  progress = 0,
  showLogo = true,
  className,
  style,
  'data-testid': dataTestId
}) => {
  const { t } = useLanguageContext();
  const messageToShow = message ?? t('loading.message');
  return (
    <div 
      className={`${styles.container} ${className || ''}`}
      style={style}
      data-testid={dataTestId}
      role="status"
      aria-live="polite"
      aria-label={messageToShow}
    >
      {showLogo && (
        <div className={styles.logoContainer}>
          <img 
            src={logoHero} 
            alt={t('common.logoAlt')} 
            className={styles.logo}
          />
        </div>
      )}
      
      <div className={styles.spinnerContainer}>
        <div 
          className={styles.spinner}
          aria-hidden="true"
        />
      </div>
      
      {messageToShow && (
        <div className={styles.message}>
          {messageToShow}
        </div>
      )}
      
      {showProgress && (
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;