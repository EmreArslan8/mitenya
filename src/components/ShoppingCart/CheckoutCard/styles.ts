import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  cardBody: { position: 'relative', px: 0, pt: 0, gap: 0, borderRadius: 0, overflow: 'hidden' },
  summaryBlock: { px: 2, py: 2, gap: '12px' },
  /* Ayraçlar bölümleri ayırsın ama okumayı bölmesin — MUI varsayılanından daha soluk. */
  divider: { my: '4px', borderColor: 'rgba(0, 0, 0, 0.06)' },
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
    color: palette.text.main,
    gap: 1,
  },
  /* Tipografi ölçeği referans karttan: satırlar 14/20, toplam 24/34. */
  priceLabel: { fontSize: 14, fontWeight: 400, lineHeight: '20px', color: palette.text.main },
  priceValue: { fontSize: 14, fontWeight: 600, lineHeight: '20px', color: palette.text.main },
  discountLabel: { fontSize: 14, fontWeight: 400, lineHeight: '20px', color: palette.text.main },
  discountValue: { fontSize: 14, fontWeight: 600, lineHeight: '20px', color: palette.success.main },
  freeShippingValue: { fontSize: 14, fontWeight: 600, lineHeight: '20px', color: palette.success.main },
  earningsLabel: { flexDirection: 'row', alignItems: 'center', gap: '4px' },
  earningsChevron: (open = false) => ({
    display: 'inline-flex',
    color: palette.text.mediumLight,
    rotate: open ? '180deg' : '0deg',
    transition: 'rotate 0.15s',
  }),
  breakdown: { gap: '8px', pt: '8px', pl: '12px' },
  breakdownLabel: { fontSize: 13, fontWeight: 400, color: palette.text.mediumLight },
  breakdownValue: { fontSize: 13, fontWeight: 500, color: palette.success.main },
  totalLabel: { fontSize: 16, fontWeight: 400, lineHeight: '34px', color: palette.text.main },
  totalValue: { fontSize: 24, fontWeight: 600, lineHeight: '34px', color: palette.text.main },
  checkoutAction: { px: 2, pb: 2, gap: 2 },
  discountInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: palette.bg.dark,
      height: 'auto',
      minHeight: 48,
    },
    /* Kupon alanı kenarlıksız — zemin farkı tek başına yeterli ayrım. */
    '& .MuiOutlinedInput-notchedOutline': { border: 0 },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { border: 0 },
    '& .MuiInputBase-input': { padding: '13px 12px', fontSize: 15 },
    '& input::placeholder': { color: '#9B9BA1', opacity: 1 },
  },
  appliedDiscountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
  },
  appliedDiscountText: {
    color: palette.success.main,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '18px',
  },
  removeDiscountButton: {
    minWidth: 'auto',
    p: 0,
    color: palette.text.medium,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'underline',
    '&:hover': { background: 'transparent', color: palette.text.main, textDecoration: 'underline' },
  },
  discount: { color: palette.green.main },
  shipping: { color: palette.tertiary.main },
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
