import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

const useStyles = withPalette((palette) => ({
  wrapper: {
    borderRadius: '12px',
    border: `1px solid ${palette.gray[100]}`,
    bgcolor: palette.white.main,
    overflow: 'hidden',
  },
  header: {
    px: { xs: 2.5, sm: 3 },
    py: 1.5,
    borderBottom: `1px solid ${palette.gray[100]}`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0,
    color: palette.text.medium,
  },
  headerCount: {
    fontSize: 13,
    fontWeight: 700,
    color: palette.text.mediumLight,
  },
  cardBody: {
    gap: 0,
    p: 0,
  },
  productRow: {
    flexDirection: 'row',
    gap: { xs: 2, sm: 2.5 },
    px: { xs: 2.5, sm: 3 },
    py: 2.5,
    width: '100%',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      bgcolor: palette.bg.light,
    },
  },
  divider: {
    mx: 2.5,
    borderColor: palette.gray[100],
  },
  imageContainer: {
    flexShrink: 0,
    height: 80,
    width: 80,
    borderRadius: '10px',
    border: `1px solid ${palette.gray[100]}`,
    overflow: 'hidden',
    bgcolor: palette.bg.light,
  },
  image: {
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  } as CSSProperties,
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 0.5,
    minWidth: 0,
  },
  productName: {
    fontSize: 15,
    fontWeight: 600,
    color: palette.text.main,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  variantText: {
    fontSize: 12,
    fontWeight: 500,
    color: palette.text.mediumLight,
    lineHeight: 1.3,
  },
  priceSection: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 0.25,
  },
  price: {
    fontSize: 16,
    fontWeight: 700,
    color: palette.text.main,
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  quantity: {
    fontSize: 11,
    fontWeight: 600,
    color: palette.text.light,
    whiteSpace: 'nowrap',
  },
}));

export default useStyles;
