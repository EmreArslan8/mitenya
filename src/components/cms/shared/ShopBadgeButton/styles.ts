import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  cardContainer: {
    borderRadius: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  label: {
    fontSize: { xs: '10px', sm: '14px' },
    lineHeight: 1,
    color: palette.text.medium,
    textAlign: 'center',
  },
}));

export default useStyles;
