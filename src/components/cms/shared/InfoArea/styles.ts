const styles = {
  root: {
    width: '100%',
    borderRadius: 0,
    px: { xs: 0.5, md: 0.75 },
    py: { xs: 0.5, md: 0.75 },
    textAlign: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'transform 220ms ease, opacity 220ms ease',
    '@media (hover: hover)': {
      '&:hover': {
        transform: 'translateY(-2px)',
        opacity: 0.92,
      },
    },
  },

  iconFrame: {
    width: { xs: 46, md: 52 },
    height: { xs: 46, md: 52 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  icon: {
    width: '100%',
    height: '100%',
  },

  label: {
    fontSize: { xs: 18, md: 20 },
    fontWeight: 600,
    lineHeight: 1.15,
    color: 'text.primary',
    letterSpacing: '-0.01em',
  },

  textBlock: {
    alignItems: 'center',
    gap: '6px',
  },

  description: {
    color: 'rgba(15, 23, 42, 0.74)',
    fontSize: { xs: 14, md: 15 },
    lineHeight: 1.45,
    maxWidth: 360,
  },
};

export default styles;
