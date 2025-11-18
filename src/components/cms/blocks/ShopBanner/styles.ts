import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  sliderContainer: {
    width: { xs: '100vw', sm: '100%' },
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    pb: 3,
    '& .slick-slider': { maxWidth: '100vw' },
    '& .slick-list': { borderRadius: { sm: 1.5 } },
    '& .slick-dots': { bottom: -28 },
    '& .slick-dots li': { margin: 0 },
    '& .slick-dots li button:before': { fontSize: 8 },
  },
  prevButton: {
    position: 'absolute',
    top: '50%',
    left: 10,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 28,
    height: 28,
    opacity: { xs: 0, sm: 1 },
  },
  nextButton: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 28,
    height: 28,
    opacity: { xs: 0, sm: 1 },
  },
}));

export default useStyles;
