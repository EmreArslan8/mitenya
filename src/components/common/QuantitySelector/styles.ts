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
