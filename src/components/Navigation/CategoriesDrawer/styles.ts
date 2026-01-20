'use client';

import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(() => {
  return {
    drawer: { zIndex: 1300 },
    paper: {
      width: { xs: '85vw', sm: 360 },
      height: '100%',
      p: 0,
      backgroundColor: '#fff',
    },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 2,
    },
    brandText: { letterSpacing: 2,fontSize: 24, fontWeight: 600 },
    sectionHeader: { px: 3, py: 1.5, backgroundColor: '#f3f3f3' },
    sectionTitle: { fontWeight: 600 },
    menuItem: { py: 2, px: 3, gap: 2 },
    categoryItem: { py: 1.5, px: 3, gap: 1 },
    categoryLabel: { flex: 1, fontWeight: 600 },
    collapseContainer: { px: 3, pb: 1.5, gap: 1 },
    subItem: { fontWeight: 600 },
    subChildItem: { color: 'text.secondary' },
  };
});

export default useStyles;
