import { Direction } from '@mui/material';

const styles = {
  button: (direction: Direction) => ({
    '.MuiButton-startIcon': {
      marginRight: (direction === 'ltr' ? '1px' : '-1px') + ' !important',
      marginLeft: (direction === 'ltr' ? '-1px' : '1px') + ' !important',
    },
    '.MuiButton-endIcon': {
      marginRight: (direction === 'ltr' ? '-1px' : '1px') + ' !important',
      marginLeft: (direction === 'ltr' ? '1px' : '-1px') + ' !important',
    },
    direction: direction + ' !important',
  }),
};

export default styles;
