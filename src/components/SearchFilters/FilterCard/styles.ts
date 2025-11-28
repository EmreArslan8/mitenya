
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
      gap: 0.5,
      // overflow: 'hidden',
      fontSize: 14,
      py: { xs: '6px', sm: '4px' },
      color: palette.text.medium,
    },
    checkbox: { m: 0, p: 0 },
    radio: { m: 0, p: 0 },
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
