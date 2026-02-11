import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

const useStyles = withPalette((palette) => ({
  card: (unavailable = false) => ({
    borderRadius: '6px',
    flexDirection: 'row',
    gap: 1.5,
    width: '100%',
    opacity: unavailable ? 0.7 : 1,
    filter: unavailable ? 'saturate(0.1)' : 'none',
  }),
  imageContainer: {
    flexShrink: 0,
    height: { xs: 90, sm: 80 },
    width: { xs: 60, sm: 54 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    borderColor: palette.tertiary.light,
    overflow: 'hidden',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 4,
    overflow: 'hidden',
  } as CSSProperties,
  details: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 1,
  },
  title: {
    lineHeight: 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    wordBreak: 'break-all',
  },
  variants: {
    lineHeight: 'normal',
    fontSize: 13,
    fontWeight: 600,
    color: palette.text.medium,
  },
  qtyPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'end',
  },
  price: {
    whiteSpace: 'nowrap',
    fontSize: '15px !important',
    color: palette.primary.main,
    fontWeight: 700,
    px: 1,
  },
  originalPrice: {
    whiteSpace: 'nowrap',
    color: palette.text.medium,
    fontSize: '15px !important',
    fontWeight: 400,
    textDecoration: 'line-through',
    lineHeight: '20px',
    px: 1,
  },
  discountBadge: {
    background: palette.accentRed.main,
    color: palette.primary.contrastText,
    p: 0.5,
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 'normal',
    borderRadius: 0.5,
  },
}));

export default useStyles;
