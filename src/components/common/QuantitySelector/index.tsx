import { IconButton, Stack, SxProps } from '@mui/material';
import useStyles from './styles';
import { Minus, Plus, Trash } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
  sx?: SxProps;
}

const QuantitySelector = ({ value, onIncrease, onDecrease, max, sx }: QuantitySelectorProps) => {
  const styles = useStyles();

  return (
    <Stack sx={{ ...styles.itemQuantitySelector, ...sx } as SxProps}>
      <IconButton sx={styles.itemQuantityButton} onClick={onDecrease}>
        {value === 1 ? (
          <Trash
            size={20}
            color={styles.decreaseButton(value)}
            strokeWidth={1.5}
          />
        ) : (
          <Minus
            size={20}
            color={styles.decreaseButton(value)}
            strokeWidth={1.5}
          />
        )}
      </IconButton>
      <Stack sx={styles.itemQuantityValue}>{value}</Stack>
      <IconButton
        sx={styles.itemQuantityButton}
        disabled={Boolean(max && value >= max)}
        onClick={!max || value < max ? onIncrease : undefined}
      >
        <Plus fontSize={20} strokeWidth={1} />
      </IconButton>
    </Stack>
  );
};

export default QuantitySelector;
