import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    width: '100%',
    maxWidth: 800,
    ml: { xs: 2, sm: 4 },
    py: { xs: 2, sm: 3 },
    gap: { xs: 2.5, sm: 3 },
  },

  /* ── Page Title ── */
  pageTitle: {
    fontWeight: 800,
    fontSize: { xs: 28, sm: 34 },
    color: palette.text.main,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },

  /* ── Section ── */
  section: {
    gap: 1.5,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: 18, sm: 20 },
    color: palette.text.main,
    lineHeight: 1.3,
  },
  sectionBody: {
    fontSize: { xs: 14, sm: 15 },
    lineHeight: 1.85,
    color: palette.text.mediumLight,
  },

  /* ── Bullet List ── */
  bulletList: {
    gap: 0.75,
    pl: 0.5,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 1.5,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    bgcolor: palette.accentRed.main,
    mt: '8px',
    flexShrink: 0,
  },

  /* ── Divider ── */
  divider: {
    borderColor: palette.gray[100],
  },

  /* ── Closing ── */
  closing: {
    fontSize: { xs: 14, sm: 15 },
    fontWeight: 600,
    color: palette.text.medium,
    fontStyle: 'italic',
    fontFamily: 'var(--font-albert-sans-italic)',
  },
}));

export default useStyles;
