import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    flexDirection: { xs: 'column', sm: 'row' },
    width: '100%',
    gap: { xs: 2, sm: 3, md: 4 },
  },
  navigation: {
    height: 'fit-content',
    width: 220,
    flexShrink: 0,
    p: 1,
    gap: 0.5,
    borderRadius: '14px',
    border: `1px solid ${palette.gray[100]}`,
    position: 'sticky' as const,
    top: 140,
  },
  menuItem: {
    borderRadius: '10px',
    fontSize: 14,
    fontWeight: 500,
    color: palette.text.mediumLight,
    py: 1,
    px: 1.5,
    gap: 1.5,
    transition: 'all 0.15s ease',
    '&:hover': {
      bgcolor: palette.bg.dark,
      color: palette.text.main,
    },
    '&.Mui-selected': {
      bgcolor: palette.bg.dark,
      color: palette.text.main,
      fontWeight: 600,
      '&:hover': {
        bgcolor: palette.bg.dark,
      },
    },
  },
  menuItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '8px',
    flexShrink: 0,
  },
  divider: {
    my: 0.5,
    mx: 1,
    borderColor: palette.gray[100],
  },
  /* Unauthenticated state */
  authContainer: {
    textAlign: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    py: { xs: 6, sm: 10 },
    gap: 3,
  },
  authIconBox: {
    width: 88,
    height: 88,
    borderRadius: '22px',
    background: `linear-gradient(135deg, ${palette.bg.dark} 0%, ${palette.gray[100]} 100%)`,
    display: 'grid',
    placeItems: 'center',
  },
  authTitle: {
    fontSize: { xs: 20, sm: 24 },
    fontWeight: 800,
    letterSpacing: -0.3,
    color: palette.text.main,
  },
  authDescription: {
    fontSize: 15,
    fontWeight: 500,
    color: palette.text.mediumLight,
    maxWidth: 400,
    lineHeight: 1.6,
  },
  authActions: {
    direction: 'row',
    gap: 1,
    width: '100%',
    maxWidth: 380,
  },
}));

export default useStyles;
