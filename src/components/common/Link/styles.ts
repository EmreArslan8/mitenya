import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  link: (colored?: boolean) => ({
    textDecoration: 'none',
    ...(colored
      ? {
          color: palette.primary.main,
          '&:visited': { color: palette.primary.dark },
          '&:hover': { color: palette.primary.main },
          '&:active': { color: palette.primary.dark },
        }
      : {
          color: 'inherit',
        }),
  }),
}));

export default useStyles;
