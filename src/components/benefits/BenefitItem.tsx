import { memo } from 'react';
import styles from './BenefitItem.module.css';

interface BenefitItemProps {
  icon: string;
  text: string;
  ariaHidden?: boolean;
}

function BenefitItem({ icon, text, ariaHidden = false }: BenefitItemProps) {
  return (
    <div className={styles.benefitItem} aria-hidden={ariaHidden || undefined}>
      <img src={icon} alt={`${text} icon`} className={styles.icon} loading="lazy" decoding="async" />
      <span className={styles.text}>{text}</span>
    </div>
  );
}

const MemoizedBenefitItem = memo(BenefitItem);
MemoizedBenefitItem.displayName = 'BenefitItem';

export default MemoizedBenefitItem;
