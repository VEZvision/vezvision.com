export interface LoadingScreenProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  showLogo?: boolean;
}
