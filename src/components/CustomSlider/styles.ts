import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'visible',
  },

  arrowIcon: {
    display: 'block',
    position: 'relative',
    width: { xs: 16, sm: 18 },
    height: { xs: 16, sm: 18 },
    flexShrink: 0,
  },

  editorialArrowIcon: {
    display: 'block',
    width: { sm: 32, md: 38 },
    height: { sm: 32, md: 38 },
    lineHeight: 0,
    flexShrink: 0,
  },

  prevButton: (variant: 'default' | 'editorial') => ({
    position: 'absolute',
    top: '50%',
    left: variant === 'editorial' ? { sm: -52, md: -68 } : -12,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: variant === 'editorial' ? { sm: 52, md: 68 } : 36,
    height: variant === 'editorial' ? 88 : 36,
    borderRadius: variant === 'editorial' ? 0 : 999,
    border: 'none',
    backgroundColor: variant === 'editorial' ? 'transparent' : palette.accentRed.main,
    boxShadow: variant === 'editorial' ? 'none' : '0 5px 12px rgba(17,17,17,0.08)',
    color: variant === 'editorial' ? palette.gray[800] : palette.accentRed.contrastText,
    display: { xs: 'none', sm: 'flex' },

    '&:hover': {
      backgroundColor: variant === 'editorial' ? 'transparent' : palette.accentRed.dark,
      boxShadow: variant === 'editorial' ? 'none' : '0 6px 14px rgba(17,17,17,0.12)',
      border: 'none',
      color: variant === 'editorial' ? palette.gray[900] : palette.accentRed.contrastText,
    },
  }),

  nextButton: (variant: 'default' | 'editorial') => ({
    position: 'absolute',
    top: '50%',
    right: variant === 'editorial' ? { sm: -52, md: -68 } : -12,
    transform: 'translateY(-50%)',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: variant === 'editorial' ? { sm: 52, md: 68 } : 36,
    height: variant === 'editorial' ? 88 : 36,
    borderRadius: variant === 'editorial' ? 0 : 999,
    border: 'none',
    backgroundColor: variant === 'editorial' ? 'transparent' : palette.accentRed.main,
    boxShadow: variant === 'editorial' ? 'none' : '0 5px 12px rgba(17,17,17,0.08)',
    color: variant === 'editorial' ? palette.gray[800] : palette.accentRed.contrastText,
    display: { xs: 'none', sm: 'flex' },

    '&:hover': {
      backgroundColor: variant === 'editorial' ? 'transparent' : palette.accentRed.dark,
      boxShadow: variant === 'editorial' ? 'none' : '0 6px 14px rgba(17,17,17,0.12)',
      border: 'none',
      color: variant === 'editorial' ? palette.gray[900] : palette.accentRed.contrastText,
    },
  }),
}));

export default useStyles;
