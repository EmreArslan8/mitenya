import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  section: {
    mt: { xs: 4, md: 6 },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
    gap: { xs: 1.5, md: 2 },
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: { xs: '1 / 1', md: '0.96 / 1' },
    minHeight: { xs: 280, md: 320 },
    backgroundColor: '#F3F1ED',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
  },
  mediaWrap: {
    position: 'absolute',
    inset: 0,
    background: palette.gray[50],
  },
  image: {
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(12, 12, 12, 0.01) 0%, rgba(12, 12, 12, 0.08) 52%, rgba(12, 12, 12, 0.44) 100%)',
  },
  body: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: 0.2,
    px: '16px',
    py: '20px',
  },
  eyebrow: {
    fontSize: { xs: 9, md: 10.5 },
    fontWeight: 500,
    lineHeight: 1.15,
    letterSpacing: 0,
    textTransform: 'none',
    color: '#FFFFFF',
    mb: '10px',
  },
  title: {
    fontSize: { xs: 15, md: 18 },
    lineHeight: 1.08,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    textTransform: 'none',
  },
  description: {
    display: 'none',
  },
}));

export default useStyles;
