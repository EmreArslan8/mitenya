import { withPalette } from '@/theme/ThemeRegistry';
import { defaultMaxWidth } from '@/theme/theme';

const useStyles = withPalette((palette) => ({
  drawer: { '& .MuiPaper-root': { overflow: 'hidden', height: '80vh', px: { xs: 2, sm: 3 } } },
  drawerBody: {
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 4,
    maxWidth: defaultMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  categories: {
    py: 1.5,
    width: 280,
  },
  category: {
    '&.Mui-selected': {
      color: palette.primary.main,
      background: palette.primary.light,
      fontWeight: 600,
      '&:hover': {
        background: palette.primary.light,
      },
    },
    transition: 'all 0.1s',
  },
  categoryChildren: {
    py: 2,
    width: '100%',
    overflowY: 'scroll',
  },
  childTitle: {
    fontWeight: 600,
    px: 1,
  },
  leaf: {
    fontSize: 14,
    color: palette.text.medium,
    whiteSpace: 'break-spaces',
  },
}));

export default useStyles;
