import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: { xs: 'calc(100vw + 20px)', sm: 'calc(100% + 16px)' },
    alignSelf: 'center',
    alignItems: 'end',
    position: 'relative',
    overflow: 'hidden',
    pb: { xs: 1, sm: 2 },
    transform: { xs: 'translateX(-10px)', sm: 'translateX(-8)' },
  },
}));

export default useStyles;
