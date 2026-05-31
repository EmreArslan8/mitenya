'use client'; 

import { Stack, Typography } from '@mui/material';
import { BadgeCheck, Box, Headset, LockKeyhole } from 'lucide-react';
import useStyles from './styles';


const features = [
  { Icon: LockKeyhole, label: 'GÜVENLİ ÖDEME', tone: 'gold' as const },
  { Icon: BadgeCheck, label: '%100 ORİJİNAL ÜRÜN', tone: 'wine' as const },
  { Icon: Box, label: 'STANDART TESLİMAT', tone: 'gold' as const },
  { Icon: Headset, label: '7/24 MÜŞTERİ DESTEĞİ', tone: 'wine' as const },
];

const ProductFeatures = () => {
  const styles = useStyles();
  
  return (
    <Stack sx={styles.container}>
      {features.map((item) => (
        <Stack key={item.label} sx={styles.item}>
          <item.Icon
            size={32}
            strokeWidth={1.75}
            style={item.tone === 'gold' ? styles.iconGold : styles.iconWine}
          />
          <Typography sx={styles.label}>{item.label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default ProductFeatures;
