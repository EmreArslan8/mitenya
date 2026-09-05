'use client';

import Button from '@/components/common/Button';
import ModalCard from '@/components/common/ModalCard';
import { Check } from '@/components/icons';
import { ShopProductData } from '@/lib/api/types';
import { Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import useStyles from './styles';

interface AddedToCartModalProps {
  open: boolean;
  onClose: () => void;
  /** Sepete eklenen ürün; seçili varyantlarıyla birlikte. */
  product?: ShopProductData;
}

const AddedToCartModal = ({ open, onClose, product }: AddedToCartModalProps) => {
  const styles = useStyles();
  const router = useRouter();

  if (!product) return null;

  /** "Renk: Kırmızı" gibi seçili varyant satırları. */
  const selectedVariants =
    product.variants
      ?.map((variant) => {
        const option = variant.options.find((o) => o.selected);
        return option ? { name: variant.name, value: option.value } : null;
      })
      .filter((v): v is { name: string; value: string } => v !== null) ?? [];

  const goToCart = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <ModalCard
      open={open}
      onClose={onClose}
      showCloseIcon
      CardProps={{ sx: styles.card }}
    >
      <Stack sx={styles.body}>
        <Stack sx={styles.imageWrapper}>
          <img src={product.imgSrc} alt={product.name} style={styles.image} />
        </Stack>

        <Stack sx={styles.details}>
          <Stack sx={styles.successRow}>
            <Stack sx={styles.successIcon}>
              <Check size={12} strokeWidth={2.5} />
            </Stack>
            <Typography sx={styles.successText}>Ürün sepete eklendi.</Typography>
          </Stack>

          <Stack sx={styles.infoBlock}>
            {product.brand && <Typography sx={styles.brand}>{product.brand}</Typography>}
            <Typography sx={styles.name}>{product.name}</Typography>

            {!!selectedVariants.length && (
              <Stack sx={styles.variants}>
                {selectedVariants.map(({ name, value }) => (
                  <Typography key={name} sx={styles.variantLine}>
                    {name}: {value}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>

          <Button variant="contained" onClick={goToCart} sx={styles.cta}>
            Sepete Git
          </Button>
        </Stack>
      </Stack>
    </ModalCard>
  );
};

export default AddedToCartModal;
