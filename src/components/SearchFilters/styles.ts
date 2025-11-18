import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => ({
  aside: {
    position: 'sticky',
    top: 146,
    left: 0,
    right: 0,
    transition: 'top 0.2s',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    MsOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    gap: 2,
  },
}));

export default useStyles;
