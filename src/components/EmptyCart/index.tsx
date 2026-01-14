'use client';

import Icon from '@/components/Icon';
import Button from '@/components/common/Button';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import useStyles from './styles';

interface EmptyCartProps {
  onStartShopping?: () => void;
}

const EmptyCart = ({ onStartShopping }: EmptyCartProps) => {
  const styles = useStyles();
  const router = useRouter();

  const handleStartShopping = () => {
    if (onStartShopping) {
      onStartShopping();
    } else {
      router.push('/');
    }
  };

  return (
    <Stack sx={styles.container}>
      <Stack sx={styles.iconWrapper}>
        <Icon name="shopping_bag" fontSize={80} color="primary" />
      </Stack>

      <Stack sx={styles.textWrapper}>
        <Typography sx={styles.title}>
          Sepetiniz Boş
        </Typography>
        <Typography sx={styles.description}>
          Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın ve size özel fırsatları keşfedin!
        </Typography>
      </Stack>

      <Button
        variant="contained"
        size="large"
        onClick={handleStartShopping}
        sx={styles.button}
      >
        Alışverişe Başla
      </Button>

      <Stack sx={styles.features}>
        <Stack sx={styles.feature}>
          <Stack sx={styles.featureIconWrapper}>
            <Icon name="local_shipping" fontSize={22} color="success" />
          </Stack>
          <Typography sx={styles.featureText}>750 TL üzeri<br />ücretsiz kargo</Typography>
        </Stack>
        <Stack sx={styles.feature}>
          <Stack sx={styles.featureIconWrapper}>
            <Icon name="autorenew" fontSize={22} color="success" />
          </Stack>
          <Typography sx={styles.featureText}>14 gün<br />kolay iade</Typography>
        </Stack>
        <Stack sx={styles.feature}>
          <Stack sx={styles.featureIconWrapper}>
            <Icon name="verified_user" fontSize={22} color="success" />
          </Stack>
          <Typography sx={styles.featureText}>Güvenli<br />ödeme</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EmptyCart;
