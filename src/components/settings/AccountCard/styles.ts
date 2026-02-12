const styles = {
  wrapper: {
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'gray.100',
    bgcolor: 'white.main',
    boxShadow: 'none',
    overflow: 'hidden',
  },
  header: {
    px: { xs: 2.5, sm: 3 },
    py: 2.25,
    borderBottom: '1px solid',
    borderColor: 'gray.100',
    bgcolor: 'white.main',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 16,
    color: 'text.main',
  },
  actionsButton: {
    borderRadius: '10px',
    textTransform: 'none',
    fontSize: 13,
    px: 1.25,
  },
  cardBody: {
    py: 3.25,
    px: { xs: 2.5, sm: 3 },
    gap: 3,
  },
  column: {
    p: 0,
    gap: 2,
    bgcolor: 'transparent',
    height: '100%',
  },
  sectionTitle: {
    color: 'text.main',
    fontSize: 18,
    mb: 1.75,
  },
  fieldStack: {
    gap: 1,
  },
  fieldTitle: {
    fontSize: 14,
    color: 'text.main',
  },
  fieldLabel: {
    fontSize: 14,
    color: 'text.main',
    mb: 1.5,
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '11px',
      bgcolor: 'white.main',
      minHeight: 52,
      '& fieldset': {
        borderColor: 'gray.200',
      },
      '& .MuiOutlinedInput-input': {
        py: 1.5,
        px: 1.75,
      },
    },
  },
  select: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: '11px',
      bgcolor: 'white.main',
      minHeight: 52,
      '& fieldset': { borderColor: 'gray.200' },
      '& .MuiSelect-select': {
        py: 1.5,
        px: 1.75,
      },
    },
  },
  checkboxLabel: {
    fontSize: 14,
    color: 'text.main',
  },
  passwordHint: {
    fontSize: 13,
    color: 'text.medium',
    lineHeight: 1.5,
  },
  twoFactorBox: {
    mt: 0.5,
    p: 2,
    borderRadius: '11px',
    bgcolor: 'bg.light',
  },
  twoFactorTitle: {
    fontSize: 16,
    color: 'text.main',
  },
  twoFactorDesc: {
    mt: 0.75,
    fontSize: 13,
    color: 'text.medium',
    lineHeight: 1.5,
  },
  primaryButton: {
    mt: 0.5,
    borderRadius: '11px',
    textTransform: 'none',
    fontSize: 14,
    height: 44,
    '&.Mui-disabled': {
      bgcolor: 'gray.100',
      color: 'text.medium',
      borderColor: 'gray.100',
    },
  },
  secondaryButton: {
    borderRadius: '11px',
    textTransform: 'none',
    fontSize: 14,
    height: 44,
    '&.Mui-disabled': {
      bgcolor: 'gray.100',
      color: 'text.medium',
      borderColor: 'gray.100',
    },
  },
  errorText: {
    color: 'error.main',
    fontSize: 13,
  },
  successText: {
    color: 'success.main',
    fontSize: 13,
  },
  rightColumn: {
    borderLeft: { xs: 'none', md: '1px solid' },
    borderColor: { xs: 'transparent', md: 'gray.100' },
    pl: { xs: 0, md: 3 },
  },
  logoutButton: {
    borderRadius: '10px',
    textTransform: 'none',
    fontSize: 13,
  },
};

export default styles;
