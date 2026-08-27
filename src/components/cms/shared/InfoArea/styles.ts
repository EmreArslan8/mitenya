const styles = {
  root: {
    width: '100%',
    flexDirection: { xs: 'row', md: 'column' },
    alignItems: { xs: 'flex-start', md: 'center' },
    textAlign: { xs: 'left', md: 'center' },
    gap: { xs: 2, md: 1.5 },
    py: 0,
  },

  iconFrame: {
    width: { xs: 44, md: 60 },
    height: { xs: 44, md: 60 },
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
    fontSize: { xs: 15, md: 17 },
    fontWeight: 600,
    color: 'text.primary',
    letterSpacing: '-0.005em',
  },

  textBlock: {
    gap: 0.5,
    maxWidth: { md: 300 },
  },

  description: {
    color: 'text.secondary',
    fontSize: { xs: 13, md: 14 },
    lineHeight: 1.5,
  },
};

export default styles;
