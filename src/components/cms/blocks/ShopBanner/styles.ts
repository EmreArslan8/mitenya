import { SxProps } from '@mui/material';
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  sliderContainer: {
    width: { xs: '100vw', sm: '100%' },
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    pb: 3,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -28,
    left: 0,
    right: 0,
    zIndex: 2,
    gap: '8px',
  } as SxProps,

  dot: (active: boolean): SxProps => ({
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 'none',
    background: 'none',
    padding: 0,
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      display: 'block',
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: active ? palette.text.main : palette.text.light,
      transform: active ? 'scale(1.25)' : 'scale(1)',
      transition: 'all .2s ease',
    },
  }),

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
  } as SxProps,

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
  } as SxProps,
}));

export default useStyles;
