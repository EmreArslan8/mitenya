import { IconButton, Stack, SxProps } from '@mui/material';
import useStyles from './styles';
import Icon from '@/components/Icon';

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
        <Icon
          fontSize={20}
          name={value === 1 ? 'delete' : 'remove'}
          weight={300}
          color={styles.decreaseButton(value)}
        />
      </IconButton>
      <Stack sx={styles.itemQuantityValue}>{value}</Stack>
      <IconButton
        sx={styles.itemQuantityButton}
        disabled={Boolean(max && value >= max)}
        onClick={!max || value < max ? onIncrease : undefined}
      >
        <Icon name="add" fontSize={20} weight={300} />
      </IconButton>
    </Stack>
  );
};

export default QuantitySelector;
