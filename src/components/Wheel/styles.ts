const styles = {
  modalCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: { sm: 2 },
  },
  card: {
    background: 'transparent',
    width: 'fit-content',
    '& .MuiDivider-root': {
      border: 'none',
      margin: 0,
    },
  },
  cardBody: {
    overflowY: 'unset',
  },
  resultCard: {
    borderRadius: '16px',
    width: 'fit-content',
    '& .MuiDivider-root': {
      border: 'none',
      margin: 0,
    },
  },
  wheelContainer: {
    padding: 1,
    textAlign: 'center',
    position: 'relative',
    gap: 4,
  },
  wheelOuter: {
    position: 'relative',
    borderRadius: '50%',
    backgroundColor: '#8B0000',
    padding: 1,
    boxShadow: '0 0 20px 5px rgba(255, 87, 34, 0.5), inset 0 0 10px rgba(255, 140, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinButton: {
    backgroundColor: '#FC2647',
    '&:hover': {
      backgroundColor: '#FC2647',
      color: '#ffffff',
    },
  },
  copyIcon: {
    cursor: 'pointer',
    fontSize: '20px',
  },
};

export default styles;
