
import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => (show: boolean) => {

  return {
    container: {
      cursor: 'pointer',
      position: 'fixed',
      bottom: show ? { xs: 62, sm: 86 } : -50,
      background: palette.bg.main,
      borderRadius: 99,
      border: '1px solid',
      borderColor: palette.tertiary.light,
      p: '5px',
      boxShadow: `0 0 10px ${palette.bg.contrastText}20`,
      transition: 'bottom 0.3s',
    },
  };
});

export default useStyles;
