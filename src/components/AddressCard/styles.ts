const styles = {
  card: {
    background: '#fff',
    height: '100%',
    transition: 'box-shadow 0.2s',
  },
  cardActive: {
    // boxShadow: `0px 2px 8px 0px #0000001A,0 0 0 1px ${colorPalette.primary.main}`,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBody: {
    pt: 2,
    px: { xs: 2, sm: 3 },
    pb: 3,
    gap: 2,
    height: '100%',
  },
  item: {
    gap: 0.5,
  },
  modalCard: {
    maxWidth: { sm: 450 },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  accordion: {
    '&::before': { display: 'none' },
    background: 'transparent',
    width: '100%',
  },
  accordionSummary: {
    px: 0,
    minHeight: 0,
    width: 'fit-content',
    mx: 'auto',
    '& .MuiAccordionSummary-content': {
      gap: 2,
      my: 0,
    },
    transition: 'all 0.2s',
  },
  accordionDetails: {
    p: 0,
    pt: 0.5,
    display: 'flex',
    flexDirection: 'column',
    rowGap: 1.5,
  },
};

export default styles;
