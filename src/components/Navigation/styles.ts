'use client';

import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import { withPalette } from '@/theme/ThemeRegistry';
import { bannerHeight, defaultMaxWidth, headerHeight } from '@/theme/theme';

const useStyles = withPalette((palette) => {
  const isMobileApp = useIsMobileApp();
  return {
    container: {
      height: { xs: headerHeight.xs + bannerHeight, sm: headerHeight.sm + bannerHeight },
    },
    banner: {
      justifyContent: 'center',
      height: bannerHeight,
      background: isMobileApp ? palette.bg.main : palette.bg.dark,
      width: '100vw',
      alignSelf: 'center',
      px: { xs: 1, sm: 2 },
    },
    bannerInnerContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'end',
      maxWidth: defaultMaxWidth,
      width: '100%',
      gap: 1,
    },
    a: { textDecoration: 'none', color: 'inherit' },
    bannerLinks: { flexDirection: 'row', mr: 'auto' },
    bannerLink: { fontSize: 12, gap: 0.5 },
    innerContainer: {
      position: 'fixed',
      zIndex: 1297,
      top: 0,
      left: 0,
      right: 0,
      height: { xs: headerHeight.xs + bannerHeight, sm: headerHeight.sm + bannerHeight },
      background: palette.bg.main,
      transition: 'top 0.2s, box-shadow 0.2s ease-in',
      px: { xs: 2, sm: 3 },
    },
    logo: { ...palette.logo, cursor: 'pointer' },
    content: {
      width: '100%',
      alignSelf: 'center',
      maxWidth: defaultMaxWidth,
      gap: { xs: 1, sm: 2 },
      py: { xs: 1, sm: 2 },
    },
    primaryBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    },
    actions: { flexDirection: 'row', alignItems: 'center' },
    action: {
      px: { xs: '6px', sm: 1 },
      gap: { xs: 0.5, sm: 1 },
      minWidth: 0,
      color: palette.bg.contrastText,
    },
    secondaryBar: {
      flexDirection: 'row',
      alignItems: 'center',
      color: palette.text.medium,
      justifyContent: 'center',
      width: { xs: '100vw', sm: '100%' },
      alignSelf: { xs: 'center' },
      gap: 1,
    },
    shopHeaderLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      overflow: { xs: 'scroll', sm: 'hidden' },
      flexWrap: { sm: 'wrap' },
      height: 28,
      scrollbarWidth: 'none',
      MsOverflowStyle: 'none',
      width: '100%',
      '&::-webkit-scrollbar': { display: 'none' },
      px: { xs: 1, sm: 0 },
      color: palette.bg.contrastText,
    },
    shopHeaderLink: {
      fontWeight: 500,
      color: palette.text.medium,
      '&.Mui-selected': {
        fontWeight: 500,
        color: palette.primary.dark,
      },
    },
    bottomNavigation: {
      boxShadow: '0 0 5px #00000010',
      zIndex: 1300,
      background: palette.bg.main,
      position: 'fixed',
      right: 0,
      bottom: 0,
      left: 0,
      '& .MuiBottomNavigationAction-label': {
        fontSize: 'min(3vw, 12px)',
        fontWeight: 500,
      },
      '& .Mui-selected': {
        fontWeight: 500,
        fontSize: 'min(3vw, 12px) !important',
      },
    },
    accountMenuItem: {
      flexDirection: 'column',
      background: palette.bg.light,
      color: palette.text.medium,
      py: 1,
      gap: 0.5,
    },
    logoutButton: {
      background: palette.error.light,
      color: palette.error.main,
      width: 'fit-content',
    },
    loginButton: {
      background: palette.primary.light,
      color: palette.primary.main,
      width: 'fit-content',
    },
    searchBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      maxWidth: 500,
      width: '100%',
      gap: 1,
      position: 'relative',
    },
    searchBarInput: {
      // maxWidth: 340,
      gap: 1,
      '& .MuiInputBase-root': { px: 1 },
      '& input': { px: '0 !important' },
    },
    historyContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      width: '100%',
      backgroundColor: 'white !important',
      boxShadow: '0px 0px 16px 0px #00000040',
      px: 1.5,
      py: 1,
      zIndex: 1,
      borderRadius: '0 0 8px 8px',
    },
    alert: {
      flexDirection: 'row',
      width: '100vw',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      background: palette.warning.light,
      color: palette.warning.main,
      height: 56,
      gap: 1,
      px: 2,
      transition: 'height 0.2s',
      overflow: 'hidden',
    },
    backButton: {
      height: 40,
      borderRadius: 2,
      color: 'text.primary',
    },
  };
});

export default useStyles;
