import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  cardBody: { position: 'relative', px: 2, pt: 1.5, gap: 2.5, borderRadius: 1, overflow: 'hidden' },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: palette.text.medium,
    gap: 1,
  },
  totalDuePriceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: palette.text.medium,
    gap: 1,
  },
  discountInput: { mb: 0.5, background: palette.bg.main, borderRadius: 1 },
  discount: { color: palette.green.main },
  shipping: { color: palette.tertiary.main },
  discountMdOptions: { p: { component: 'span', sx: { fontSize: 13 } } },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    background: `${palette.bg.main}20`,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(1px)',
  },
}));

export default useStyles;
