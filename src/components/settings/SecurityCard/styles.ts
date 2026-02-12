const styles = {
  wrapper: {
    gap: 2,
    width: '100%',
  },
  sectionHeader: {
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: '12px',
    px: { xs: 2, sm: 2.5 },
    py: { xs: 2, sm: 2.25 },
    bgcolor: 'white.main',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: 'text.main',
  },
  formCard: {
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: '12px',
    overflow: 'hidden',
    bgcolor: 'white.main',
  },
  formBody: {
    px: { xs: 2, sm: 2.5 },
    py: { xs: 2, sm: 2.25 },
    gap: 2,
  },
  fieldStack: {
    maxWidth: 420,
    gap: 0.75,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'text.main',
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      minHeight: 52,
      bgcolor: 'white.main',
      '& fieldset': {
        borderColor: 'gray.200',
      },
    },
    '& .MuiOutlinedInput-input': {
      py: 1.5,
      px: 1.5,
    },
  },
  actionArea: {
    px: { xs: 2, sm: 2.5 },
    py: { xs: 1.5, sm: 1.75 },
    borderTop: '1px solid',
    borderColor: 'gray.200',
    bgcolor: 'bg.light',
  },
  saveButton: {
    width: { xs: '100%', sm: 420 },
    maxWidth: '100%',
    height: 52,
    borderRadius: '8px',
    textTransform: 'none',
    fontSize: 18,
    '&.Mui-disabled': {
      bgcolor: 'gray.100',
      color: 'text.medium',
      borderColor: 'gray.100',
    },
  },
  twoFactorCard: {
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: '12px',
    px: { xs: 2, sm: 2.5 },
    py: { xs: 2, sm: 2.25 },
    bgcolor: 'white.main',
  },
  twoFactorTitle: {
    color: 'tertiary.main',
    fontSize: 34,
    fontWeight: 600,
    lineHeight: 1.2,
  },
  twoFactorDesc: {
    mt: 1,
    color: 'text.medium',
    fontSize: 16,
    lineHeight: 1.55,
    maxWidth: 960,
  },
  errorText: {
    color: 'error.main',
    fontSize: 13,
    mt: 0.5,
  },
  successText: {
    color: 'success.main',
    fontSize: 13,
    mt: 0.5,
  },
};

export default styles;
