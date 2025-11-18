import Icon from '@/components/Icon';
import { Grid, Stack, Typography } from '@mui/material';
import useStyles from './styles';

const features = [
  { icon: 'local_shipping', label: 'shipping' },
  { icon: 'workspace_premium', label: 'genuine' },
  { icon: 'payments', label: 'payments' },
];

const ProductFeatures = () => {
  const styles = useStyles();
  return (
    <Grid container spacing={1}>
      {features.map((e) => (
        <Grid item xs={6} key={e.label}>
          <Stack sx={styles.item}>
            <Icon name={e.icon} fontSize={28} />
            <Typography variant="warningSemibold">{(`shop.features.${e.label}`)}</Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductFeatures;
