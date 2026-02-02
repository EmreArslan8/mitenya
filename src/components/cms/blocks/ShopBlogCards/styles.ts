const styles = {
  headerTitle: {
    fontSize: { xs: 22, md: 28 },
    fontWeight: 700,
    color: '#1C1C1E',
    lineHeight: 1.2,
  },
  headerAccent: {
    width: 40,
    height: 3,
    borderRadius: 2,
    bgcolor: '#C1121F',
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    color: '#3A3A3C',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#1C1C1E',
    },
  },
};

export default styles;
