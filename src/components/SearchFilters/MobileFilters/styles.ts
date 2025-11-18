import { withPalette } from '@/theme/ThemeRegistry';
import { bannerHeight } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  mobileFiltersBar: {
    position: 'fixed',
    top: 88 + bannerHeight + 56,
    left: 0,
    right: 0,
    zIndex: 1296,
    flexDirection: 'row',
    overflowX: 'scroll',
    scrollbarWidth: 'none',
    MsOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    background: palette.bg.main,
    gap: 1,
    px: 2,
    py: 1.5,
    transition: 'top 0.2s, padding 0.2s',
  },
  filter: {},
  modal: { zIndex: 1298 },
  modalBody: {
    maxHeight: '70vh',
    pb: 12,
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    MsOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
}));

export default useStyles;
