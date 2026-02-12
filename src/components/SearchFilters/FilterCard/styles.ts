
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => {

  return {
    card: {
      header: { p: 0 },
    },
    items: {
      maxHeight: { xs: '100%', sm: 230 },
      maxWidth: { sm: 200 },
      overflowY: 'scroll',
      py: 0.5,
    },
    itemsShadowTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 10,
      zIndex: 1,
      backgroundImage: 'linear-gradient(to top, rgba(255, 255, 255, 0.2), #fff)',
    },
    itemsShadowBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 10,
      zIndex: 1,
      backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), #fff)',
    },
    item: {
      cursor: 'pointer',
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: { xs: 1, sm: 0.5 },
      // overflow: 'hidden',
      fontSize: { xs: 19, sm: 14 },
      lineHeight: { xs: 1.35, sm: 1.25 },
      py: { xs: '8px', sm: '4px' },
      color: palette.text.medium,
    },
    itemDisabled: {
      cursor: 'not-allowed',
    },
    controlDisabled: {
      pointerEvents: 'none',
      '& .MuiSvgIcon-root': {
        opacity: 0.6,
      },
    },
    checkbox: {
      m: 0,
      p: 0,
      mr: { xs: 0.25, sm: 0 },
      '& .MuiSvgIcon-root': {
        fontSize: { xs: 24, sm: 20 },
      },
    },
    radio: {
      m: 0,
      p: 0,
      mr: { xs: 0.25, sm: 0 },
      '& .MuiSvgIcon-root': {
        fontSize: { xs: 24, sm: 20 },
      },
    },
    searchInput: {
      m: { xs: '0 0 4px', sm: '8px 0 2px' },
      width: { xs: '100%', sm: 160 },
      '& input': {
        pt: 0,
        pb: '1px',
        height: { xs: 36, sm: 22 },
        fontSize: { xs: 16, sm: 13 },
        '&::placeholder': {
          color: `${palette.text.mediumLight} !important`,
          opacity: 1,
        },
      },
      '& .MuiOutlinedInput-root': {
        height: { xs: 36, sm: 22 },
        fontSize: { xs: 16, sm: 13 },
        borderRadius: { sm: 0.5 },
        background: palette.bg.light,
      },
    },
    searchIcon: {
      fontSize: { xs: 20, sm: 15 },
      px: { xs: 0.5, sm: 0 },
      color: palette.text.mediumLight,
    },
  };
});

export default useStyles;
