import { withPalette } from '@/theme/ThemeRegistry';


const useStyles = withPalette((palette) => ({
  select: { '.MuiSelect-icon': { top: 'unset', transition: 'transform 0.1s' }, height: 56 },
  paper: { mt: 1, '.MuiMenu-list': { p: 1 } },
  textField: {
    input: { '&::placeholder': { color: `${palette.text.medium} !important` } },
    '& label': { color: palette.primary.main },
    '& .MuiInput-underline:after': { borderBottomColor: palette.primary.main },
    '& .MuiInput-root:hover:not(.Mui-disabled, .Mui-error):before': {
      borderColor: palette.primary.main,
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: palette.primary.main },
      '&:hover fieldset': { borderColor: palette.primary.main, borderWidth: 2 },
      '&.Mui-focused fieldset': { borderColor: palette.primary.main },
    },
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    width: '100%',
    gap: 1,
    py: 1,
    px: '6px',
    borderRadius: 0.5,
  },
  divider: { my: '4px !important' },
}));
export default useStyles;
