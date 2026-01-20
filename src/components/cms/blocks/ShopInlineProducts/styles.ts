import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
    pb: { xs: 1, sm: 2 },
  
    '& .slick-slide > div': {
      boxSizing: 'border-box',
    },
  
    // 🔥 slick'in kendi arrow DOM'unu tamamen kaldır
    '& .slick-arrow': {
      display: 'none !important',
    },
  },
  
}));

export default useStyles;
