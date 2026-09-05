import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  itemQuantitySelector: {
    flexDirection: 'row',
    border: '1px solid',
    borderColor: palette.bg.dark,
    width: 'fit-content',
    px: '6px',
    borderRadius: 99,
    height: 30,
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemQuantityButton: {
    color: palette.text.medium,
    width: 20,
    height: 20,
    p: 0,
  },
  decreaseButtonColor: (value: number) => (value === 1 ? palette.error.main : 'currentColor'),
  /*
   * Elle yazılabilen adet alanı. Normalde düz sayı gibi durur; üstüne
   * gelince zemin ve imleç değişerek yazılabilir olduğunu belli eder.
   */
  itemQuantityInput: {
    width: 28,
    height: 24,
    p: 0,
    border: 0,
    outline: 'none',
    background: 'transparent',
    textAlign: 'center',
    color: palette.text.main,
    fontSize: 18,
    fontWeight: 700,
    fontFamily: 'inherit',
    borderRadius: '4px',
    cursor: 'text',
    transition: 'background-color 0.15s',
    '&:hover': { backgroundColor: palette.bg.dark },
    '&:focus': { backgroundColor: palette.bg.dark },
    // Sayı okunun alan daraltmasını engelle
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  },
  itemQuantityValue: {
    alignItems: 'center',
    justifyContent: 'center',
    color: palette.text.main,
    fontSize: 18,
    fontWeight: 700,
    height: 24,
    width: 24,
  },
}));

export default useStyles;
