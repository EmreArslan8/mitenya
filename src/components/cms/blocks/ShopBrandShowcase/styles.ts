import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  wrapper: {
    width: '100%',
    px: { xs: 1, md: 2 },
    py: { xs: 1.5, md: 2.5 },
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
    borderRadius: 2,
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
  

  title: {
    fontSize: { xs: '1.125rem', md: '1.25rem' },
    fontWeight: 700,
    color: palette.text.main,
    lineHeight: 1.3,
  },

  description: {
    fontSize: { xs: '0.875rem', md: '1rem' },
    fontWeight: 400,
    color: palette.text.secondary ?? palette.text.main,
    lineHeight: 1.4,
  },

 
  productsContainer: {
    gridArea: 'products',
  },
}));

export default useStyles;
