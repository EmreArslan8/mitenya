
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => {

  return {
    card: {
      header: { p: 0 },
    },
    items: {
      maxHeight: { xs: '100%', sm: 230 },
      width: '100%',
      overflowY: 'auto',
      py: 0.5,
      pr: 0.5,
      scrollbarWidth: 'thin',
      scrollbarColor: `${palette.gray[400]} transparent`,
      '&::-webkit-scrollbar': {
        width: 6,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: palette.gray[400],
        borderRadius: 999,
      },
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
    priceWrapper: {
      gap: 1.2,
      pt: 0.75,
      width: '100%',
      maxWidth: '100%',
      overflow: 'visible',
    },
    priceValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      mt: 0.1,
    },
    priceValueText: {
      fontSize: 14,
      fontWeight: 700,
      color: palette.primaryDark.main,
      letterSpacing: '0.01em',
    },
    priceSlider: {
      width: 'calc(100% - 24px)',
      mx: '12px',
      py: 0.75,
      overflow: 'visible',
      '& .MuiSlider-rail': {
        opacity: 1,
        backgroundColor: palette.gray[200],
        height: 8,
      },
      '& .MuiSlider-track': {
        border: 0,
        backgroundColor: palette.accentRed.main,
        height: 8,
      },
      '& .MuiSlider-thumb': {
        width: 22,
        height: 22,
        backgroundColor: palette.primary.main,
        border: `2px solid ${palette.bg.main}`,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      },
    },
    priceInputLabelsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      mt: 0.2,
    },
    priceInputLabel: {
      width: '48%',
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: 700,
      color: palette.primaryDark.main,
      letterSpacing: '0.03em',
    },
    priceInputsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.8,
    },
    priceInput: {
      width: { xs: '48%', sm: '48%' },
      '& .MuiOutlinedInput-root': {
        height: 38,
        borderRadius: 1.2,
        background: palette.bg.main,
        boxShadow: `inset 0 0 0 1px ${palette.gray[300]}`,
      },
      '& input': {
        fontSize: 16,
        fontWeight: 600,
        MozAppearance: 'textfield',
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
      },
    },
    priceToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 0.75,
      mt: -0.5,
    },
    priceToggleLabel: {
      fontSize: 14,
      color: palette.text.medium,
      lineHeight: 1.2,
    },
    priceApplyButton: {
      alignSelf: 'stretch',
      width: '100%',
      minWidth: 120,
      minHeight: 46,
      borderRadius: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      fontWeight: 800,
      mt: 0.25,
    },
  };
});

export default useStyles;
