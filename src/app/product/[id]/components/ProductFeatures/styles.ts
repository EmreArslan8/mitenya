import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  item: {
    height: '100%',
    alignItems: 'center',
    textAlign: 'center',
    background: palette.bg.light,
    borderRadius: 1,
    p: 2,
    gap: 0.5,
  },
  telegram: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    textAlign: 'center',
    background: palette.bg.light,
    borderRadius: 1,
    p: 2,
    gap: 0.5,
  },
}));

export default useStyles;
