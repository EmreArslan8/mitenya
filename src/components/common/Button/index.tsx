'use client';

import { LoadingButton } from '@mui/lab';
import styles from './styles';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { sendButtonClickEvent } from '@/lib/utils/googleAnalytics';

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
  dataLayerEventId,
  ...props
}: any) => {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent) => {
    if (dataLayerEventId) sendButtonClickEvent(dataLayerEventId);
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (href) router.push(href);
  };

  return (
    <LoadingButton
      startIcon={arrow === 'start' && <Arrow position="start" size={props.size} />}
      endIcon={arrow === 'end' && <Arrow position="end" size={props.size} />}
      {...props}
      onClick={handleClick}
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
  const iconSize = arrowSizes[size];
  return position === 'start' ? (
    <ArrowLeft size={iconSize} />
  ) : (
    <ArrowRight size={iconSize} />
  );
};

export default Button;
