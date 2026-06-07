import styles from './BenefitItem.module.css';

interface BenefitItemProps {
  icon: string;
  text: string;
  ariaHidden?: boolean;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text, ariaHidden = false }) => {
  return (
    <div className={styles.benefitItem} aria-hidden={ariaHidden || undefined}>
      <img src={icon} alt={`${text} icon`} className={styles.icon} loading="lazy" decoding="async" />
      <span className={styles.text}>{text}</span>
    </div>
  );
};

export default BenefitItem;
