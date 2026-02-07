import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  container: {
    width: '100vw',
    mt: 10,
    px: { xs: 2, sm: 3 },
    pb: { xs: 16, sm: 8 },
    pt: { xs: 4, sm: 5 },
    backgroundColor: palette.primaryDark.dark,
    color: palette.white.main,
  },
  innerContainer: { width: '100%', maxWidth: defaultMaxWidth, alignSelf: 'center', gap: 2 },
  logo: { ...palette.logoWhite, cursor: 'pointer' },
  logoPanel: { gap: 1.5, p: 0, justifyContent: 'flex-start' },
  etbisPanel: {
    p: 0,
    pt: { md: 0.5 },
    justifyContent: 'flex-start',
    alignItems: { xs: 'flex-start', md: 'flex-end' },
  },
  etbisCard: {
    width: 'fit-content',
    p: 1,
    borderRadius: 1.5,
    backgroundColor: palette.white.main,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.75,
  },
  etbisQrPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 1,
    border: `1px dashed ${palette.gray[300]}`,
    backgroundColor: palette.gray[50],
  },
  etbisText: {
    color: palette.gray[800],
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.25,
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
  socials: { flexDirection: 'row', gap: 1.25 },
  groupTitle: {
    color: palette.white.main,
    letterSpacing: 0.3,
    fontSize: { xs: 17, sm: 19 },
    lineHeight: { xs: '22px', sm: '24px' },
  },
  bottomBar: {
    width: '100%',
    mt: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    color: palette.gray[300],
  },
  item: {
    display: 'flex',
    width: 'fit-content',
    fontSize: { xs: 14, sm: 15 },
    fontWeight: 500,
    lineHeight: { xs: '20px', sm: '21px' },
    color: palette.gray[200],
    textDecoration: 'none',
  },
  markdownOptions: {
    p: {
      sx: {
        fontWeight: 400,
        fontSize: { xs: 13, sm: 14 },
        lineHeight: { xs: 1.65, sm: 1.7 },
        color: palette.gray[300],
      },
    },
  },
  vendors: { flexDirection: 'row', gap: 1.5, justifyContent: 'center', pt: 2, flexWrap: 'wrap' },
}));

export default useStyles;
