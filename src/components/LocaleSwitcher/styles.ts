import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    color: palette.bg.contrastText,
    p: 0,
    m: 0,
  },
  divider: {
    mt: '6px !important',
    mb: '5px !important',
    borderColor: palette.bg.contrastText,
  },
}));

export default useStyles;
