const styles = {
  card: {
    position: 'relative',
    aspectRatio: '5 / 3',
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
    px: { xs: 2.5, sm: 4, md: 5 },
    py: { xs: 2.5, sm: 3.5, md: 5 },
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: { xs: '80%', sm: '60%', md: '70%' },
  },

  title: {
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontSize: { xs: 28, sm: 32, md: 36 },
    fontWeight: 600,
    lineHeight: 1.02,
    letterSpacing: '-0.01em',
    mb: 1.25,
  },

  description: {
    fontFamily: '"Inter", sans-serif',
    fontSize: { xs: 13, sm: 15, md: 16 },
    lineHeight: 1.4,
    maxWidth: 280,
    mb: 2,
  },

  cta: {
    fontFamily: '"Inter", sans-serif',
    px: { xs: 1.25, sm: 2, md: 2.25 },
    py: { xs: 0.75, sm: 1, md: 1 },
    minWidth: 'auto',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: { xs: 13, sm: 15, md: 15 },
    borderRadius: '10px',
    border: '1px solid rgba(75, 61, 90, 0.1)',
    boxShadow: '0 8px 24px rgba(10, 16, 28, 0.08)',
  },
};


export default styles;
