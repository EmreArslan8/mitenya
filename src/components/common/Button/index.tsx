'use client';

import { useRouter } from 'next/navigation';
import Icon from '../../Icon';
import styles from './styles';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';

const arrowSizes = {
  small: 20,
  medium: 22,
  large: 24,
};

export interface ButtonProps
  extends Omit<LoadingButtonProps, 'startIcon' | 'endIcon'> {
  arrow?: 'none' | 'start' | 'end';
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  dataLayerEventId?: string | null;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
target?: '_self' | '_blank';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Button = ({
  arrow = 'none',
  children,
  href,
  onClick,
  dataLayerEventId,
  size = 'medium',
  sx,
  startIcon,
  endIcon,
  ...restProps
}: ButtonProps) => {
  const router = useRouter();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (href) {
      e.preventDefault();
      router.push(href);
      return;
    }
    onClick?.(e);
  };

  return (
    <LoadingButton
      {...restProps}
      size={size}
      startIcon={
        arrow === 'start'
          ? <Arrow position="start" size={size} />
          : startIcon // Kullanıcı verdi ise onu kullan
      }
      endIcon={
        arrow === 'end'
          ? <Arrow position="end" size={size} />
          : endIcon // Kullanıcı verdi ise onu kullan
      }
      onClick={handleClick}
      sx={{ ...styles.button, ...sx }}
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
  size: 'small' | 'medium' | 'large';
}) => {
  const iconName = position === 'start' ? 'arrow_back' : 'arrow_forward';
  return <Icon name={iconName} fontSize={arrowSizes[size]} />;
};

export default Button;
