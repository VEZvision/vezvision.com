import styles from './BenefitItem.module.css';

interface BenefitItemProps {
  icon: string;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => {
  return (
    <div className={styles.benefitItem}>
      <img src={icon} alt={`${text} icon`} className={styles.icon} loading="lazy" decoding="async" />
      <span className={styles.text}>{text}</span>
    </div>
  );
};

export default BenefitItem;
