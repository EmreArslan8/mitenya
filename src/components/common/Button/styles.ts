import { Direction } from '@mui/material';

const styles = {
  button: (direction: Direction) => ({
    '.MuiButton-startIcon': {
      marginRight: (direction === 'ltr' ? '8px' : '-8px') + ' !important',
      marginLeft: (direction === 'ltr' ? '-8px' : '8px') + ' !important',
    },
    '.MuiButton-endIcon': {
      marginRight: (direction === 'ltr' ? '-8px' : '8px') + ' !important',
      marginLeft: (direction === 'ltr' ? '8px' : '-8px') + ' !important',
    },
    direction: direction + ' !important',
  }),
};

export default styles;
