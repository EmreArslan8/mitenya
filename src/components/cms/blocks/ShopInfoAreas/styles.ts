const styles = {
  wrapper: {
    border: '1px solid',
    borderColor: 'rgba(15,23,42,0.06)',
    borderRadius: 1,
    backgroundColor: '#fff',
    py: { xs: 1, md: 1 },
    px: { xs: 0.5, md: 1 },
  },

  mobileContainer: {
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    px: { xs: 0.5, md: 1 },
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

  desktopItem: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    px: { md: 1.5, lg: 2 },
    py: { md: 0.5, lg: 0.75 },
  },

  desktopItemDivider: {
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '16%',
      height: '68%',
      width: '1px',
      backgroundColor: 'rgba(15,23,42,0.12)',
    },
  },
};

export default styles;
