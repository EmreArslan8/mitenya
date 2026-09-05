import { withPalette } from '@/theme/ThemeRegistry';
import { Direction } from '@mui/material';
import { CSSProperties } from 'react';

const styles = withPalette((palette) => ({
  button: {
    color: palette.bg.contrastText,
  },
  buttonCompact: {
    width: 48,
    height: 48,
    minWidth: 48,
    p: 0,
    gap: 0,
    justifyContent: 'center',
    borderRadius: 0,
    '& svg': {
      width: 24,
      height: 24,
      strokeWidth: 1.5,
    },
  },
  container: (direction: Direction) => ({
    position: 'fixed',
    bottom: { xs: 8, sm: 16 },
    [direction === 'rtl' ? 'left' : 'right']: { xs: 8, sm: 16 },
    alignItems: 'end',
    gap: { xs: 1, sm: 2 },
    maxWidth: 'calc(100% - 16px)',
  }),
  popover: {
    '& .MuiPaper-root': { backgroundColor: 'transparent', p: 2, mt: -1 },
  },
  menu: {
    width: 336,
    maxWidth: '100vw',
    borderRadius: 0,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.10)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: palette.bg.main,
  },
  menuBody: {
    p: 2,
    gap: 2,
  },
  /* Sepet sayfasındaki başlıkla aynı dil: ad + yanında ürün adedi. */
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.2,
    color: palette.text.main,
  },
  menuCount: {
    fontSize: 13,
    fontWeight: 400,
    color: palette.text.mediumLight,
  },
  products: {
    gap: 1.75,
    maxHeight: 296,
    overflowY: 'auto',
  },
  product: {
    flexDirection: 'row',
    gap: 1.5,
    alignItems: 'flex-start',
  },
  productImageWrapper: {
    flexShrink: 0,
    width: 60,
    height: 84,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: palette.white.main,
  },
  productImage: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as CSSProperties,
  info: {
    flex: 1,
    minWidth: 0,
    gap: 0.75,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 13,
    lineHeight: '18px',
    color: palette.text.mediumLight,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    '& b': { color: palette.text.main, fontWeight: 600 },
  },
  /* "Kırmızı / M / 5 Adet" — varyant ve adet tek hapta. */
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    px: 1,
    py: 0.25,
    borderRadius: 99,
    border: '1px solid rgba(0, 0, 0, 0.12)',
  },
  variantChipText: {
    fontSize: 11,
    color: palette.text.mediumLight,
    whiteSpace: 'nowrap',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.main,
  },
  cta: {
    width: '100%',
  },

  /* --- Boş sepet durumu --- */
  empty: {
    alignItems: 'center',
    textAlign: 'center',
    gap: 1.5,
    py: 1.5,
  },
  emptyIconRing: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg.dark,
    color: palette.text.main,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: palette.text.main,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: '18px',
    color: palette.text.mediumLight,
  },
  itemsTotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemsTotal: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 'normal',
  },
}));

export default styles;
