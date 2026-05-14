import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'visible',
  },

  prevButton: {
    position: 'absolute',
    top: '50%',
    left: -12,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 36,
    height: 36,
    borderRadius: 999,
    border: 'none',
    backgroundColor: palette.accentRed.main,
    boxShadow: '0 5px 12px rgba(17,17,17,0.08)',
    color: palette.accentRed.contrastText,
    opacity: { xs: 0, sm: 1 },

    '&:hover': {
      backgroundColor: palette.accentRed.dark,
      boxShadow: '0 6px 14px rgba(17,17,17,0.12)',
      border: 'none',
    },
  },

  nextButton: {
    position: 'absolute',
    top: '50%',
    right: -12,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 36,
    height: 36,
    borderRadius: 999,
    border: 'none',
    backgroundColor: palette.accentRed.main,
    boxShadow: '0 5px 12px rgba(17,17,17,0.08)',
    color: palette.accentRed.contrastText,
    opacity: { xs: 0, sm: 1 },

    '&:hover': {
      backgroundColor: palette.accentRed.dark,
      boxShadow: '0 6px 14px rgba(17,17,17,0.12)',
      border: 'none',
    },
  },
}));

export default useStyles;
