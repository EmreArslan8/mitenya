'use client';

import Button from '@/components/common/Button';
import { CrossFade } from '@/components/common/CrossFade';
import useScreen from '@/lib/hooks/useScreen';
import formatPrice from '@/lib/utils/formatPrice';
import { Check } from 'lucide-react';
import { Stack, Typography } from '@mui/material';
import useStyles from '../../styles';

type ProductStickyBarProps = {
  imgSrc?: string;
  name?: string;
  price: { currentPrice: number; originalPrice?: number; currency: string };
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  showCheck: boolean;
  onAddToCart: () => void;
};

const ProductStickyBar = ({
  imgSrc,
  name,
  price,
  visible,
  disabled,
  loading,
  showCheck,
  onAddToCart,
}: ProductStickyBarProps) => {
  const styles = useStyles();
  const { mdUp } = useScreen();

  if (!visible) return null;

  return (
    <Stack sx={styles.stickyBarRoot}>
      <Stack sx={styles.stickyBarInner}>
        {mdUp && (
          <Stack sx={styles.stickyMeta}>
            <img src={imgSrc ?? ''} alt={name ?? 'Urun'} style={styles.stickyThumb} />
            <Stack sx={styles.stickyMetaText}>
              <Typography sx={styles.stickyName}>{name}</Typography>
              <Typography sx={styles.stickyPrice}>{formatPrice(price.currentPrice, price.currency)}</Typography>
            </Stack>
          </Stack>
        )}
        {!mdUp && (
          <Stack sx={styles.stickyPriceBlock}>
            {price.originalPrice && price.originalPrice > price.currentPrice && (
              <Typography sx={styles.stickyOriginalPrice}>
                {formatPrice(price.originalPrice, price.currency)}
              </Typography>
            )}
            <Typography sx={styles.stickyCurrentPrice}>
              {formatPrice(price.currentPrice, price.currency)}
            </Typography>
          </Stack>
        )}
        <Button
          variant="contained"
          loading={loading}
          disabled={disabled}
          onClick={onAddToCart}
          sx={mdUp ? styles.stickyButton : styles.stickyCta}
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
