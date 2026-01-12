import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  cardBody: { px: 2, py: 1.5, gap: 2.5 },
  clearIcon: { color: palette.error.main },
  products: { py: 2, gap: 2 },
  mobileCheckoutBar: {
    zIndex: 1298,
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
  expandIcon: (expanded: boolean) => ({
    rotate: expanded ? 0 : '180deg',
    transition: 'rotate 0.15s',
  }),
  disabled: { opacity: 0.4 },
  checkbox: { cursor: 'pointer', flexDirection: 'row', alignItems: 'center', width: 'fit-content' },
  terms: { color: palette.text.medium, fontSize: 13, fontWeight: 500, lineHeight: 'normal' },
  termsLink: { color: palette.primaryDark.main, textDecoration: 'none' },
}));

export default useStyles;
