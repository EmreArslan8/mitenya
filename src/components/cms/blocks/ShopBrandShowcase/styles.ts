import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  wrapper: {
    width: '100%',
    px: 0,
    py: 2.5,
  },

  // Ana grid:
  // xs/sm: 1 kolon → image → header → products
  // md+:  2 kolon → üstte header (2 kolonu kaplar), altta image | products
  body: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: '1fr',
      md: 'minmax(0, 1.4fr) minmax(0, 1fr)',
    },
    gridTemplateAreas: {
      xs: `"image"
           "header"
           "products"`,
      sm: `"image"
           "header"
           "products"`,
      md: `"header header"
           "image  products"`,
    },
    columnGap: { xs: 0, md: 3 },
    rowGap: { xs: 2, sm: 2.5, md: 3 },
    alignItems: 'stretch',
  },

  imageWrapper: {
    gridArea: 'image',
    position: 'relative',
    width: '100%',
    aspectRatio: { xs: '3 / 2', md: '16 / 9' },
    borderRadius: 0,
    overflow: 'hidden',
  },

  header: {
    gridArea: 'header',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
  },
  
  headerText: {
    display: 'flex',
    flexDirection: 'column', // ⬅️ KRİTİK
    gap: 0.25,
    maxWidth: '75%',
  },
  
  headerButton: {
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  

  // Olcek SectionBase basligiyla ayni: blok basligi ile bolum basligi
  // yan yana geldiginde ikisi ayni hiyerarside okunuyor.
  title: {
    fontSize: { xs: 24, sm: 30, md: 34 },
    fontWeight: { xs: 600, md: 500 },
    letterSpacing: { xs: '-0.01em', sm: '-0.02em', md: '-0.025em' },
    color: palette.text.main,
    // Duz `lineHeight: 1.15` ise etkisiz kaliyor: temanin h2 varyanti satir
    // yuksekligini `breakpoints.up('sm')` medya blogunda 24px'e sabitliyor ve
    // o blok birlesik sinifta duz bildirimden sonra geliyor. Kirilimli
    // yazilinca bizim deger de medya blogu icine dusup kazaniyor.
    lineHeight: { xs: 1.15, sm: 1.15 },
  },

  description: {
    fontSize: { xs: '14px', md: '16px' },
    fontWeight: 400,
    color: palette.text.secondary ?? palette.text.main,
    lineHeight: 1.4,
  },

 
  productsContainer: {
    gridArea: 'products',
  },
}));

export default useStyles;
