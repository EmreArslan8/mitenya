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
  },

  mainSlide: {
    position: 'relative',
    aspectRatio: '16/9',
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
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
  },
  mobileSlide: {
    position: 'relative',
    aspectRatio: '5/3',
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
    padding: { xs: 2.5, md: 5 },
    pointerEvents: 'none',
  },

  overlayInner: {
    maxWidth: { xs: '100%', md: 460 },
    color: '#000000',
  },

  title: {
    fontWeight: 500,
    fontSize: { xs: 20, sm: 24, md: 36 },
    lineHeight: { xs: 1.2, md: 1.04 },
    maxWidth: { xs: 180, sm: 320, md: 460 },
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },

  description: {
    fontSize: { xs: 12, sm: 6, md: 16 },
    opacity: 0.92,
    mb: 3,
    maxWidth: 360,
  },

  ctaRow: {
    pointerEvents: 'auto',
  },

  ctaButton: {
    textTransform: 'none',
    borderRadius: 999,
    px: 3,
    py: 1.2,
    fontWeight: 700,
    mt: { xs: 2, md: 3 },
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
    fontSize: { xs: 18, md: 34 },
  },

  sideDescription: {
    fontSize: { xs: 16, md: 32 },
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
