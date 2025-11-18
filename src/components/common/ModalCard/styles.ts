import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  modal: {
    display: 'flex',
    alignItems: { xs: 'end', sm: 'center' },
    justifyContent: 'center',
    p: { sm: 2 },
  },
  card: {
    width: { xs: '100%', sm: 'fit-content' },
    maxWidth: { sm: 600 },
    maxHeight: 'calc(100% - 16px)',
    borderRadius: { xs: '16px 16px 0px 0px', sm: 2 },
    background: palette.bg.main,
  },
  cardBody: {
    p: { xs: 2, sm: 3 },
    gap: 3,
    overflowY: 'scroll',
    maxWidth: '100%',
  },
}));

export default useStyles;
