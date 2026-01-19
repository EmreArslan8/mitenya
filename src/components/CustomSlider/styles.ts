import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    '& .slick-list': {
      overflow: 'hidden',
    },

    '& .slick-dots': {
      bottom: -24,
      display: 'flex !important',
      justifyContent: 'center',
      alignItems: 'center',

      '& li': {
        width: 'auto',
        height: 'auto',
        margin: '0 4px',
      },

      '& li button': {
        padding: 0,
      },

      '& li button:before': {
        content: '""',             
        display: 'block',
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: palette.text.light,
        opacity: 1,
        transition: 'all .2s ease',
      },

      '& li.slick-active button:before': {
        backgroundColor: palette.text.main,
        transform: 'scale(1.2)',
      },
    },
  },

  prevButton: {
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 28,
    height: 28,
    opacity: { xs: 0, sm: 1 },

    // opsiyonel hover
    '&:hover': {
      backgroundColor: palette.bg?.main ?? 'rgba(0,0,0,0.04)',
    },
  },

  nextButton: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 28,
    height: 28,
    opacity: { xs: 0, sm: 1 },

    '&:hover': {
      backgroundColor: palette.bg?.main ?? 'rgba(0,0,0,0.04)',
    },
  },
}));

export default useStyles;
