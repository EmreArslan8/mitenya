import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => {
  return {
    drawer: { zIndex: 1300 },
    paper: {
      width: { xs: '88vw', sm: 380 },
      height: '100%',
      p: 0,
      backgroundColor: '#f5f5f5',
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
      py: 1.5,
      flexShrink: 0,
      backgroundColor: '#f5f5f5',
    },
    headerLogoWrap: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 34,
    },
    headerLogo: {
      ...palette.logo,
      width: 118,
      height: 38,
    },
    closeButton: {
      color: palette.text.main,
      p: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      minHeight: 56,
      px: 2.5,
      pb: 1.5,
      pt: 2,
      backgroundColor: '#f5f5f5',
    },
    sectionHeaderLabel: {
      fontSize: 16,
      fontWeight: 500,
      color: palette.text.main,
      lineHeight: 1.2,
    },
    sectionBackButton: {
      p: 0,
      mr: 1,
      color: palette.text.main,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    listContainer: {
      backgroundColor: '#ffffff',
    },
    actionItem: {
      minHeight: 'unset',
      px: 2.5,
      py: 2,
      gap: 2,
      borderBottom: `1px solid ${palette.gray[200] || '#eeeeee'}`,
      borderRadius: '0 !important',
      backgroundColor: '#ffffff',
      '&:last-of-type': { borderBottom: 'none' }, // Son elemandan sonra çizgi olmasın
      '&.Mui-disabled': {
        opacity: 0.45,
      },
      '&:hover': {
        backgroundColor: palette.gray[50] || '#fafafa',
      },
    },
    actionIcon: {
      width: 32,
      height: 32,
      color: palette.text.main,
      flexShrink: 0,
    },
    actionLabel: {
      fontWeight: 400,
      fontSize: 16,
      lineHeight: 1.3,
      color: palette.text.main,
    },
    categoryItem: {
      minHeight: 'unset',
      px: 2.5,
      py: 2,
      borderBottom: `1px solid ${palette.gray[200] || '#eeeeee'}`,
      borderRadius: '0 !important',
      backgroundColor: '#ffffff',
      display: 'flex',
      justifyContent: 'space-between',
      '&:last-of-type': { borderBottom: 'none' },
      '&:hover': {
        backgroundColor: palette.gray[50] || '#fafafa',
      },
      '&.Mui-disabled': {
        opacity: 0.45,
      },
    },
    categoryLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 1.3,
      color: palette.text.main,
    },
    chevronIcon: {
      width: 32,
      height: 32,
      color: palette.text.main,
      flexShrink: 0,
    },
    emptyText: {
      px: 2.5,
      py: 2,
      fontSize: 14,
      color: palette.text.medium,
      backgroundColor: '#ffffff',
    },
    footerLinks: {
      mt: 'auto',
      borderTop: `1px solid ${palette.gray[200] || '#eeeeee'}`,
      backgroundColor: '#f5f5f5',
      pt: 2,
      pb: 4,
    },
    footerLinkItem: {
      minHeight: 48,
      borderRadius: 0,
      justifyContent: 'center',
      px: 2.5,
      fontSize: 15,
      fontWeight: 500,
      color: palette.text.medium,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'transparent',
        textDecoration: 'underline',
      },
    },
  };
});

export default useStyles;
