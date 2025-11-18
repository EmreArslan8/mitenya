import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  attribute: {
    textTransform: 'capitalize',
    background: palette.bg.light,
    color: palette.text.main,
    borderRadius: 1,
    p: 1.5,
    height: '100%',
  },
}));

export default useStyles;
