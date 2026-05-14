import { SxProps } from '@mui/material';
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  sliderContainer: {
    width: '100%',
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'visible',
    pb: { xs: 0, sm: 2 },
  },

  pillDots: {
    pt: 1.5,
    pb: 0.5,
  } as SxProps,

  pillDot: (active: boolean): SxProps => ({
    appearance: 'none',
    WebkitAppearance: 'none',
    border: 0,
    padding: 0,
    cursor: 'pointer',
    background: active ? '#111111' : 'rgba(17,17,17,0.18)',
    borderRadius: '999px',
    width: active ? 20 : 6,
    height: 6,
    transition: 'width 240ms ease, background 240ms ease',
    '&:hover': {
      background: active ? '#111111' : 'rgba(17,17,17,0.35)',
    },
  }),
}));

export default useStyles;
