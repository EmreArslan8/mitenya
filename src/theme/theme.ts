
import { ButtonProps, ThemeOptions } from '@mui/material';
import { Interpolation, PaletteColorOptions, Theme, createTheme } from '@mui/material/styles';
import { Albert_Sans, Barlow, IBM_Plex_Sans, IBM_Plex_Mono, Rubik } from 'next/font/google';
import { Palette, defaultPalette } from './palette';

export const defaultMaxWidth = 1340;
export const headerHeight = { xs: 88, sm: 120 };
export const bannerHeight = 26;
export const defaultMarginBottom = { xs: 8, sm: 18 };
declare module '@mui/material/styles' {
  interface TypographyVariants {
    cardTitle: React.CSSProperties;
    body: React.CSSProperties;
    warning: React.CSSProperties;
    warningSemibold: React.CSSProperties;
    infoLabel: React.CSSProperties;
    infoValue: React.CSSProperties;
    progressLabel: React.CSSProperties;
    progressLabelBold: React.CSSProperties;
    progressNumber: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    cardTitle?: React.CSSProperties;
    body?: React.CSSProperties;
    warning?: React.CSSProperties;
    warningSemibold?: React.CSSProperties;
    infoLabel?: React.CSSProperties;
    infoValue?: React.CSSProperties;
    progressLabel?: React.CSSProperties;
    progressLabelBold?: React.CSSProperties;
    progressNumber?: React.CSSProperties;
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    cardTitle: true;
    body: true;
    warning: true;
    warningSemibold: true;
    infoLabel: true;
    infoValue: true;
    progressLabel: true;
    progressLabelBold: true;
    progressNumber: true;
  }
}
declare module '@mui/material/styles' {
  interface CustomPalette {
    tertiary: PaletteColorOptions;
    bg: PaletteColorOptions;
  }
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    primaryDark: true;
    blue: true;
    green: true;
    tertiary: true;
    neutral: true;
  }
  interface ButtonPropsVariantOverrides {
    tonal: true;
  }
}
const albertSans = Albert_Sans({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const barlow = Barlow({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

const rubik = Rubik({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'hebrew', 'cyrillic'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

export const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  fallback: ['monospace', 'Helvetica', 'Arial', 'sans-serif'],
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

export const defaultFontFamily = `${albertSans.style.fontFamily}, sans-serif`;
export const cyrillicFontFamily = ibmPlexSans.style.fontFamily;
export const hebrewFontFamily = rubik.style.fontFamily;

export const getFontFamily = defaultFontFamily

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 1000,
  lg: 1200,
  xl: 1920,
};

const buttonVariantMappingColors = [
  'primary',
  'primaryDark',
  'blue',
  'green',
  'success',
  'error',
  'warning',
  'neutral',
];

export const getDesignTokens = (
  palette: Palette = defaultPalette,
): ThemeOptions => {
  const theme = createTheme({
    breakpoints: {
      values: breakpoints,
    },
    palette,
    typography: {
      fontFamily: defaultFontFamily,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        variants: [
          {
            props: { color: 'primary', variant: 'contained' },
            style: {
              background: palette.text.main,          // siyah / near-black
              color: palette.white.main,
              border: `1px solid ${palette.text.main}`,
          
              '&:hover': {
                background: palette.primary.main,     // hover kırmızı
                borderColor: palette.primary.main,
              },
          
              '&.Mui-disabled': {
                background: palette.text.light,
                borderColor: palette.text.light,
                color: palette.text.disabled,
              },
            },
          },          
          {
            props: { color: 'secondary', variant: 'outlined' },
            style: {
              background: palette.secondary.contrastText,
              '&:hover': {
                background: palette.secondary.light,
              },
            },
          },
          {
            props: { color: 'secondary', variant: 'tonal' },
            style: {
              color: palette.secondary.main,
              background: `${palette.secondary.main}10`,
              '&:hover': { background: `${palette.secondary.main}20` },
            },
          },
          ...buttonVariantMappingColors.flatMap((color) => {
            return [
              {
                props: { color: color, variant: 'outlined' },
                style: {
                  background: '#fff',
                  '&.Mui-disabled': {
                    color: `${(palette as any)[color].main}80`,
                    borderColor: `${(palette as any)[color].main}80`,
                  },
                  '&:hover': {
                    background: (palette as any)[color].light,
                  },
                },
              },
              {
                props: { color: color, variant: 'tonal' },
                style: {
                  color: (palette as any)[color].main,
                  background: `${(palette as any)[color].main}20`,
                  '&.Mui-disabled': { color: `${(palette as any)[color].main}80` },
                  '&:hover': { background: `${(palette as any)[color].main}40` },
                },
              },
            ] as {
              props: Partial<ButtonProps<'button', {}>>;
              style: Interpolation<{ theme: Theme }>;
            }[];
          }),
          {
            props: { color: 'primary', variant: 'outlined' },
            style: {
              borderColor: palette.primary.main,
              background: palette.primary.light,
              '&.Mui-disabled': {
                color: `${palette.primary.main}60`,
                borderColor: `${palette.primary.main}60`,
              },
              '&:hover': {
                borderColor: palette.primary.main,
                background: palette.primary.light,
              },
            },
          },
        ],
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            borderRadius: 8,
            boxSizing: 'border-box',
            flexShrink: 0,
          },
          sizeSmall: {
            padding: '6px 20px',
            height: 36,
          },
          sizeMedium: {
            padding: '8px 24px',
            fontSize: 16,
            height: 46,
          },
          sizeLarge: {
            padding: '12px 32px',
            height: 56,
          },
        },
      },
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: { minHeight: 'auto !important' },
        },
      },
      MuiToggleButton: {
        variants: [
          {
            props: { color: 'primary' },
            style: {
              border: '1px solid',
              borderColor: palette.text.medium,
              color: palette.text.medium,
              '&:hover': {
                borderColor: '#A166FF',
                background: '#F5EFFF',
                color: palette.text.main,
              },
            },
          },
          {
            props: { color: 'primary', selected: true },
            style: {
              border: '1px solid',
              borderColor: '#A166FF',
              background: '#F5EFFF',
              color: `${palette.primary.main} !important`,
            },
          },
          {
            props: { size: 'small' },
            style: {
              height: 32,
            },
          },
        ],
        styleOverrides: {
          root: {
            textTransform: 'uppercase',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            borderRadius: 999,
          },
          sizeSmall: {
            padding: '6px 12px',
            fontSize: 14,
          },
          sizeMedium: {
            padding: '8px 16px',
            fontSize: 14,
            height: 46,
          },
          sizeLarge: {
            padding: '12px 24px',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.text.light,
            },
            '&.Mui-disabled': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: palette.text.light,
              },
              '& .MuiSelect-icon': { color: palette.text.light },
            },
          },
        },
        variants: [
          {
            props: { size: 'small', multiline: false },
            style: { height: 36, input: { height: 20, padding: '8px 14px' } },
          },
        ],
      },
      MuiInputBase: {
        variants: [
          {
            props: { size: 'medium', multiline: false },
            style: {
              height: 46,
              input: { height: 16 },
            },
          },
          {
            props: { size: 'small', multiline: false },
            style: { height: 36, input: { height: 20 } },
          },
        ],
        styleOverrides: {
          root: {
            fontWeight: 500,
            '&.Mui-disabled': {
              '& .MuiSelect-icon': { color: palette.text.light },
            },
            input: {
              '&::placeholder': { color: palette.text.light, opacity: 1 },
            },
          },
          input: {
            '&.Mui-disabled': {
              color: palette.text.light,
              WebkitTextFillColor: palette.text.light,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: palette.text.medium,
          },
        },
      },
      MuiSkeleton: {
        variants: [{ props: { variant: 'rectangular' }, style: { borderRadius: '2px' } }],
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            background: palette.white.main,
            borderRadius: 8,
            border: `1px solid ${palette.text.light}`,
            padding: 4,
            maxWidth: 400,
            minHeight: 0,
            width: '100%',
            alignSelf: 'center',
            '& .MuiTabs-indicator': {
              height: '100%',
              width: '100%',
              zIndex: 1,
              backgroundColor: '#fff',
              borderRadius: 4,
              border: `1px solid ${palette.primary.main}`,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textAlign: 'center',
            zIndex: 2,
            flex: 1,
            maxWidth: '100%',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            color: palette.text.medium,
            '&.Mui-selected': {
              color: palette.primary.main,
            },
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '16.8px',
            padding: '8px 0',
            height: '100%',
            minHeight: 0,
            transition: 'color 0.3s',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            gap: 8,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1,
            padding: '6px 8px',
            '&.Mui-selected': {
              fontWeight: 700,
              background: palette.bg.main,
              '&:hover': {
                background: palette.bg.main,
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: palette.text.light,
          },
        },
      },
      MuiList: {
        styleOverrides: { root: { padding: 4 } },
      },
      MuiCheckbox: {
        styleOverrides: { root: { height: 'min-content', width: 'min-content' } },
      },
      MuiCssBaseline: {
        styleOverrides: {
          '#crisp-chatbox': {
           
          },
        },
      },
    },
    shadows: [
      'none',
      '0px 1px 1px rgba(100, 116, 139, 0.06), 0px 1px 2px rgba(100, 116, 139, 0.1)',
      '0px 1px 2px rgba(100, 116, 139, 0.12)',
      '0px 1px 4px rgba(100, 116, 139, 0.12)',
      '0px 1px 5px rgba(100, 116, 139, 0.12)',
      '0px 1px 6px rgba(100, 116, 139, 0.12)',
      '0px 2px 6px rgba(100, 116, 139, 0.12)',
      '0px 3px 6px rgba(100, 116, 139, 0.12)',
      '0px 2px 4px rgba(31, 41, 55, 0.06), 0px 4px 6px rgba(100, 116, 139, 0.12)',
      '0px 5px 12px rgba(100, 116, 139, 0.12)',
      '0px 5px 14px rgba(100, 116, 139, 0.12)',
      '0px 5px 15px rgba(100, 116, 139, 0.12)',
      '0px 6px 15px rgba(100, 116, 139, 0.12)',
      '0px 7px 15px rgba(100, 116, 139, 0.12)',
      '0px 8px 15px rgba(100, 116, 139, 0.12)',
      '0px 9px 15px rgba(100, 116, 139, 0.12)',
      '0px 10px 15px rgba(100, 116, 139, 0.12)',
      '0px 12px 22px -8px rgba(100, 116, 139, 0.25)',
      '0px 13px 22px -8px rgba(100, 116, 139, 0.25)',
      '0px 14px 24px -8px rgba(100, 116, 139, 0.25)',
      '0px 10px 10px rgba(31, 41, 55, 0.04), 0px 20px 25px rgba(31, 41, 55, 0.1)',
      '0px 25px 50px rgba(100, 116, 139, 0.25)',
      '0px 25px 50px rgba(100, 116, 139, 0.25)',
      '0px 25px 50px rgba(100, 116, 139, 0.25)',
      '0px 25px 50px rgba(100, 116, 139, 0.25)',
    ],
    shape: { borderRadius: 8 },
  });

  theme.typography.h1 = {
    fontWeight: 700,
    fontSize: 24,
    lineHeight: '29px',
    [theme.breakpoints.up('sm')]: {
      fontSize: 28,
      lineHeight: '34px',
    },
  };

  theme.typography.h2 = {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: '22px',
    [theme.breakpoints.up('sm')]: {
      fontSize: 20,
      lineHeight: '24px',
    },
  };

  theme.typography.h3 = {
    fontWeight: 700,
    fontSize: 16,
    lineHeight: '20px',
    [theme.breakpoints.up('sm')]: {
      fontSize: 18,
      lineHeight: '22px',
    },
  };

  theme.typography.cardTitle = {
    fontWeight: 700,
    fontSize: 14,
    lineHeight: '16.8px',
  };

  theme.typography.body = {
    fontWeight: 500,
    fontSize: 16,
    lineHeight: '20px',
  };

  theme.typography.warning = {
    fontWeight: 400,
    fontSize: 15,
    lineHeight: '20px',
  };

  theme.typography.warningSemibold = {
    fontWeight: 500,
    fontSize: 15,
    lineHeight: '20px',
  };

  theme.typography.infoLabel = {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '16.8px',
    [theme.breakpoints.up('sm')]: {
      fontSize: 15,
      lineHeight: '18px',
    },
  };

  theme.typography.infoValue = {
    fontWeight: 600,
    fontSize: 15,
    lineHeight: '19px',
    [theme.breakpoints.up('sm')]: {
      fontSize: 16,
      lineHeight: '20px',
    },
  };

  theme.typography.progressLabel = {
    fontWeight: 400,
    fontSize: 13,
    lineHeight: '16px',
  };

  theme.typography.progressLabelBold = {
    fontWeight: 700,
    fontSize: 13,
    lineHeight: '16px',
  };

  theme.typography.progressNumber = {
    fontWeight: 700,
    fontSize: 14,
    lineHeight: '13px',
  };

  return theme;
};
