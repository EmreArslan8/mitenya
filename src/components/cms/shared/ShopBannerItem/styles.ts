import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: { xs: 1, sm: 0 },
    aspectRatio: { xs: '0.8', sm: '2' },
    width: '100%',
    height: 'auto',
    margin: 'auto',
  },
  video: { position: 'absolute', bottom: 0, width: '101%', left: -1, border: 'none' },
}));

export default useStyles;
