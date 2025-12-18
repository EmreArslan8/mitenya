import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette(
  (palette) => (colorway: 'light' | 'dark') => {
    const isDark = colorway === 'dark';

    return {
      container: {
        position: 'relative',
        height: { xs: 260, md: 420 },
        borderRadius: 2,
        overflow: 'hidden',
      },

      image: {
        objectFit: 'cover',
        zIndex: 0,
      },

      content: {
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        px: { xs: 3, md: 5 },
        pb: { xs: 3, md: 6 },
        alignItems: 'flex-end',
        justifyContent: 'center',
        textAlign: 'right',
        color: isDark ? palette.white.main : palette.primary.deepDark,
      },

      title: {
        fontFamily: '"Imperial Script", cursive',
        fontSize: { xs: 28, md: 38 },
        fontWeight: 600,
        lineHeight: 1.22,
        letterSpacing: '0.02em',
        mb: 2,
        maxWidth: '80%',
      },

      button: {
        borderRadius: 999,
        px: 2.5,
        py: '6px',
        fontSize: 13,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',

        ...(isDark
          ? {
              backgroundColor: palette.white.main,
              color: palette.primary.deepDark,
              '&:hover': {
                backgroundColor: palette.bg.light,
              },
            }
          : {
              background: palette.primary.gradient,
              color: palette.primary.contrastText,
              '&:hover': {
                background: palette.primary.dark,
              },
            }),
      },
    };
  }
);

export default useStyles;
