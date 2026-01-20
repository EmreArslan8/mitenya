import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: { xs: '100vw', sm: '100%' },
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    pb: 3,

    '& .slick-slider': { maxWidth: '100vw' },
    '& .slick-list': { borderRadius: { sm: 1.5 } },

    // ✅ loader background'ı kapat (ajax-loader.gif request riskini de düşürür)
    '& .slick-loading .slick-list': {
      background: 'transparent !important',
    },

    // ✅ dots: font kullanmadan
    '& .slick-dots': {
      bottom: -28,
      display: 'flex !important',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },

    '& .slick-dots li': {
      margin: 0,
      width: 'auto',
      height: 'auto',
    },

    '& .slick-dots li button': {
      padding: 0,
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    '& .slick-dots li button:before': {
      content: '""', // ❗ '•' yok, font yok
      display: 'block',
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.text.light,
      opacity: 1,
      transition: 'all .2s ease',
    },

    '& .slick-dots li.slick-active button:before': {
      backgroundColor: palette.text.main,
      transform: 'scale(1.25)',
    },
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
