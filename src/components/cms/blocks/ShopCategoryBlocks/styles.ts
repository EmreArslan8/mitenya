import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  section: {
    gap: { xs: 3, md: 4.5 },
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 4, md: 6 },
    overflow: 'hidden',
    backgroundColor: palette.gray[50] ?? palette.bg.light,
    borderTop: `1px solid ${palette.gray[100] ?? palette.gray[200]}`,
    borderBottom: `1px solid ${palette.gray[100] ?? palette.gray[200]}`,
  },
  sectionHead: {
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: { xs: 'flex-start', md: 'flex-end' },
    justifyContent: 'space-between',
    gap: { xs: 1.5, md: 4 },
  },
  headingGroup: { gap: 0.75 },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: palette.error.main,
  },
  title: {
    m: 0,
    fontSize: { xs: 30, sm: 36, md: 44 },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.035em',
    color: palette.text.main,
  },
  description: {
    maxWidth: 440,
    fontSize: { xs: 14, md: 15 },
    lineHeight: 1.55,
    color: palette.text.mediumLight,
  },
  grid: {
    display: { xs: 'flex', sm: 'grid' },
    gridTemplateColumns: {
      sm: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(3, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))',
    },
    gap: { xs: 1.5, md: 2 },
    overflowX: { xs: 'auto', sm: 'visible' },
    scrollSnapType: { xs: 'x mandatory', sm: 'none' },
    WebkitOverflowScrolling: 'touch',
    mx: { xs: -2, sm: 0 },
    px: { xs: 2, sm: 0 },
    pb: { xs: 1, sm: 0 },
    '&::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
  },
  gridItem: {
    minWidth: 0,
    height: '100%',
    flex: { xs: '0 0 min(82vw, 340px)', sm: 'initial' },
    scrollSnapAlign: 'start',
    '& > a:focus-visible': {
      outline: `2px solid ${palette.error.main}`,
      outlineOffset: 3,
    },
  },
}));

export default useStyles;
