import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  cardBody: { px: 2, py: 1.5, gap: 2 },
  products: {
    border: '1px solid',
    borderColor: palette.tertiary.light,
    borderRadius: 1,
    py: 2,
    gap: 2,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
    gap: 1,
  },
  discountBanner: { my: 0.5, mx: -0.5, py: 0.5 },
  discountInput: { mb: 0.5, background: palette.bg.main },
  discount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
    gap: 1,
    color: palette.green.main,
  },
  mobileCheckoutBar: {
    position: 'fixed',
    bottom: 56,
    left: 0,
    width: '100%',
    background: palette.bg.main,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 1,
    px: 2,
    boxShadow: '0 0 5px #00000010',
  },
  clearModalBody: { gap: 2 },
  totalDiscount: {
    color: palette.success.main,
    fontSize: 12,
    fontWeight: 500,
    textAlign: 'end',
  },
  expandIcon: (expanded: boolean) => ({
    rotate: expanded ? 0 : '180deg',
    transition: 'rotate 0.15s',
  }),
  unavailableItemsTitle: {
    color: palette.tertiary.main,
    mt: 2,
  },
}));

export default useStyles;
