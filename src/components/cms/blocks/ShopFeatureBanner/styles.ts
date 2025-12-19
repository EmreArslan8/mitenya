import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  /* DESKTOP */
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

  /* MOBILE */
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
}));

export default useStyles;
