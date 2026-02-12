'use client';

import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => {
  return {
    logoSrc: palette.logo.src as string,
    drawer: { zIndex: 1300 },
    paper: {
      width: { xs: '88vw', sm: 380 },
      height: '100%',
      p: 0,
      background: `linear-gradient(180deg, ${palette.bg.main} 0%, ${palette.bg.light} 100%)`,
    },
    content: {
      height: '100%',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2.5,
      py: 2.25,
      borderBottom: `1px solid ${palette.gray[100]}`,
      background: `linear-gradient(90deg, ${palette.bg.main} 0%, ${palette.gray[50]} 100%)`,
    },
    closeButton: {
      width: 34,
      height: 34,
      border: `1px solid ${palette.gray[200]}`,
      backgroundColor: palette.bg.main,
    },
    brandText: {
      letterSpacing: 0,
      fontSize: 28,
      fontWeight: 700,
      color: palette.text.main,
      lineHeight: 1,
    },
    sectionHeader: { px: 2.5, pt: 2, pb: 1 },
    sectionTitle: {
      fontWeight: 800,
      fontSize: 12,
      letterSpacing: '0.08em',
      color: palette.text.light,
      textTransform: 'uppercase',
    },
    accountSection: {
      px: 1.25,
      pb: 1.5,
    },
    menuItem: {
      py: 1.6,
      px: 1.5,
      gap: 1.5,
      borderRadius: 2,
      color: palette.text.main,
      '&:hover': {
        backgroundColor: palette.error.light,
      },
    },
    menuIconWrap: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.gray[50],
      color: palette.text.medium,
      flexShrink: 0,
    },
    divider: {
      mx: 2.5,
      borderColor: palette.gray[100],
    },
    categoriesSection: {
      px: 1.25,
      pb: 2.5,
    },
    categoryItem: {
      py: 1.3,
      px: 1.5,
      gap: 1,
      borderRadius: 2,
      '&:hover': { backgroundColor: palette.error.light },
    },
    categoryLabel: { flex: 1, fontWeight: 700, color: palette.text.main },
    chevronWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: palette.gray[50],
      color: palette.text.medium,
      transition: 'transform 0.2s ease',
    },
    collapseContainer: {
      ml: 2.8,
      mr: 1.5,
      mb: 1,
      pl: 1.5,
      pr: 0.5,
      py: 0.8,
      gap: 0.6,
      borderLeft: `1px solid ${palette.gray[200]}`,
    },
    subItem: {
      fontWeight: 700,
      fontSize: 14,
      color: palette.text.medium,
      py: 0.4,
    },
    subChildItem: {
      color: palette.text.mediumLight,
      fontSize: 14,
      py: 0.35,
      px: 0.6,
      borderRadius: 1.25,
      '&:hover': {
        color: palette.error.main,
        backgroundColor: palette.error.light,
      },
    },
  };
});

export default useStyles;
