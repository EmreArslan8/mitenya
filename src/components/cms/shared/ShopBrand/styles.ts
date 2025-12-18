// shared/ShopBrand/styles.ts
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'grayscale(100%)',
    transition: 'filter .2s ease, opacity .2s ease',
    '&:hover': {
      filter: 'grayscale(0%)',
      opacity: 1,
    },
  },
}));

export default useStyles;
