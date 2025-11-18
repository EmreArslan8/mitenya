const styles = {
  inputNoArrows: {
    '& input': {
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '&[type=number]': {
        MozAppearance: 'textfield',
      },
    },
  },
  autocompleteInput: {
    '& .MuiAutocomplete-inputRoot': {
      borderRadius: '8px 0 0 8px',
      '& .MuiAutocomplete-input': {
        pt: '6.5px',
      },
    },
    translate: 1,
  },
};

export default styles;
