'use client';

import { ShopProductData } from '@/lib/api/types';
import useStyles from './styles';
import { Divider, Stack, Typography } from '@mui/material';
import formatPrice from '@/lib/utils/formatPrice';

const OrderProductsCard = ({ data }: { data: ShopProductData[] }) => {
  const styles = useStyles();

  return (
    <Stack sx={styles.wrapper}>
      {/* Header */}
      <Stack sx={styles.header}>
        <Typography sx={styles.headerLabel}>Ürünler</Typography>
        <Typography sx={styles.headerCount}>({data.length})</Typography>
      </Stack>

      {/* Products */}
      <Stack sx={styles.cardBody}>
        {data.map((e, i) => (
          <Stack key={e.id ?? JSON.stringify(e)}>
            <Stack sx={styles.productRow}>
              {/* Image */}
              <Stack sx={styles.imageContainer}>
                <img
                  src={e.imgSrc}
                  alt={e.name}
                  style={styles.image}
                />
              </Stack>

              {/* Details */}
              <Stack sx={styles.details}>
                <Typography sx={styles.productName}>
                  {e.brand && (
                    <Typography
                      component="span"
                      sx={{ fontWeight: 700, fontSize: 'inherit', color: 'inherit' }}
                    >
                      {e.brand}{' '}
                    </Typography>
                  )}
                  {e.name}
                </Typography>

                {e.variants && (
                  <Typography sx={styles.variantText}>
                    {e.variants
                      .flatMap((v) =>
                        v.options.filter((o) => o.selected).map((o) => o.value)
                      )
                      .join(' / ')}
                  </Typography>
                )}

                <Typography sx={styles.variantText}>
                  Adet: {e.quantity}
                </Typography>
              </Stack>

              {/* Price */}
              <Stack sx={styles.priceSection}>
                <Typography sx={styles.price}>
                  {formatPrice(e.price.currentPrice * e.quantity, e.price.currency)}
                </Typography>
                {e.quantity > 1 && (
                  <Typography sx={styles.quantity}>
                    {formatPrice(e.price.currentPrice, e.price.currency)} / adet
                  </Typography>
                )}
              </Stack>
            </Stack>

            {i < data.length - 1 && <Divider sx={styles.divider} />}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default OrderProductsCard;
