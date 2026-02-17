'use client';

import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => {
  return {
    drawer: { zIndex: 1300 },
    paper: {
      width: { xs: '88vw', sm: 380 },
      height: '100%',
      p: 0,
      backgroundColor: palette.bg.main,
    },
    content: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2.5,
      py: 2,
      borderBottom: `1px solid ${palette.gray[100]}`,
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 700,
      color: palette.text.main,
      letterSpacing: '-0.01em',
    },
    closeButton: {
      width: 34,
      height: 34,
      border: `1px solid ${palette.gray[200]}`,
      backgroundColor: palette.bg.main,
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      px: 2.5,
      py: 2.5,
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    section: {
      gap: 1.25,
    },
    sectionTitle: {
      px: 0,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: palette.text.light,
    },
    quickActions: {
      backgroundColor: 'transparent',
    },
    actionItem: {
      minHeight: 54,
      px: 0,
      py: 1,
      gap: 1.25,
      borderBottom: `1px solid ${palette.gray[100]}`,
      '&:last-of-type': { borderBottom: 0 },
      '&.Mui-disabled': {
        opacity: 0.45,
      },
      '&:hover': {
        backgroundColor: palette.gray[50],
      },
    },
    actionIcon: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: palette.text.medium,
      backgroundColor: palette.gray[50],
      flexShrink: 0,
    },
    actionLabel: {
      fontWeight: 600,
      fontSize: 16,
      color: palette.text.main,
    },
    divider: {
      my: 2.5,
      borderColor: palette.gray[100],
    },
    emptyText: {
      px: 0.5,
      py: 1,
      fontSize: 14,
      color: palette.text.medium,
    },
    categoryList: {
      backgroundColor: 'transparent',
    },
    categoryItem: {
      minHeight: 54,
      px: 0,
      py: 1,
      borderBottom: `1px solid ${palette.gray[100]}`,
      '&:last-of-type': { borderBottom: 0 },
      '&:hover': {
        backgroundColor: palette.gray[50],
      },
      '&.Mui-disabled': {
        opacity: 0.45,
      },
    },
    categoryLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: 600,
      color: palette.text.main,
    },
    chevronWrap: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.gray[50],
      color: palette.text.medium,
      transition: 'transform 0.2s ease',
      flexShrink: 0,
    },
    directLinkDot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      ml: 1,
      backgroundColor: palette.error.main,
      flexShrink: 0,
    },
    subList: {
      py: 0.25,
      backgroundColor: 'transparent',
    },
    subItem: {
      minHeight: 48,
      pl: 2,
      pr: 0,
      py: 0.75,
      '&:hover': {
        backgroundColor: palette.gray[50],
      },
      '&.Mui-disabled': {
        opacity: 0.45,
      },
    },
    subLabel: {
      fontSize: 15,
      color: palette.text.medium,
      fontWeight: 500,
    },
    promoCard: {
      mt: 2.5,
      px: 0,
      py: 1.25,
      borderRadius: 0,
      borderTop: `1px solid ${palette.gray[100]}`,
      borderBottom: `1px solid ${palette.gray[100]}`,
      backgroundColor: 'transparent',
      cursor: 'pointer',
      gap: 0.5,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: palette.gray[50],
      },
    },
    promoEyebrow: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: palette.text.light,
      fontWeight: 700,
    },
    promoTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: palette.text.main,
    },
    footerLinks: {
      mt: 2.5,
      mb: 0,
      borderTop: `1px solid ${palette.gray[100]}`,
      pt: 1.25,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 1,
    },
    footerLinkItem: {
      minHeight: 48,
      borderRadius: 0,
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 600,
      color: palette.text.medium,
      backgroundColor: 'transparent',
      border: `1px solid ${palette.gray[100]}`,
      '&:hover': {
        color: palette.text.main,
        backgroundColor: palette.gray[50],
      },
    },
  };
});

export default useStyles;
