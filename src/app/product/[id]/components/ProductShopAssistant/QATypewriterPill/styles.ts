const styles = {
  root: {
    display: { xs: 'inline-flex', sm: 'none' },
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    mt: '8px',
    pl: 0,
    pr: '12px',
    py: '7px',
    border: 'none',
    borderRadius: '99px',
    background: 'transparent',
    cursor: 'pointer',
  },

  text: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1,
    color: 'text.primary',
    minWidth: '150px',
    textAlign: 'left' as const,
  },

  caret: {
    display: 'inline-block',
    width: '1px',
    height: '11px',
    bgcolor: 'text.primary',
    ml: '2px',
    verticalAlign: 'text-bottom',
    animation: 'qa-caret 0.8s steps(1) infinite',
    '@keyframes qa-caret': {
      '0%, 49%': { opacity: 1 },
      '50%, 100%': { opacity: 0 },
    },
  },

  suffix: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1,
    color: 'text.secondary',
    whiteSpace: 'nowrap' as const,
  },
};

export default styles;
