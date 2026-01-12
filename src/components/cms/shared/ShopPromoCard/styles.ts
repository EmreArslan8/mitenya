import { withPalette } from '@/theme/ThemeRegistry';

const styles = {
  card: {
    position: 'relative',
    height: { xs: 180, sm: 240, md: 300 },
    borderRadius: 2,
    overflow: 'hidden',
  },

  media: {
    position: 'absolute',
    inset: 0,
  },

  image: {
    objectFit: 'cover',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    px: { xs: 3, md: 5 },
    py: { xs: 3, md: 5 },
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: { xs: '80%', sm: '60%', md: '70%' },
  },

  title: {
    fontSize: { xs: 24, sm: 28, md: 32 },
    fontWeight: 700,
    lineHeight: 1.12,
  
    mb: 1.5,
  },

  description: {
    fontSize: { xs: 14, sm: 15 },
    opacity: 0.8,
    lineHeight: 1.5,
    mb: 2,
  },

  cta: {
    px: 0,
    minWidth: 'auto',
    textTransform: 'none',
    fontWeight: 700,
    fontSize: 16,
    color: "black"
},
};


export default styles;
