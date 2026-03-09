import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  wrapper: {
    gap: 0,
  },
  shell: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 0,
    minHeight: { xs: 300, sm: 360, md: 420 },
    backgroundColor: '#d9d5d4',
    boxShadow: '0 24px 80px rgba(34, 24, 21, 0.08)',
  },
  imageWrap: {
    position: 'absolute',
    inset: 0,
  },
  image: {
    objectFit: 'cover',
    objectPosition: { xs: '72% center', md: 'center center' },
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(115,132,28,0.34) 0%, rgba(161,179,58,0.18) 34%, rgba(255,255,255,0.02) 64%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: 'inherit',
    justifyContent: 'center',
    gap: 0,
    px: { xs: 3, sm: 4.5, md: 5.5 },
    pt: { xs: 3, sm: 3.5, md: 4 },
    pb: { xs: 5.5, sm: 6, md: 6.5 },
  },
  contentTop: {
    gap: { xs: 1.5, md: 2 },
    maxWidth: { xs: '100%', md: '58%' },
  },
  eyebrow: {
    fontSize: { xs: 12, sm: 13, md: 17 },
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.9)',
  },
  title: {
    fontSize: { xs: 28, sm: 40, md: 60 },
    lineHeight: { xs: 0.96, md: 1.05 },
    fontWeight: 700,
    letterSpacing: '-0.05em',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    whiteSpace: 'pre-line',
    maxWidth: { md: 560 },
  },
  description: {
    maxWidth: 720,
    fontSize: { xs: 15, sm: 18, md: 20 },
    lineHeight: { xs: 1.5, md: 1.45 },
    color: 'rgba(255,255,255,0.92)',
  },
  actions: {
    pt: 1,
  },
  button: {
    borderRadius: 999,
    minHeight: 44,
    px: 2.25,
    fontWeight: 700,
    backgroundColor: '#FFFFFF',
    color: palette.text.main,
    '&:hover': {
      backgroundColor: '#FFFFFF',
      opacity: 0.94,
    },
  },
  footnote: {
    position: 'absolute',
    left: { xs: 24, sm: 36, md: 24 },
    right: { xs: 24, sm: 'auto', md: 'auto' },
    bottom: { xs: 20, sm: 24, md: 12 },
    maxWidth: { xs: '100%', md: '62%' },
    fontSize: { xs: 11, sm: 12, md: 13 },
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.88)',
  },
  marquee: {
    overflow: 'hidden',
    background:
      'linear-gradient(90deg, #93a816 0%, #a6ba23 24%, #b5c93c 50%, #a4b921 76%, #8da212 100%)',
    borderRadius: 0,
    py: { xs: 0.6, md: 0.8 },
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
  },
  marqueeTrack: {
    display: 'flex',
    width: 'max-content',
    pl: { xs: 2.5, md: 3.5 },
    animation: 'product-detail-banner-marquee 22s linear infinite',
    '@keyframes product-detail-banner-marquee': {
      '0%': {
        transform: 'translateX(0)',
      },
      '100%': {
        transform: 'translateX(-50%)',
      },
    },
  },
  marqueeRow: {
    flexShrink: 0,
    alignItems: 'center',
    gap: { xs: 2.5, md: 4 },
    pr: { xs: 2.5, md: 4 },
  },
  marqueeText: {
    flexShrink: 0,
    color: '#FFFFFF',
    fontSize: { xs: 15, md: 22 },
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
}));

export default useStyles;
