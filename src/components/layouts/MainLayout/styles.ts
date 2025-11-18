import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  container: {
    background: palette.bg.main,
    color: palette.bg.contrastText,
    width: '100%',
    minHeight: 'calc(100vh - 146px)',
    py: 2,
    px: { xs: 1, sm: 3 },
    gap: { xs: 1, sm: 3 },
  },
  content: {
    width: '100%',
    maxWidth: defaultMaxWidth,
    alignSelf: 'center',
  },
}));

export default useStyles;
