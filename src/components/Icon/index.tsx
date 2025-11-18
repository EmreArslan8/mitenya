'use client';

import { Box, SxProps } from '@mui/material';
import { usePalette } from '@/theme/ThemeRegistry';

export interface IconProps {
  name: string;
  fill?: boolean;
  weight?: number;
  fontSize?: number;
  color?: string;
  sx?: SxProps;
  onClick?: () => void;
  href?: string;
  target?: '_self' | '_blank';
}

const Icon = ({
  name,
  fill = false,
  weight = 400,
  fontSize = 24,
  color = 'inherit',
  sx,
  onClick,
  href,
  target = '_self',
}: IconProps) => {
  const palette = usePalette();

  // ⭐ en temiz çözüm — ANY YOK
  const resolvedColor =
    palette[color as keyof typeof palette]?.main ?? color;

  return (
    <Box
      component={href ? 'a' : 'div'}
      href={href}
      target={target}
      className="material-symbols-rounded"
      sx={{
        userSelect: 'none',
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}`,
        fontSize: `${fontSize}px !important`,
        color: resolvedColor,
        cursor: onClick || href ? 'pointer' : 'unset',
        textDecoration: 'none',
        ...sx,
      }}
      onClick={onClick}
    >
      {name}
    </Box>
  );
};

export default Icon;
