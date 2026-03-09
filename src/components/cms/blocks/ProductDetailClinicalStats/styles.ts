import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  section: {
    mt: { xs: 4, md: 6 },
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 2, sm: 3, md: 4 },
    maxWidth: '100%',
  },
  shell: {
    gap: { xs: 3, md: 4 },
    pl: 0,
    pr: { xs: 1, sm: 2, md: 5 },
    py: { xs: 3, md: 4.5 },
  },
  content: {
    gap: { xs: 1, md: 1.25 },
    justifyContent: 'center',
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 1.3,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#6F675F',
  },
  title: {
    fontSize: { xs: 30, sm: 38, md: 52 },
    lineHeight: { xs: 1.02, md: 0.98 },
    fontWeight: 700,
    letterSpacing: '-0.05em',
    textTransform: 'uppercase',
    color: palette.text.main,
  },
  description: {
    fontSize: { xs: 14, md: 16 },
    lineHeight: 1.62,
    color: '#6F6963',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
    columnGap: { xs: 2.5, md: 4 },
    rowGap: { xs: 2, md: 3 },
    pt: { xs: 1, md: 1.5 },
  },
  statCard: {
    position: 'relative',
    gap: 0.35,
    minHeight: { xs: 'auto', md: 92 },
    alignSelf: 'start',
    px: { xs: 0.25, md: 0 },
    '&:nth-of-type(4)': {
      ml: { xs: 0, md: '12%' },
    },
    '&:nth-of-type(5)': {
      ml: { xs: 0, md: '24%' },
    },
  },
  statValue: {
    width: 'fit-content',
    fontSize: { xs: 23, md: 27 },
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: '-0.04em',
    color: palette.text.main,
    borderBottom: '1.5px solid rgba(25, 25, 25, 0.68)',
    pb: 0.2,
  },
  statLabel: {
    maxWidth: 240,
    fontSize: { xs: 13, md: 14 },
    lineHeight: 1.5,
    color: '#6F6963',
  },
}));

export default useStyles;
