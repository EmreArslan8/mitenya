import { withPalette } from '@/theme/ThemeRegistry';
import { keyframes } from '@mui/system';

export const primaryStyle = withPalette((palette) => ({
  sectionBackground: {
    bg: palette.gray[50],
  },
}));

const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(25px);
  }
  15% {
    opacity: 1;
    transform: translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-25px);
  },
`;

const useStyles = withPalette((palette) => ({
  // Baslik olcegi sarmalayici h2'de duruyor: metin duz de gelse, <p> icinde
  // de gelse miras aliniyor. Onceden yalnizca "& p" hedeflendigi icin CMS'ten
  // gelen duz metin tarayici varsayilaniyla (24px) ciziliyordu.
  heading: {
    m: 0,
    width: '100%',
    fontSize: { xs: 24, sm: 30, md: 34 },
    fontWeight: { xs: 600, md: 500 },
    letterSpacing: { xs: '-0.01em', sm: '-0.02em', md: '-0.025em' },
    lineHeight: 1.15,
    color: palette.gray[900],
  },
  title: {
    color: palette.gray[900],
    width: 'fit-content',
    textAlign: 'center',
    pl: 1
  },
  dynamicTitleSectionContainer: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 'max-content',
    overflow: 'hidden',
    color: palette.primary.main,
    borderColor: palette.primary.main,
    boxSizing: 'content-box',
    mt: 0.5,
  },
  dynamicTitleSectionUnderline: {
    background: palette.primary.main,
    mt: 'auto',
    height: { xs: 3, sm: 4 },
    borderRadius: 2,
    width: '100%',
  },
  dynamicTitleSection: {
    textAlign: { xs: 'center', sm: 'left' },
    position: 'absolute',
    whiteSpace: 'nowrap',
    opacity: 0,
    mb: 0.5,
    fontWeight: '600 !important',
  },
  dynamicTitleSectionActive: {
    animation: `${fadeInOut} 2s ease-in-out`,
  },
  dynamicTitleMarkdownOptions: {
    // Olcek h2'den miras aliniyor; burada yalnizca metin akisi duzeltiliyor.
    p: {
      sx: {
        m: 0,
        fontSize: 'inherit',
        fontWeight: 'inherit',
        letterSpacing: 'inherit',
        lineHeight: 'inherit',
      },
    },
    strong: {
      variant: 'h2',
      color: palette.primary.main,
      sx: { fontWeight: '600 !important' },
    },
  },
}));

export default useStyles;
