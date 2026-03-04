import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  container: {
    width: '100%',
    maxWidth: defaultMaxWidth,
    mx: 'auto',
    px: { xs: 1, md: 2 },
    py: { xs: 2, md: 2.5 },
    flexDirection: 'row',
    flexWrap: { xs: 'nowrap', md: 'wrap' },
    overflowX: { xs: 'auto', md: 'visible' },
    WebkitOverflowScrolling: 'touch',
    scrollSnapType: { xs: 'x mandatory', md: 'none' },
    scrollbarWidth: 'none',
    MsOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    borderTop: `1px solid ${palette.gray[200] ?? '#E4E4E4'}`,
    backgroundColor: palette.bg.main,
  },
  item: {
    position: 'relative',
    width: { xs: '72%', md: '25%' },
    flex: { xs: '0 0 auto', md: '0 0 25%' },
    scrollSnapAlign: { xs: 'start', md: 'none' },
    minHeight: { xs: 84, md: 108 },
    px: { xs: 1, md: 1.25 },
    py: { xs: 0.75, md: 1 },
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: 1,
    color: palette.text.main,
    '&:not(:first-of-type)::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '1px',
      height: { xs: '52%', md: '58%' },
      backgroundColor: palette.gray[200] ?? '#E4E4E4',
    },
  },
  iconGold: {
    color: palette.error.main,
  },
  iconWine: {
    color: palette.primary.main,
  },
  label: {
    fontSize: 14,
    lineHeight: 1.35,
    fontWeight: 600,
    letterSpacing: { xs: '0.02em', md: '0.01em' },
    color: palette.text.main,
  },
}));

export default useStyles;
