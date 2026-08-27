import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: { xs: '0.8', sm: '1.78', md: '2.67' },
    maxHeight: { md: 'min(70vh, 640px)' },
    width: '100%',
    height: 'auto',
    margin: 'auto',
    '& img': {
      objectFit: 'cover',
      objectPosition: 'center',
    },
  },
  video: { position: 'absolute', bottom: 0, width: '101%', left: -1, border: 'none' },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    p: { xs: 2.5, sm: 4, lg: 6 },
    pointerEvents: 'none',
  },
  overlayInner: {
    maxWidth: { xs: '100%', sm: 380, lg: 480 },
    gap: { xs: 1, sm: 1.5, lg: 2 },
    color: palette.text.main,
  },
  title: {
    fontWeight: 600,
    fontSize: { xs: 22, sm: 36, lg: 46 },
    lineHeight: 1.1,
    wordBreak: 'break-word',
  },
  description: {
    fontSize: { xs: 13, sm: 16, lg: 18 },
    opacity: 0.9,
    display: { xs: 'none', sm: 'block' },
  },
  ctaRow: {
    pointerEvents: 'auto',
    mt: { xs: 0.5, sm: 1 },
  },
  ctaButton: {
    alignSelf: 'flex-start',
  },
}));

export default useStyles;
