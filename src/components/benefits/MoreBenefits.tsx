import { useLanguageContext } from '@/hooks/useLanguage';
import BenefitItem from './BenefitItem';
import styles from './MoreBenefits.module.css';

import virtualAssistanceIcon from '../../assets/virtual-assistance-icon.svg';
import scalableSolutionsIcon from '../../assets/scalable-solutions-icon.svg';
import personalizedExperiencesIcon from '../../assets/personalized-experiences-icon.svg';
import fasterInnovationIcon from '../../assets/faster-innovation-icon.svg';



const MoreBenefits: React.FC = () => {
  const { t } = useLanguageContext();

  const benefits = [
    { icon: fasterInnovationIcon, text: t('potential.card1.title') },
    { icon: virtualAssistanceIcon, text: t('potential.card2.title') },
    { icon: scalableSolutionsIcon, text: t('potential.card3.title') },
    { icon: personalizedExperiencesIcon, text: t('potential.card4.title') },
  ];

  const extendedBenefits = [...benefits, ...benefits, ...benefits]; // Repeat more times for smooth scrolling with fewer items

  return (
    <div className={styles.moreBenefitsContainer}>
      <div className={styles.slider}>
        <div className={styles.slideTrack}>
          {extendedBenefits.map((benefit, index) => (
            <BenefitItem key={index} icon={benefit.icon} text={benefit.text} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreBenefits;