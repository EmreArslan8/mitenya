const styles = {
  container: { width: '100%', gap: 2 },
  categories: {
    maxWidth: 'none',
    flex: 1,
    border: 'none',
    '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.2 },
    '& .MuiTabs-indicator': {
      borderRadius: 0,
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      borderBottomWidth: '2px',
    },
  },
  category: {
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&.MuiTab-root': { px: 1, minWidth: 'fit-content' },
    borderRadius: 1,
    textTransform: 'none',
  },
  items: { gap: 2, width: '100%' },
  accordion: {
    borderRadius: '8px',
    py: 1,
    border: 1,
    borderColor: 'transparent',
    '&:before': { display: 'none' },
    transition: 'all 0.2s',
  },
};

export default styles;
