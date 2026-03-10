import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  section: {
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 2, sm: 3, md: 4 },
    maxWidth: '100%',
  },
  shell: {
    gap: { xs: 3, md: 4 },
    pl: 0,
    pr: 0,
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
    fontSize: { xs: 24, sm: 36 },
    lineHeight: { xs: '28px', sm: '40px' },
    fontWeight: 500,
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
    alignItems: 'start',
  },
  statCard: {
    position: 'relative',
    gap: 0.35,
    minHeight: { xs: 'auto', md: 92 },
    alignSelf: 'start',
    ml: 0,
    px: 0,
    width: '100%',
    '&:nth-of-type(n + 4)': {
      ml: { xs: 0, md: '18%' },
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
