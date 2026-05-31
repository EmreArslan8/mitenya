'use client';

import Button from '@/components/common/Button';
import { CrossFade } from '@/components/common/CrossFade';
import useScreen from '@/lib/hooks/useScreen';
import formatPrice from '@/lib/utils/formatPrice';
import { Check } from 'lucide-react';
import { Box, Stack, Typography } from '@mui/material';
import useStyles from '../../styles';

const SplitPrice = ({ value, currency, priceStyle, suffixStyle }: {
  value: number;
  currency: string;
  priceStyle: object;
  suffixStyle: object;
}) => {
  const formatted = formatPrice(value, currency);
  const commaIdx = formatted.indexOf(',');
  if (commaIdx === -1) return <Typography component="span" sx={priceStyle}>{formatted}</Typography>;
  const main = formatted.slice(0, commaIdx + 1);
  const suffix = formatted.slice(commaIdx + 1).trim(); // "00 TL"
  const [decimal, unit] = suffix.split(' ');
  return (
    <Typography component="span" sx={priceStyle}>
      {main}
      <Box component="span" sx={suffixStyle}>
        <span>{decimal}</span>
        <span>{unit}</span>
      </Box>
    </Typography>
  );
};

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
              <SplitPrice
                value={price.originalPrice}
                currency={price.currency}
                priceStyle={styles.stickyOriginalPrice}
                suffixStyle={styles.stickyOriginalPriceSuffix}
              />
            )}
            <SplitPrice
              value={price.currentPrice}
              currency={price.currency}
              priceStyle={styles.stickyCurrentPrice}
              suffixStyle={styles.stickyCurrentPriceSuffix}
            />
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
