import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  rating: { flexDirection: 'row', alignItems: 'center', gap: '2px', pt: '2px' },
  review: {
    gap: 1,
    py: 1.5,
    px: 2,
    header: { flexDirection: 'row', alignItems: 'center', gap: 1, color: palette.text.medium },
  },
}));

export default useStyles;
