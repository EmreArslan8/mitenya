const styles = {
  tabs: {
    maxWidth: '100vw',
    width: '100vw',
    border: 'none',
    '& .MuiTab-root': { padding: 0 },
    '& .MuiTabs-flexContainer': { px: { xs: 2, sm: 0 } },
    '& .MuiTabs-scrollButtons.Mui-disabled': {
      opacity: 0.3,
    },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  tab: {
    textTransform: 'none',
    color: 'primary.main',
    minHeight: 'unset',
  },
  button: {
    position: 'relative',
    top: '50%',
    zIndex: 1,
    p: 0,
    minWidth: 0,
    width: 28,
    height: 28,
    opacity: { xs: 0, sm: 1 },
    m: -1.8,
  },
};

export default styles;
