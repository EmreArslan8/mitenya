import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  variantOptions: { gap: 1, flexDirection: 'row', flexWrap: 'wrap' },
  variantOption: { background: palette.white.main },
}));

export default useStyles;
