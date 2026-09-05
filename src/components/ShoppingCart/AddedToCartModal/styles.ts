import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

/*
 * Ölçüler referans modalın canlı CSS'inden:
 *   kapsayıcı  708px
 *   ızgara     grid-template-columns: 182px auto; gap 48
 *   görsel     182 × 254.8 (dikey), 1px kenarlık
 *   başlık     ikon + h3, aralarında 16, altında 16
 *   gövde      marka/ad bloğu, altında 32
 *   ikon       24×24 daire, 1px yeşil kenarlık, 2px 2px gölge
 * Tipografi: h3 24/540/34, h5 16/540/22, p14 14/400/20.
 */

const IMAGE_WIDTH = 182;
const IMAGE_HEIGHT = 255;

const useStyles = withPalette((palette) => ({
  card: {
    width: { xs: '100%', sm: 708 },
    maxWidth: '100%',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: `${IMAGE_WIDTH}px auto` },
    justifyItems: { xs: 'center', sm: 'stretch' },
    alignItems: 'center',
    gap: { xs: 3, sm: '48px' },
    textAlign: 'left',
    px: { xs: 1, sm: 2 },
    pt: 0,
    pb: 2,
  },
  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: palette.white.main,
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as CSSProperties,
  /*
   * Metin bloğu görselin yanında dikeyde ortalanır. Referansta buton
   * `margin-top: auto` ile dibe itiliyor; varyantsız üründe bu, ad ile
   * buton arasında kocaman bir boşluk bırakıyordu.
   */
  details: {
    minWidth: 0,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
    mb: '16px',
  },
  /* 24px daire, yeşil kenarlık ve sert gölge — referanstaki rozet. */
  successIcon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: palette.bg.main,
    border: `1px solid ${palette.success.main}`,
    boxShadow: `2px 2px ${palette.text.main}`,
    color: palette.success.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: 540,
    lineHeight: '34px',
    letterSpacing: '0.48px',
    color: palette.success.main,
  },
  infoBlock: {
    width: '100%',
    gap: '4px',
  },
  brand: {
    fontSize: 16,
    fontWeight: 540,
    lineHeight: '22px',
    letterSpacing: '0.32px',
    color: palette.text.main,
  },
  name: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: '0.28px',
    color: palette.text.main,
  },
  variants: {
    gap: '4px',
    mt: '12px',
  },
  variantLine: {
    fontSize: 14,
    lineHeight: '20px',
    color: palette.text.mediumLight,
  },
  cta: {
    mt: '32px',
    width: '100%',
  },
}));

export default useStyles;
