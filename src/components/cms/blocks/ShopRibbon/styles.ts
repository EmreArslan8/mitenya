import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

const useStyles = withPalette(
  (palette) => (colorway: 'primary' | 'info' | 'success' | 'error' | 'warning') => ({
    container: {
      position: 'relative',
      alignItems: 'center',
      background: palette[colorway].gradient,
      color: palette[colorway].contrastText,
      borderRadius: 1.5,
      minHeight: 100,
      my: -2,
    },
    content: {
      alignItems: 'center',
      textAlign: 'center',
      px: { xs: 1, sm: 2 },
      py: { xs: 2, sm: 3 },
      gap: 1,
      zIndex: 1,
    },
    text: { alignItems: 'center', gap: 1 },
    image: {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      objectFit: 'cover',
      zIndex: 0,
      borderRadius: 12,
    } as CSSProperties,
    markdownOptions: { a: { style: { textDecoration: 'underline' } } },
  })
);

export default useStyles;
