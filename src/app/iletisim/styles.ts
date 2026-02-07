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
  pageSubtitle: {
    fontSize: { xs: 14, sm: 15 },
    lineHeight: 1.85,
    color: palette.text.mediumLight,
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

  /* ── Info Row ── */
  infoRow: {
    gap: 0.5,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: palette.text.main,
  },
  infoValue: {
    fontSize: { xs: 14, sm: 15 },
    color: palette.text.mediumLight,
    lineHeight: 1.6,
  },

  /* ── Address Card ── */
  addressCard: {
    p: { xs: 2, sm: 2.5 },
    borderRadius: 2,
    bgcolor: palette.bg.dark,
    border: `1px solid ${palette.gray[100]}`,
    gap: 1,
  },
  addressTitle: {
    fontWeight: 700,
    fontSize: { xs: 15, sm: 16 },
    color: palette.text.main,
  },
  addressText: {
    fontSize: { xs: 14, sm: 15 },
    lineHeight: 1.7,
    color: palette.text.mediumLight,
  },
  addressNote: {
    fontSize: 13,
    color: palette.text.light,
    fontStyle: 'italic',
  },

  /* ── Hours ── */
  hoursRow: {
    fontSize: { xs: 14, sm: 15 },
    lineHeight: 1.7,
    color: palette.text.mediumLight,
  },

  /* ── Divider ── */
  divider: {
    borderColor: palette.gray[100],
  },
}));

export default useStyles;
