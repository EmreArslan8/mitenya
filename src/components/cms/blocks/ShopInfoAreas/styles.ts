const styles = {
  wrapper: {
    border: '1px solid',
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 1,
    backgroundColor: '#fff',
    py: 2,
    px: 2,
  },

  mobileContainer: {
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    px: 2,
    py: 2,

    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
  },

  mobileItem: {
    flex: '0 0 auto',
    scrollSnapAlign: 'start',
    width: { xs: '65%', sm: '40%', md: '85%' },
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

  /* desktop dikey ayraç */
  divider: {
    borderRight: '1px solid rgba(0,0,0,0.08)',
  },
};

export default styles;
