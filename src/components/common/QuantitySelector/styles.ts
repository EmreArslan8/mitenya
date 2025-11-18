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
  },
  decreaseButton: (value: number) => ({
    color: value === 1 ? palette.error.main : 'inherit',
  }),
  itemQuantityValue: {
    alignItems: 'center',
    justifyContent: 'center',
    color: palette.text.main,
    fontSize: 14,
    fontWeight: 700,
    height: 24,
    width: 24,
  },
}));

export default useStyles;
