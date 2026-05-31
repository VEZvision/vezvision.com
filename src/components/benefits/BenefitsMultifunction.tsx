import styles from './BenefitsMultifunction.module.css';
import toolsIcon from '../../assets/benefits-tools-icon.svg';
import multifunctionIcon from '../../assets/benefits-multifunction-icon.svg';
import { useLanguageContext } from '../../hooks/useLanguage';

const BenefitsMultifunction: React.FC = () => {
  const { t } = useLanguageContext();

  return (
    <article 
      className={styles.desktopAnimate2}
      role="region"
      aria-labelledby="container3-title"
    >
      <div className={styles.textContainer}>
        <h3 
          id="container3-title"
          className={styles.jednoMiejsceWieleMoL}
        >
          {t('benefits.multifunction.title')}
        </h3>
        <div className={styles.paragraph}>
          <p className={styles.odKreatywnegoProjekt}>
            {t('benefits.multifunction.description')}
          </p>
        </div>
      </div>
      
      {/* Tło okrągłe */}
      <div 
        className={styles.shape} 
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Mały kontener z ikoną */}
      <div className={styles.container}>
        <img 
          src={toolsIcon} 
          className={styles.component1}
          alt={t('benefits.multifunction.toolsAlt')}
        />
      </div>
      
      {/* Główny kontener z ikoną */}
      <div className={styles.backgroundShadow}>
        <div className={styles.shape2}>
          <img 
            src={multifunctionIcon} 
            className={styles.icon}
            alt={t('benefits.multifunction.mainAlt')}
          />
        </div>
      </div>
    </article>
  );
};

export default BenefitsMultifunction;
