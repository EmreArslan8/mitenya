// shared/ShopBrand/styles.ts
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Marka renkleri şeridi dağıtmasın; hover'da gerçek renk geri gelir.
    filter: 'grayscale(100%)',
    opacity: 0.7,
    transition: 'filter .2s ease, opacity .2s ease',
    '&:hover': {
      filter: 'grayscale(0%)',
      opacity: 1,
    },
  },
  highlight: {
    filter: 'none',
    opacity: 1,
  },
}));

export default useStyles;
