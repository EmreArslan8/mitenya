import { withPalette } from '@/theme/ThemeRegistry';
import { keyframes } from '@mui/system';

export const primaryStyle = withPalette((palette) => ({
  sectionBackground: {
    bg: palette.primary.light,
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
  title: {
    color: palette.bg.contrastText,
    width: 'fit-content',
    textAlign: 'center',
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
  },
  dynamicTitleSectionActive: {
    animation: `${fadeInOut} 2s ease-in-out`,
  },
  dynamicTitleMarkdownOptions: {
    p: { variant: 'h2' },
    strong: {
      variant: 'h2',
      color: palette.primary.main,
    },
  },
}));

export default useStyles;
