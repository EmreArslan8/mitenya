'use client'; 

import { Grid, Stack, Typography } from '@mui/material';
import { Truck, ShieldCheck, CreditCard } from 'lucide-react'; 
import useStyles from './styles';


const features = [
  { Icon: Truck, label: 'Hızlı & Güvenli Kargo' },
  { Icon: ShieldCheck, label: '%100 Orijinal Ürün' },
  { Icon: CreditCard, label: 'Güvenli Ödeme' },
];

const ProductFeatures = () => {
  const styles = useStyles();
  
  return (
    <Grid container spacing={1}>
      {features.map((item) => (
        <Grid item xs={6} key={item.label}>
          <Stack sx={styles.item}>
            <item.Icon 
              size={28} 
              strokeWidth={1.5} 
            />
            <Typography variant="warningSemibold">{item.label}</Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductFeatures;