'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

export const defaultMarginBottom = 12;
export const defaultMaxWidth = 1400;
export const headerHeightPx = { xs: 54, md: 72 };
export const headerHeight = Object.fromEntries(
  Object.entries(headerHeightPx).map(([k, v]) => [k, v / 8])
);

export const firstBlockMarginTop = Object.fromEntries(
  Object.entries(headerHeight).map(([k, v]) => [k, v + defaultMarginBottom])
);

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body: React.CSSProperties;
    bodySmall: React.CSSProperties;
    bodySmallest: React.CSSProperties;
    fineprint: React.CSSProperties;
    navItem: React.CSSProperties;
    buttonBold: React.CSSProperties;
    buttonExtraBold: React.CSSProperties;
    h1Caption: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    body?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
    bodySmallest?: React.CSSProperties;
    fineprint?: React.CSSProperties;
    navItem?: React.CSSProperties;
    buttonBold?: React.CSSProperties;
    buttonExtraBold?: React.CSSProperties;
    h1Caption?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body: true;
    bodySmall: true;
    bodySmallest: true;
    fineprint: true;
    navItem: true;
    buttonBold: true;
    buttonExtraBold: true;
    h1Caption: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
    light: true;
  }
}




declare module "@mui/material/styles" {
  interface Palette {
  customPrimary: {
      100: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
    };
  }
  interface PaletteOptions {
    customPrimary?: {
      100?: string;
      300?: string;
      400?: string;
      500?: string;
      600?: string;
      700?: string;
    };
  }
}


export const palette = {
  customPrimary: {
    main: '#4AC6FF',
    100: '#D9F4FF',
    300: '#8ED9FF',
    400: '#4AC6FF',
    500: '#009EFF',
    600: '#0089E6',
    700: '#006FBF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#A516CC',
    50: '#ECD8F2',
    300: '#D021FF',
    400: '#A516CC',
    500: '#8211A8',
    600: '#590D80',
    700: '#330052',
    800: '#230038',
  },
  tertiary: {
    100: '#FFD9CC',
    300: '#FFC29E',
    400: '#FFA973',
    500: '#FF9750',
  },
  accent: {
    100: '#FFB3C7',
    300: '#FF99B4',
    400: '#FF80A1',
    500: '#FF668E',
  },
  grey: {
    100: '#F6F5F7',
    150: '#EBE8ED',
    200: '#E2DFE6',
    300: '#BAB4BF',
    400: '#87818C',
    500: '#6D6773',
    600: '#5F5966',
    700: '#524B59',
    800: '#463F4D',
    900: '#362F3D',
  },
  neutral: {
    main: '#006FBF',
    dark: '#260F33',
    white: '#FFFFFF',
    white90: '#FFFFFFE6',
    white05: '#FFFFFF0D',
  },
  light: {
    main: '#FFFFFF',
    dark: '#F6F5F7',
    contrastText: '#260F33',
  },
  background: {
    default: 'transparent',
    dark: '#260F33',
  },
  gradient: {
    g1: 'linear-gradient(100.11deg, #C4FFF6 0%, #33C1CD 100%)',
    g1r: 'linear-gradient(261.7deg, #B8FFF4 0%, #29C0CD 100%)',
    g2: 'linear-gradient(96.66deg, #FFD1B5 0%, #FF8CAA 100%)',
    g2r: 'linear-gradient(67.25deg, #FF668E 0%, #FFB88E 100%)',
    g3: 'linear-gradient(96.66deg, #E872D0 0%, #8A32A8 100%)',
    g3r: 'linear-gradient(68.75deg, #8A32A8 0%, #E872D0 99.99%)',
    g4: `linear-gradient(120deg, #D9F4FF, #8ED9FF, #009EFF)`, // Yeni custom gradient 1
    g5: `linear-gradient(120deg, #80C9F1, #006BB3, #004A8D)`, // Daha koyu tonlar
    g6: `radial-gradient(circle at bottom center, #3975ca 20%, #a9c7ff 50%, #d0ddf0 80%),
            linear-gradient(to bottom, #f5f7fa 0%, #e6ecf3 40%, #d0ddf0 70%),
            background: linear-gradient(to bottom, #ffffff 0%, #e6f0ff 40%, #c2d9ff 70%, #a0c0ff 100%);
`,



  },
  error: {
    main: '#e84121',
    light: '#f6b3a6',
    dark: '#8b2714',
    contrastText: '#FFFFFF',
  },
};

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 1000,
    lg: 1200,
    xl: 1920,
  },
};

const theme = createTheme(


  {
    breakpoints,
    palette,
    typography: {
      fontFamily: 'inherit',
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: 'smooth',
            overflowX: 'hidden',
          },
          
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            fontWeight: 700,
            textTransform: 'capitalize',
          },
          sizeLarge: {
            borderRadius: '20px',
            padding: '0 48px',
            fontSize: 22,
            height: 64,
          },
          sizeMedium: {
            borderRadius: '16px',
            padding: '0 32px',
            fontSize: 15,
            height: 44,
          },
          sizeSmall: {
            borderRadius: '12px',
            padding: '0 16px',
            fontSize: 14,
            height: 34,
          },
          text: {
            padding: '0 !important',
            height: 'min-content !important',
            '&:hover': {
              background: 'transparent',
            },
          },
        },
        variants: [
          {
            props: { color: 'primary', variant: 'contained' },
            style: {
              background: palette.neutral.main,
              color: palette.neutral.white, 
              '&:hover': {
                background: palette.customPrimary[600],
              },
              '&:active': {
                background: palette.customPrimary[500],
              },
            },
          },
          {
            props: { color: 'primary', variant: 'outlined' },
            style: {
              borderColor: palette.neutral.main,
              color: palette.neutral.dark,
              '&:hover': {
                borderColor: palette.neutral.dark,
                background: palette.customPrimary[600],
                color: palette.neutral.white,
              },
              '&:active': {
                borderColor: palette.neutral.dark,
                background: palette.customPrimary[500],
                color: palette.neutral.white,
              },
            },
          },
          {
            props: { color: 'primary', variant: 'text' },
            style: {
              color: palette.customPrimary[500],
              '&:hover': {
                background: 'transparent',
              },
            },
          },
          {
            props: { color: 'light', variant: 'contained' },
            style: {
              background: palette.neutral.white90,
              color: palette.neutral.dark,
              backdropFilter: 'blur(5px)',
              '&:hover': {
                background: palette.customPrimary[600],
                color: palette.neutral.white,
              },
              '&:active': {
                background: palette.customPrimary[500],
                color: palette.neutral.white,
              },
            },
          },
          {
            props: { color: 'light', variant: 'outlined' },
            style: {
              color: palette.neutral.white90,
              '&:hover': {
                borderColor: palette.customPrimary[600],
                background: palette.customPrimary[600],
                color: palette.neutral.white,
              },
              '&:active': {
                borderColor: palette.customPrimary[500],
                background: palette.customPrimary[500],
                color: palette.neutral.white,
              },
            },
          },
          {
            props: { color: 'light', variant: 'text' },
            style: {
              color: palette.neutral.white90,
              '&:hover': {
                background: 'transparent',
              },
            },
          },
        ],
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 34,
            height: 34,
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: 15,
            lineHeight: '100%',
            letterSpacing: '0.02em',
            textTransform: 'capitalize',
            borderRadius: 99,
            minWidth: 34,
            minHeight: 34,
            height: 34,
            padding: '0 16px !important',
            transition: 'all 0.2s',
            '&.Mui-selected': {
              background: palette.customPrimary[700],
              color: palette.tertiary[100],
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            '&:before': {
              display: 'none',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 0,
            },
          },
        },
      },
    },
  },
  {} satisfies ThemeOptions
);

theme.typography.h1 = {
  fontWeight: 800,
  fontSize: 32,
  lineHeight: '120%',
  [theme.breakpoints.up('md')]: {
    fontSize: 40,
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: 48,
  },
};

theme.typography.h1Caption = {
  fontWeight: 500,
  fontSize: 18,
  lineHeight: '140%',
};

theme.typography.h2 = {
  fontWeight: 700,
  fontSize: 24,
  lineHeight: '120%',
  [theme.breakpoints.up('md')]: {
    fontSize: 28,
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: 32,
  },
};

theme.typography.h3 = {
  fontWeight: 700,
  fontSize: 20,
  lineHeight: '130%',
  [theme.breakpoints.up('md')]: {
    fontSize: 24,
  },
};

theme.typography.h4 = {
  fontWeight: 700,
  fontSize: 18,
  lineHeight: '130%',
  [theme.breakpoints.up('md')]: {
    fontSize: 20,
  },
};

theme.typography.body = {
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '140%',
};

theme.typography.bodySmall = {
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '140%',
};

theme.typography.bodySmallest = {
  fontWeight: 400,
  fontSize: 13,
  lineHeight: '140%',
};

theme.typography.fineprint = {
  fontWeight: 300,
  fontSize: 12,
  lineHeight: '120%',
};

theme.typography.navItem = {
  fontWeight: 700,
  fontSize: 14,
  lineHeight: '100%',
  textTransform: 'capitalize',
};

theme.typography.buttonBold = {
  fontWeight: 700,
  fontSize: 15,
  lineHeight: '100%',
  letterSpacing: '0.02em',
  textTransform: 'capitalize',
};

theme.typography.buttonExtraBold = {
  fontWeight: 800,
  fontSize: 15,
  lineHeight: '100%',
  letterSpacing: '0.02em',
  textTransform: 'capitalize',
};

export default theme;