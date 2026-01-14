'use client';

import Card from '@/components/common/Card';
import { ShopProductData } from '@/lib/api/types';
import useStyles from './styles';
import { Divider, Stack, Typography } from '@mui/material';
import formatPrice from '@/lib/utils/formatPrice';

const OrderProductsCard = ({ data }: { data: ShopProductData[] }) => {
  const styles = useStyles();

  return (
    <Card iconName="list" title="Ürünler" border>
      <Stack sx={styles.cardBody}>
        {data.map((e, i) => (
          <Stack gap={2} key={e.id ?? JSON.stringify(e)}>
            <Card sx={styles.productCard}>
              <Stack sx={styles.imageContainer}>
                <img
                  src={e.imgSrc}
                  alt={e.name}
                  style={styles.image}
                />
              </Stack>

              <Stack sx={styles.details}>
                <Stack sx={styles.header}>
                  <Typography variant="warningSemibold" sx={styles.title}>
                    {e.brand} {e.name}
                  </Typography>

                  {e.variants && (
                    <Typography sx={styles.variants}>
                      {e.variants
                        .flatMap((v) =>
                          v.options.filter((o) => o.selected).map((o) => o.value)
                        )
                        .join(', ')}
                    </Typography>
                  )}

                  <Typography sx={styles.variants}>
                    Adet: {e.quantity}
                  </Typography>
                </Stack>

                <Typography
                  variant="infoValue"
                  whiteSpace="nowrap"
                  sx={styles.price}
                >
                  {formatPrice(
                    e.price.currentPrice * e.quantity,
                    e.price.currency
                  )}
                </Typography>
              </Stack>
            </Card>

            {i < data.length - 1 && <Divider />}
          </Stack>
        ))}
      </Stack>
    </Card>
  );
};

export default OrderProductsCard;
