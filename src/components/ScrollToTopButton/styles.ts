
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => (show: boolean) => {

  return {
    container: {
      cursor: 'pointer',
      position: 'fixed',
      bottom: show ? { xs: 62, sm: 86 } : -50,
      right: { xs: 16, sm: 24 },
      background: palette.primary.dark,
      borderRadius: 1,
      border: '1px solid',
      borderColor: palette.primary.dark,
      p: '10px',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 10px ${palette.bg.contrastText}20`,
      transition: 'bottom 0.3s',
    },
    iconColor: palette.primary.contrastText,
  };
});

export default useStyles;
