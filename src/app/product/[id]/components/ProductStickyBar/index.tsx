'use client';

import Button from '@/components/common/Button';
import { CrossFade } from '@/components/common/CrossFade';
import { ShopProductData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import formatPrice from '@/lib/utils/formatPrice';
import { Check } from 'lucide-react';
import { Stack, Typography } from '@mui/material';
import useStyles from '../../styles';

type ProductStickyBarProps = {
  data: ShopProductData;
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  showCheck: boolean;
  onAddToCart: () => void;
};

const ProductStickyBar = ({
  data,
  visible,
  disabled,
  loading,
  showCheck,
  onAddToCart,
}: ProductStickyBarProps) => {
  const styles = useStyles();
  const { mdUp } = useScreen();

  if (!mdUp || !visible) return null;

  return (
    <Stack sx={styles.stickyBarRoot}>
      <Stack sx={styles.stickyBarInner}>
        <Stack sx={styles.stickyMeta}>
          <img src={data.imgSrc ?? data.images?.[0] ?? ''} alt={data.name ?? 'Urun'} style={styles.stickyThumb} />
          <Stack sx={styles.stickyMetaText}>
            <Typography sx={styles.stickyName}>{data.name}</Typography>
            <Typography sx={styles.stickyPrice}>{formatPrice(data.price.currentPrice, data.price.currency)}</Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          loading={loading}
          disabled={disabled}
          onClick={onAddToCart}
          sx={styles.stickyButton}
        >
          <CrossFade
            components={[
              {
                in: showCheck,
                component: (
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Check />
                    Eklendi
                  </Stack>
                ),
              },
              {
                in: !showCheck,
                component: 'Sepete Ekle',
              },
            ]}
          />
        </Button>
      </Stack>
    </Stack>
  );
};

export default ProductStickyBar;
