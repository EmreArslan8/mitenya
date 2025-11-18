import { ibmPlexMono } from '@/theme/theme';
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  body: { width: { sm: 'min-content' }, gap: 4, minWidth: { sm: 402 } },
  total: { textAlign: 'center', alignItems: 'center', px: 2, pb: 1 },
  totalAmount: { fontSize: 24, fontWeight: 600, lineHeight: 1 },
  buttons: { flexDirection: { sm: 'row' }, mt: 1, width: '100%', gap: 1 },
  button: { flex: 1 },
  cardDetailsInputs: { flexDirection: { sm: 'row' }, rowGap: 2, columnGap: 1 },
  expiration: { maxWidth: { xs: '100%', sm: 'unset' } },
  numberInput: { fontFamily: `${ibmPlexMono.style.fontFamily} !important`, fontWeight: 500 },
  provider: {
    transform: 'scale(0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: palette.text.medium,
    gap: 1,
  },
}));

export default useStyles;
