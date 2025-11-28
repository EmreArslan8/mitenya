import Icon from '@/components/Icon';
import { Grid, Stack, Typography } from '@mui/material';
import useStyles from './styles';

const features = [
  { icon: 'local_shipping', label: 'Hızlı & Güvenli Kargo' },
  { icon: 'workspace_premium', label: '%100 Orijinal Ürün' },
  { icon: 'payments', label: 'Güvenli Ödeme' },
];


const ProductFeatures = () => {
  const styles = useStyles();
  return (
    <Grid container spacing={1}>
      {features.map((e) => (
        <Grid item xs={6} key={e.label}>
          <Stack sx={styles.item}>
            <Icon name={e.icon} fontSize={28} />
            <Typography variant="warningSemibold">{e.label}</Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductFeatures;
