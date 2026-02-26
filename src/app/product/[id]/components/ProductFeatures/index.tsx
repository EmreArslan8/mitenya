'use client'; 

import { Stack, Typography } from '@mui/material';
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
    <Stack sx={styles.container}>
      {features.map((item) => (
        <Stack key={item.label} sx={styles.item}>
          <item.Icon size={30} strokeWidth={1.75} />
          <Typography sx={styles.label}>{item.label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default ProductFeatures;
