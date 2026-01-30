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
};

export default styles;
