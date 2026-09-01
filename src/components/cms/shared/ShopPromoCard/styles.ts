import { CSSProperties } from 'react';

const styles = {
  link: { textDecoration: 'none', display: 'block', height: '100%' } as CSSProperties,
  card: {
    position: 'relative',
    width: '100%',
    height: '100%',
    // Iki kart yan yana ~650px genislige oturuyor; oran hero'dan (2.67) daha
    // dik olursa kartlar hero'dan uzun cikip hiyerarsiyi ters ceviriyordu.
    // 1.6 ile yukseklik ~406px: hero'nun belirgin sekilde altinda kaliyor.
    aspectRatio: { xs: '1.45', sm: '1.7', md: '1.6' },
    maxHeight: { md: 440 },
    overflow: 'hidden',
    '& img': { transition: 'transform .5s ease' },
    '&:hover img': { transform: 'scale(1.03)' },
    '@media (prefers-reduced-motion: reduce)': {
      '& img': { transition: 'none' },
      '&:hover img': { transform: 'none' },
    },
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    gap: 1,
    p: { xs: 3, md: 4.5 },
    // Metnin okunurlugu gorselden bagimsiz olsun diye alttan karartma.
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
    color: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  title: {
    fontSize: { xs: 24, md: 32 },
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.1,
  },
  description: {
    fontSize: { xs: 14, md: 15 },
    lineHeight: 1.5,
    maxWidth: 420,
    opacity: 0.9,
  },
  cta: {
    mt: 0.5,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    textUnderlineOffset: 4,
  },
};

export default styles;
