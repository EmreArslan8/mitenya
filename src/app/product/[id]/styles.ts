import { withPalette } from '@/theme/ThemeRegistry';
import { keyframes } from '@mui/material';
import { CSSProperties } from 'react';

const shiftScroll = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-10vw);
  }
  100% {
    transform: translateX(0);
  }
`;

const useStyles = withPalette((palette) => ({
  productContainer: {
    alignSelf: { xs: 'center', sm: 'unset' },
    width: { xs: '100vw', sm: '100%' },
  },
  imageGridItem: { zIndex: 0, position: 'relative' },
  imageCard: { width: '100%', alignSelf: 'center', gap: 2 },
  imageContainer: {
    width: '100%',
    maxHeight: { xs: 468, sm: 440, md: 600 },
    border: `1px solid ${palette.text.light}`,
    borderRadius: 1,
    overflow: 'hidden',
  },
  image: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as CSSProperties,
  thumbnails: {
    direction: 'ltr',
    maxWidth: '100%',
    p: 0,
    border: 'none',
    '& .MuiTabs-indicator': { display: 'none' },
    '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.2 },
    '& .MuiTabs-flexContainer': { gap: 1 },
    zIndex: 0,
  },
  thumbnail: {
    width: 80,
    height: 104,
    minWidth: 80,
    minHeight: 104,
    flexGrow: 0,
    p: 0,
    border: `1px solid ${palette.text.light}`,
    borderRadius: 1,
    overflow: 'hidden',
    '&.Mui-selected': { border: `1px solid ${palette.text.medium}` },
  },
  thumbnailImage: { width: 80, height: 104, objectFit: 'cover' } as CSSProperties,
  details: { gap: 2, px: { xs: 2, sm: 0 }, pt: { xs: 2, sm: 0 }, background: palette.bg.main },
  productName: {
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    width: 'max-content',
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 'normal',
    gap: 0.5,
    color: palette.text.medium,
    borderBottom: `1px solid ${palette.text.medium}`,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 0.5 },
  currentPrice: {
    fontSize: '19px !important',
    fontWeight: 700,
    lineHeight: 1,
    color: palette.primary.main,
  },
  originalPrice: {
    fontSize: 15,
    fontWeight: 400,
    textDecoration: 'line-through',
    lineHeight: '20px',
  },
  variantOptions: { gap: 1, flexDirection: 'row', flexWrap: 'wrap' },
  variantOption: { background: palette.white.main },
  rating: { flexDirection: 'row', alignItems: 'center', gap: '2px', pt: '2px' },
  ratingCount: { color: palette.text.mediumLight, fontSize: 12, lineHeight: 1 },
  description: { color: palette.text.medium, mb: 1 },
  markdownOptions: {
    ul: { sx: { px: 2 } },
    li: { sx: { '&::first-letter': { textTransform: 'capitalize' } } },
  },
  attribute: {
    textTransform: 'capitalize',
    background: palette.bg.light,
    borderRadius: 1,
    p: 1.5,
    height: '100%',
  },
  review: {
    gap: 1,
    py: 1.5,
    px: 2,
    header: { flexDirection: 'row', alignItems: 'center', gap: 1, color: palette.text.medium },
  },
  breadcrumbs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    fontSize: 18,
    color: palette.text.main,
    mx: -1,
  },
  mobileImagesContainer: { position: 'relative', width: '100vw' },
  mobileImages: {
    position: 'relative',
    width: '100vw',
    flexDirection: 'row',
    overflowX: 'scroll',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    MsOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    animation: `${shiftScroll} 0.7s ease-in-out 1.5s`,
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: palette.bg.light,
  },
  mobileImage: { flexShrink: 0, width: '100vw', scrollSnapAlign: 'center' },
  discountBadge: {
    background: palette.primary.main,
    color: palette.primary.light,
    py: 0.5,
    px: 1,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 'normal',
    borderRadius: 0.5,
    mx: 0.5,
  },
  progressIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
}));

export default useStyles;
