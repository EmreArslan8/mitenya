import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  container: {
    flexDirection: 'row',
    width: '100%',
    gap: 3,
  },
  navigation: {
    height: 'fit-content',
    width: 200,
    p: 1.5,
    gap: 1,
  },
  menuItem: {
    '&.Mui-selected': {
      background: palette.bg.light,
    },
  },
  logoutButton: {
    color: palette.error.main,
  },
}));

export default useStyles;
