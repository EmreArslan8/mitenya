'use client';

import { useRouter } from 'next/navigation';
import Icon from '../../Icon';
import styles from './styles';
import { LoadingButton } from '@mui/lab';

const arrowSizes = {
  small: 20,
  medium: 22,
  large: 24,
};

const Button = ({
  arrow,
  children,
  href,
  onClick,
  dataLayerEventId, // ❗ Hâlâ alıyoruz ama DOM’a göndermiyoruz
  ...restProps       // ❗ Artık içinde dataLayerEventId yok
}: any) => {
  const router = useRouter();

  return (
    <LoadingButton
      startIcon={arrow === 'start' && <Arrow position="start" size={restProps.size} />}
      endIcon={arrow === 'end' && <Arrow position="end" size={restProps.size} />}
      {...restProps}                  // ❌ dataLayerEventId DOM’a gitmiyor → uyarı biter
      onClick={href ? () => router.push(href) : onClick}  // ✔ akış aynı
      sx={{ ...styles.button, ...restProps.sx }}
    >
      {children}
    </LoadingButton>
  );
};

const Arrow = ({
  position,
  size = 'medium',
}: {
  position: 'end' | 'start';
  size?: 'small' | 'medium' | 'large';
}) => {
  const iconName = position === 'start' ? 'arrow_back' : 'arrow_forward';
  return <Icon name={iconName} fontSize={arrowSizes[size]} />;
};

export default Button;
