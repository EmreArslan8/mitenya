import { BadgeCheck, Undo2 } from '@/components/icons';
import { Truck } from 'lucide-react';
import { Stack, Typography } from '@mui/material';
import useStyles from './styles';

/*
 * Sepetin üstündeki güven şeridi.
 *
 * Buradaki üç madde sitede zaten verdiğimiz sözler — yenisini eklemiyoruz:
 *   orijinallik   → ProductFeatures'taki "%100 ORİJİNAL ÜRÜN"
 *   kargo         → ProductInfoSlot'taki "Saat 15:00'e kadar aynı gün kargoda"
 *   iade          → ProductInfoSlot'taki "14 gün içinde kolay iade ve değişim"
 * Metni değiştirirken iade politikası sayfasıyla tutarlı kalmalı.
 */

const ITEMS = [
  {
    Icon: BadgeCheck,
    text: '%100 Orijinal Ürün Garantisi',
  },
  {
    Icon: Truck,
    text: "15:00'e Kadar Siparişte Aynı Gün Kargo",
  },
  {
    Icon: Undo2,
    text: '14 Gün İçinde Koşulsuz İade',
  },
];

const CartTrustBar = () => {
  const styles = useStyles();

  return (
    <Stack sx={styles.bleed}>
      <Stack sx={styles.inner}>
        {ITEMS.map(({ Icon, text }) => (
          <Stack key={text} sx={styles.item}>
            <Icon size={16} />
            <Typography component="span" sx={styles.text}>
              {text}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default CartTrustBar;
