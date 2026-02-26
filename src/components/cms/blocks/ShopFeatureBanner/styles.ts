import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    gap: 2,
    width: '100%',
    alignItems: 'stretch',
    
  },

  mainSliderWrapper: {
    flex: '0 0 65%',
    maxWidth: '65%',
    '& .slick-slider': { maxWidth: '100vw' },
    '& .slick-slide': { lineHeight: 0 },
    '& .slick-slide > div': { display: 'block' },
    '& .slick-dots': {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      display: 'flex !important',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      margin: 0,
      padding: 0,
      listStyle: 'none',
      zIndex: 2,

      '& li': {
        margin: 0,
        padding: 0,
        width: 12,
        height: 12,
        transition: 'width 0.25s ease',
      },

      '& li button': {
        width: '100%',
        height: '100%',
        padding: 0,
        border: 'none',
        borderRadius: 999,
        backgroundColor: palette.white.main,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        fontSize: 0,
        lineHeight: 0,
        color: 'transparent',
        '&:before': {
          display: 'none',
        },
      },

      '& li.slick-active': {
        width: 36,
      },
      '& li.slick-active button': {
        backgroundColor: palette.error.main,
        transform: 'none',
      },
    },
  },

  mainSlide: {
    position: 'relative',
    aspectRatio: '16/9',
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    display: 'block',
    '& img': { objectFit: 'cover' },
  },

  sideBannersContainer: {
    flex: '0 0 calc(35% - 16px)',
    maxWidth: 'calc(35% - 16px)',
    gap: 2,
    display: 'flex',
    flexDirection: 'column',
  },

  sideBanner: {
    position: 'relative',
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
    '& img': { objectFit: 'cover' },
  },

  mobileSliderContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 1.5,
    '& .slick-slide': { lineHeight: 0 },
    '& .slick-slide > div': { display: 'block' },
    '& .slick-dots': {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      display: 'flex !important',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      margin: 0,
      padding: 0,
      listStyle: 'none',
      zIndex: 2,

      '& li': {
        margin: 0,
        padding: 0,
        width: 10,
        height: 10,
        transition: 'width 0.25s ease',
      },

      '& li button': {
        width: '100%',
        height: '100%',
        padding: 0,
        border: 'none',
        borderRadius: 999,
        backgroundColor: palette.white.main,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        fontSize: 0,
        lineHeight: 0,
        color: 'transparent',
        '&:before': {
          display: 'none',
        },
      },

      '& li.slick-active': {
        width: 30,
      },
      '& li.slick-active button': {
        backgroundColor: palette.white.main,
        transform: 'none',
      },
    },
  },

  mobileSlide: {
    position: 'relative',
    aspectRatio: { xs: '4/5', sm: '16/9' },
    width: '100%',
    borderRadius: 1.5,
    overflow: 'hidden',
    '& img': { objectFit: 'cover' },
  },

  mediaWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: { xs: 2.5, sm: 4, md: 4, lg: 5 },
    pointerEvents: 'none',
  },

  overlayInner: {
    maxWidth: { xs: '100%', sm: 360, md: 360, lg: 460 },
    color: '#000000',
  },

  title: {
    fontWeight: 500,
    fontSize: { xs: 18, sm: 42, md: 36, lg: 42 },
    lineHeight: { xs: 1.2, sm: 1.15, md: 1.1, lg: 1.04 },
    maxWidth: { xs: 160, sm: 360, md: 280, lg: 400 },
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },

  description: {
    fontSize: { xs: 11, sm: 18, md: 16, lg: 18 },
    opacity: 0.92,
    mb: { xs: 1.5, sm: 2, md: 2, lg: 3 },
    maxWidth: { xs: 200, sm: 300, md: 280, lg: 360 },
  },

  ctaRow: {
    pointerEvents: 'auto',
  },

  ctaButton: {
    textTransform: 'none',
    borderRadius: 999,
    px: { xs: 2, sm: 4, md: 2.5, lg: 4 },
    py: { xs: 0.8, sm: 3, md: 1, lg: 2 },
    fontWeight: 700,
    fontSize: { xs: 12, sm: 18, md: 13, lg: 18 },
    mt: { xs: 1.5, sm: 2.5, md: 2, lg: 2 },
    boxShadow: 'none',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#111111',
      boxShadow: 'none',
    },
  },

  sideOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: 3,
    pointerEvents: 'none',
    background:
      'linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0) 70%)',
  },

  sideOverlayInner: {
    maxWidth: 280,
    color: '#000000',
  },

  sideTitle: {
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontSize: { xs: 18, md: 30, lg: 36 },
  },

  sideDescription: {
    fontSize: { xs: 16, md: 28, lg: 32 },
    opacity: 0.85,
    mb: 1.25,
    maxWidth: 260,
  },

  sideCtaRow: {
    pointerEvents: 'auto',
  },

  sideCtaButton: {
    textTransform: 'none',
    p: 0,
    minWidth: 0,
    fontWeight: 500,
    textDecoration: 'underline',
    color: '#000000',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
  },
}));

export default useStyles;
