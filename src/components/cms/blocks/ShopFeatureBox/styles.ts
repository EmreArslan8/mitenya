import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

const useStyles = withPalette((palette) => ({
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: { xs: 200, sm: 300 , md: 500 },
  },
  image: (imageFit: 'cover' | 'contain') =>
    ({
      border: '1px solid',
      borderColor: palette.text.light,
      borderRadius: 8,
      objectFit: imageFit,
      padding: imageFit === 'contain' ? 16 : 0,
    } as CSSProperties),
  text: {
    alignItems: 'start',
    gap: 1,
  },
}));

export default useStyles;
