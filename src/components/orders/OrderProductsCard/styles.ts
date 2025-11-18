import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

const useStyles = withPalette((palette) => ({
  cardBody: {
    gap: 2,
    p: 2,
  },
  productCard: {
    borderRadius: '6px',
    flexDirection: 'row',
    gap: { xs: 1, sm: 1.5 },
    width: '100%',
  },
  imageContainer: {
    flexShrink: 0,
    height: 80,
    width: 80,
    borderRadius: '6px',
    border: '1px solid',
    borderColor: palette.tertiary.light,
    overflow: 'hidden',
  },
  image: {
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
    alignItems: 'center',
  },
}));

export default useStyles;
