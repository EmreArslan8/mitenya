import { withPalette } from '@/theme/ThemeRegistry';
import { Direction } from '@mui/material';
import { CSSProperties } from 'react';

const styles = withPalette((palette) => ({
  button: {
    color: palette.bg.contrastText,
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
    maxWidth: 400,
    borderRadius: 3,
    boxShadow: '0px 0px 8px rgba(10, 26, 59, 0.05)',
    border: '1px solid',
    borderColor: palette.bg.dark,
    background: palette.bg.main,
  },
  menuBody: {
    p: '12px 8px 8px',
    gap: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    px: 1,
  },
  products: {
    px: 1,
  },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    py: 1,
    gap: 1,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    objectFit: 'cover',
    flexShrink: 0,
  } as CSSProperties,
  info: {
    width: 150,
  },
  productName: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 'normal',
    ['@media (max-width: 400px)']: { wordBreak: 'break-all' },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  productQuantitySelector: {
    background: 'transparent',
  },
  productPrice: {
    whiteSpace: 'nowrap',
    minWidth: 90,
    textAlign: 'end',
    fontSize: 14,
    fontWeight: 600,
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
