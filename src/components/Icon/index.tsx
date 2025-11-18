'use client';

import { usePalette } from '@/theme/ThemeRegistry';
import { Box, SxProps } from '@mui/material';

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
  const fontVariationSettings = `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}`;

  return (
    <Box
      component={href ? 'a' : 'div'}
      href={href}
      target={target}
      className="material-symbols-rounded"
      sx={{
        userSelect: 'none',
        fontVariationSettings,
        fontSize: `${fontSize}px !important`,
        color: (palette as any)[color]?.main ?? color,
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
