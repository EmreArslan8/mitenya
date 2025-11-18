import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  modalCardBody: { width: { sm: 420 } },
  legacyLogin: {
    color: palette.text.mediumLight,
    fontSize: 14,
    fontWeight: 500,
    px: 0.5,
  },
}));

export default useStyles;
