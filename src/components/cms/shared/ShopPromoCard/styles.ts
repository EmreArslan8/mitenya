const styles = {
  card: {
    position: 'relative',
    aspectRatio: '1200 / 723',
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
    px: { xs: 2.5, sm: 3, md: 5 },
    py: { xs: 2.5, sm: 3, md: 5 },
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: { xs: '80%', sm: '60%', md: '70%' },
  },

  title: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: { xs: 28, sm: 26, md: 34 },
    fontWeight: 600,
    lineHeight: 1.1,
    mb: 1,
  },

  description: {
    fontFamily: '"Inter", sans-serif',
    fontSize: { xs: 13, sm: 14, md: 15 },
    lineHeight: 1.5,
    mb: 3,
  },

  cta: {
    fontFamily: '"Inter", sans-serif',
    px: { xs: 1.75, sm: 2.5, md: 3 },
    py: { xs: 0.875, sm: 1.25, md: 1.5 },
    minWidth: 'auto',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: { xs: 13, sm: 15, md: 16 },
    borderRadius: '50px',
  },
};


export default styles;
