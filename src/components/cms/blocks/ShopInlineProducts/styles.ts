import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
    pb: { xs: 1, sm: 2 },
    transform: 'none',
    '& .slick-slide > div': { boxSizing: 'border-box' },
  },
}));

export default useStyles;
