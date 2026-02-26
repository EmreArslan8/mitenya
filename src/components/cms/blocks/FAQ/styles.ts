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
  items: {
    width: '100%',
    borderTop: '1px solid',
    borderColor: 'gray.200',
  },
  accordion: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderBottom: '1px solid',
    borderColor: 'gray.200',
    '&:before': { display: 'none' },
    boxShadow: 'none',
  },
  summary: {
    px: 0,
    py: { xs: 1.75, sm: 2.25 },
    minHeight: 'unset',
    '&.Mui-expanded': {
      minHeight: 'unset',
    },
    '& .MuiAccordionSummary-content': {
      my: 0,
      mr: 1,
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      color: 'text.main',
    },
  },
  title: {
    pr: 2,
    fontWeight: 600,
    lineHeight: 1.35,
  },
  details: {
    px: 0,
    pt: 0,
    pb: { xs: 2, sm: 2.5 },
  },
};

export default styles;
