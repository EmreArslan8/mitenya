'use client';

import { Button as MuiButton } from '@mui/material';
import styles from './styles';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from '@/components/icons';
import { sendButtonClickEvent } from '@/lib/utils/googleAnalytics';
import { useTheme } from '@mui/material/styles';

const arrowSizes = {
  small: 16,
  medium: 22,
  large: 24,
};

const Button = ({
  arrow,
  children,
  href,
  onClick,
  dataLayerEventId,
  loading: _loading,
  ...props
}: any) => {
  const router = useRouter();
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent) => {
    if (dataLayerEventId) sendButtonClickEvent(dataLayerEventId);
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (href) router.push(href);
  };

  return (
    <MuiButton
      startIcon={arrow === 'start' && <Arrow position="start" size={props.size} />}
      endIcon={arrow === 'end' && <Arrow position="end" size={props.size} />}
      {...props}
      onClick={handleClick}
      sx={[styles.button(theme.direction), props.sx]}
    >
      {children}
    </MuiButton>
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
    <ChevronLeft size={iconSize} />
  ) : (
    <ChevronRight size={iconSize} />
  );
};

export default Button;
