import useLocale from '@/lib/hooks/useLocale';
import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => {
  const { direction } = useLocale();
  return {
    container: {
      position: 'fixed',
      flexDirection: 'row',
      ...(direction === 'rtl'
        ? { right: `calc(50vw - (min(100vw,${defaultMaxWidth}px))/2 + 8px)` }
        : { left: `calc(50vw - (min(100vw,${defaultMaxWidth}px))/2 + 8px)` }),
      bottom: { xs: 68, sm: 16 },
      borderRadius: 99,
      border: '1px solid',
      borderColor: palette.tertiary.light,
      background: palette.bg.main,
      zIndex: 20,
    },
  };
});

export default useStyles;
