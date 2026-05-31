import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  rating: { flexDirection: 'row', alignItems: 'center', gap: '2px', pt: '2px' },
  review: {
    gap: 1,
    py: 1.5,
    px: 2,
    header: { flexDirection: 'row', alignItems: 'center', gap: 1, color: palette.text.medium },
  },
  emptyState: {
    py: { xs: 4, sm: 5 },
    px: { xs: 2, sm: 3 },
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1.8,
    textAlign: 'center',
  },
  emptyStateTitle: {
    color: palette.text.medium,
    fontSize: { xs: 20, sm: 24 },
    lineHeight: { xs: '26px', sm: '30px' },
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  emptyStateButton: {
    borderRadius: 1,
    px: { xs: 2.5, sm: 3.5 },
    py: { xs: 1, sm: 2.5 },
    fontSize: { xs: 16, sm: 18 },
    fontWeight: 700,
  },
}));

export default useStyles;
