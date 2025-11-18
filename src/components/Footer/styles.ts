import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  container: { width: '100vw', mt: 10, px: { xs: 2, sm: 3 }, pb: { xs: 16, sm: 8 } },
  innerContainer: { width: '100%', maxWidth: defaultMaxWidth, alignSelf: 'center', gap: 2 },
  logo: { ...palette.logo, cursor: 'pointer' },
  socials: { flexDirection: 'row', gap: 1 },
  bottomBar: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    color: palette.text.medium,
  },
  item: {
    display: 'flex',
    width: 'fit-content',
    fontSize: '13px',
    fontWeight: 500,
    color: palette.text.medium,
    textDecoration: 'none',
  },
  markdownOptions: {
    p: {
      sx: {
        fontWeight: 400,
        fontSize: 12,
        lineHeight: 1.66,
      },
    },
  },
  vendors: { flexDirection: 'row', gap: 1, justifyContent: 'center', pt: 4, flexWrap: 'wrap' },
}));

export default useStyles;
