const styles = {
  wrapper: {
    border: '1px solid',
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 1,
    backgroundColor: '#fff',
    py: { xs: 1, md: 1 },
    px: { xs: 1, md: 2 },
  },

  mobileContainer: {
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    px: {xs: 1, md: 2},
    py: {xs: 1, md: 2},

    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
  },

  mobileItem: {
    flex: '0 0 auto',
    scrollSnapAlign: 'start',
    width: { sm: '40%', md: '85%' },
    maxWidth: 420,
    display: 'flex',
    justifyContent: 'center',
  },

  gridItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    px: 2,
  },
  divider: {
    borderRight: '1px solid rgba(0,0,0,0.08)',
  },
};

export default styles;
