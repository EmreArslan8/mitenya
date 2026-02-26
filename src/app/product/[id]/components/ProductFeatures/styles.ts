import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    py: 0.25,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.2,
    color: palette.text.main,
  },
  label: {
    fontSize: { xs: 18, sm: 16 },
    lineHeight: 1.25,
    fontWeight: 500,
    color: palette.text.main,
  },
}));

export default useStyles;
