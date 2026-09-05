import { withPalette } from '@/theme/ThemeRegistry';
import { CSSProperties } from 'react';

/*
 * Ölçüler boyner.com.tr/sepet kart bileşeninden alındı (canlı computed style):
 *   marka şeridi   padding 12/16, 1px kenarlık
 *   görsel         max-width 100px
 *   detay kutusu   margin-left 16, satır arası 12 (kargo satırı 8)
 *   kontroller     gap 32, margin-left 28; fiyat kolonu 112px, gap 2
 *   favori         margin-left 28
 *   kampanya rozeti padding 4/8, radius 1
 * Tipografi ölçeği: 16/540, 14/540, 12/540, 14/400, 12/400 (satır 22/20/16).
 * Renkler Mitenya paletinden — geometri Boyner'den, kimlik bizden.
 */

const useStyles = withPalette((palette) => ({
  card: (unavailable = false) => ({
    borderRadius: 0,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    flexDirection: 'column',
    gap: 0,
    p: 0,
    width: '100%',
    opacity: unavailable ? 0.7 : 1,
    filter: unavailable ? 'saturate(0.1)' : 'none',
  }),

  /* ---------- marka şeridi ---------- */
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    px: '16px',
    py: '12px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  brandName: {
    fontSize: 14,
    fontWeight: 540,
    lineHeight: '20px',
    letterSpacing: '0.28px',
    textTransform: 'uppercase',
    color: palette.text.main,
    maxWidth: '40%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  brandBarAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    maxWidth: '60%',
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: '0.24px',
    color: palette.text.mediumLight,
    whiteSpace: 'nowrap',
  },

  /* ---------- gövde ---------- */
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    p: '16px',
  },
  imageContainer: {
    flexShrink: 0,
    width: 100,
    maxWidth: 100,
    height: 136,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as CSSProperties,

  info: {
    flex: 1,
    minWidth: 0,
    ml: '16px',
    gap: '12px',
  },
  title: {
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: '0.28px',
    color: palette.text.mediumLight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
  },
  titleBrand: {
    fontWeight: 540,
    textTransform: 'uppercase',
    color: palette.text.main,
  },
  /* Boyner'de kargo satırı diğer satırlardan 8px sonra geliyor (12 değil). */
  delivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    mt: '-4px',
    color: palette.text.mediumLight,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0.24px',
    color: palette.text.mediumLight,
  },
  variants: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0.24px',
    color: palette.text.mediumLight,
  },

  /* ---------- kampanya rozeti ---------- */
  campaign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    px: '8px',
    py: '4px',
    borderRadius: '1px',
    backgroundColor: palette.bg.dark,
  },
  campaignText: {
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: '0.24px',
    color: palette.text.main,
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  campaignApplied: {
    fontSize: 12,
    lineHeight: '16px',
    letterSpacing: '0.24px',
    color: palette.success.main,
  },

  /* ---------- adet, fiyat, favori ---------- */
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '32px',
    ml: '28px',
    flexShrink: 0,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: '2px',
    width: 112,
  },
  price: {
    whiteSpace: 'nowrap',
    fontSize: 16,
    fontWeight: 540,
    lineHeight: '22px',
    letterSpacing: '0.32px',
    color: palette.text.main,
  },
  savingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    color: palette.success.main,
  },
  savingText: {
    fontSize: 12,
    fontWeight: 540,
    lineHeight: '16px',
    letterSpacing: '0.24px',
    whiteSpace: 'nowrap',
  },
  /* ---------- sepetten çıkarma onayı ---------- */
  removeModalCard: {
    width: { xs: '100%', sm: 420 },
    maxWidth: '100%',
  },
  removeModal: {
    px: { xs: 2, sm: 4 },
    pt: 1,
    pb: 4,
    gap: 4,
    alignItems: 'center',
  },
  removeModalTitle: {
    fontSize: 20,
    fontWeight: 500,
    lineHeight: '28px',
    textAlign: 'center',
    color: palette.text.main,
  },
  removeModalActions: {
    width: '100%',
    gap: 1.5,
  },
  favoriteButton: (favorited = false) => ({
    p: 0,
    width: 24,
    height: 24,
    color: favorited ? palette.accentRed.main : palette.text.main,
  }),
}));

export default useStyles;
