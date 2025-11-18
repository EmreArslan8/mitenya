import useMockProgress from '@/lib/hooks/useMockProgress';
import { CircularProgress, Stack, SxProps, Typography } from '@mui/material';
import styles from './styles';

interface CircularProgressWithLabelProps {
  sx?: SxProps;
}

const CircularProgressWithLabel = ({ sx }: CircularProgressWithLabelProps) => {
  const { progress } = useMockProgress();
  return (
    <Stack sx={{ position: 'relative', overflow: 'hidden', ...sx }}>
      <Typography sx={styles.label}>{progress.toFixed(0)}%</Typography>
      <CircularProgress variant="determinate" value={progress} />
    </Stack>
  );
};

export default CircularProgressWithLabel;
