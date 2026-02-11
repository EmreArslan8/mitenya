const styles = {
  container: (reverseColsOnMobile: boolean) => ({
    width: '100%',
    flexDirection: { xs: reverseColsOnMobile ? 'column-reverse' : 'column', sm: 'row' },
    gap: { xs: 2, md: 3 },
  }),
  primaryColumn: {
    width: '100%',
    gap: { xs: 2, md: 3 },
  },
  secondaryColumn: {
    width: { xs: '100%', md: 340 },
    minWidth: { md: 400 },
    maxWidth: { sm: 340 },
    gap: { xs: 2, md: 3 },
  },
};

export default styles;
