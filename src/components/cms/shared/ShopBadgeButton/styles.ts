import { withPalette } from '@/theme/ThemeRegistry';
import { brotliDecompress } from 'zlib';

const useStyles = withPalette((palette) => ({
  cardContainer: {
    borderRadius: '50%',
    border: `1px solid`,
    bordorColor: palette.info,
    padding: { xs: '8px', sm: '12px' },
    justifyContent: 'center',
 
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
    width: { xs: '80px', sm: '120px' },
    height: { xs: '80px', sm: '120px' },
    '&:hover': {
      transform: 'scale(1.05)', 
      borderColor: palette.secondary.main,
      boxShadow: `0 4px 12px 0px ${palette.secondary.main}40`, 
      cursor: 'pointer', 
    },
  },
  title: {
    fontSize: { xs: '12px', sm: '16px' }, 
    fontWeight: 600,
    lineHeight: 1.2,
    color: palette.primary.deepDark,
    textAlign: 'center',
  },
  label: {
    fontSize: { xs: '10px', sm: '14px' },
    fontWeight: "500",
    lineHeight: 1,
    color: palette.primary.deepDark, 
    textAlign: 'center',
    marginTop: '8px', 
  },
}));

export default useStyles;