const styles = {
  wrapper: {
    borderRadius: '12px',
    border: '1px solid',
    borderColor: 'gray.100',
    bgcolor: 'white.main',
    overflow: 'hidden',
  },
  header: {
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    borderBottom: '1px solid',
    borderColor: 'gray.100',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0,
    color: 'text.medium',
  },
  cardBody: {
    py: 2.5,
    px: { xs: 2, sm: 2.5 },
    gap: 2,
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  },
  actions: {
    direction: 'row',
    gap: 1,
    justifyContent: 'flex-end',
    pt: 0.5,
  },
};

export default styles;
