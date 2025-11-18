import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  modal: { zIndex: 1298 },
  body: { height: 350, gap: 0, p: 0, pb: 2, mb: 7 },
  node: {
    minHeight: '46px !important',
    justifyContent: 'space-between',
    px: 2,
    borderRadius: 0,
    '&:not(:last-child)': { borderBottom: '1px solid', borderColor: palette.text.light },
  },
  icon: { color: palette.text.medium },
  back: { color: palette.text.medium, textTransform: 'none', m: -1, width: 'fit-content' },
}));

export default useStyles;
