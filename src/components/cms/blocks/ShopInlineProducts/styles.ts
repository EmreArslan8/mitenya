import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'visible',
    pb: { xs: 1, sm: 2 },
  
    '& .slick-slide > div': {
      boxSizing: 'border-box',
    },
    '& .slick-arrow': {
      display: 'none !important',
    },
  },
  
}));

export default useStyles;
