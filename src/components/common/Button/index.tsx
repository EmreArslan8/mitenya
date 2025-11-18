'use client';

import { LoadingButton } from '@mui/lab';
import Icon from '../../Icon';
import styles from './styles';
import { useRouter } from 'next/navigation';

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
  dataLayerEventId: _dataLayerEventId,
  ...props
}: any) => {
  const router = useRouter();
  return (
    <LoadingButton
      startIcon={arrow === 'start' && <Arrow position="start" size={props.size} />}
      endIcon={arrow === 'end' && <Arrow position="end" size={props.size} />}
      {...props}
      onClick={href ? () => router.push(href) : onClick}
      sx={{ ...styles.button, ...props.sx }}
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
