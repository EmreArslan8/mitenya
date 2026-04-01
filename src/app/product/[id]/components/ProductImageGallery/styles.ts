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
  imageCard: {
    display: { xs: 'none', sm: 'flex' },
    width: '100%',
    alignSelf: 'center',
    gap: 0,
    position: 'relative',
    p: { xs: 0, sm: 0 },
    borderRadius: 0,
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
  },
  mobileWrapper: {
    display: { xs: 'flex', sm: 'none' },
  },
  imageSplitGrid: {
    width: '100%',
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: { sm: 1.25, md: 1.5 },
  },
  thumbnailColumn: {
    width: { sm: 82, md: 96 },
    minWidth: { sm: 82, md: 96 },
    maxHeight: { sm: 560, md: 760 },
    overflowY: 'auto',
    gap: 1,
    pr: 0.25,
    scrollbarWidth: 'thin',
  },
  magnifierWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: { sm: 560, md: 760 },
    border: '1px solid #E7E1DC',
    borderRadius: 0,
    overflow: 'hidden',
    background: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: 0,
    overflow: 'hidden',
  },
  image: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as CSSProperties,
  thumbnail: {
    width: '100%',
    minWidth: '100%',
    aspectRatio: '4 / 5',
    flexGrow: 0,
    flexShrink: 0,
    background: '#FFFFFF',
    p: 0,
    border: '1px solid #D8D0CA',
    borderRadius: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
    '&:hover': { borderColor: '#8A746A', transform: 'translateY(-1px)' },
  },
  thumbnailSelected: {
    border: '1px solid #111111',
    boxShadow: 'inset 0 0 0 1px #111111',
  },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } as CSSProperties,
  galleryTopBar: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  galleryCounter: {
    px: 1.25,
    py: 0.7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(17,17,17,0.08)',
    boxShadow: '0 10px 24px rgba(17, 24, 39, 0.08)',
    pointerEvents: 'auto',
  },
  galleryCounterText: {
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '0.04em',
    color: '#111111',
  },
  gallerySideActions: {
    flexDirection: 'row',
    gap: 0.5,
    pointerEvents: 'auto',
  },
  galleryActionButton: {
    width: 36,
    height: 36,
    borderRadius: 0.8,
    color: '#111111',
    bgcolor: 'transparent',
  },
  galleryBottomBar: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.4,
  },
  galleryNavButton: {
    width: 48,
    height: 48,
    border: '1px solid #D8D8D8',
    borderRadius: 1.5,
    color: '#111111',
    background: '#F7F7F7',
    '&:hover': {
      background: '#EEEEEE',
      borderColor: '#C7C7C7',
    },
  },
  mobileImagesContainer: { position: 'relative', width: '100%' },
  mobileImages: {
    position: 'relative',
    width: '100%',
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
  mobileImage: {
    position: 'relative',
    flexShrink: 0,
    width: '100%',
    aspectRatio: '1 / 1',
    scrollSnapAlign: 'center',
    background: '#FFFFFF',
  },
  mobileActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    flexDirection: 'column',
    gap: 0.5,
  },
  mobileActionButton: {
    width: 44,
    height: 44,
    color: '#111111',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18))',
  },
  progressIndicatorContainer: {
    alignItems: 'center',
    mt: 0,
  },
}));

export default useStyles;
