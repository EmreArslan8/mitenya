import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

type Variant = 'default' | 'compact';

const useStyles = withPalette((palette) => ({
  root: (variant: Variant) => ({
    card: {
      height: '100%',
      borderRadius: variant === 'default' ? 1 : 1.5,
    },

    cardBody: {
      position: 'relative',
      alignItems: 'start',
      textDecoration: 'none',
      color: 'inherit',
      ...(variant === 'default'
        ? { gap: 1 }
        : {
            flexDirection: 'row',
            alignItems: 'center',
            background: palette.bg.light,
            gap: { xs: 1, sm: 1.5 },
            p: 1,
            minHeight: 56,
          }),
    },

    imageContainer: {
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      borderRadius: 1,
      ...(variant === 'default'
        ? { width: '100%', aspectRatio: '1.4' }
        : { width: { xs: 36, sm: 48 }, height: { xs: 36, sm: 48 } }),
    },

    image: {
      objectFit: 'contain',
    } as CSSProperties,

    textContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...(variant === 'default'
        ? {
            position: 'absolute',
            bottom: 0,
            background: palette.bg.contrastText,
            mixBlendMode: 'hard-light',
            color: palette.bg.dark,
            py: { xs: 0.5, sm: '6px' },
            px: { xs: 1, sm: 1.5 },
            borderRadius: '0 0 8px 8px',
          }
        : { borderRadius: '0 0 12px 12px' }),
    },

    title: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: variant === 'compact' ? 1.2 : 'normal',
      display: '-webkit-box',
      WebkitLineClamp: variant === 'default' ? 1 : 2,
      WebkitBoxOrient: 'vertical',
      fontSize: { xs: 13, sm: 14 },
    },

    description: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical',
      fontSize: { xs: 11, sm: 12 },
    },
  }),
}));

export default useStyles;
