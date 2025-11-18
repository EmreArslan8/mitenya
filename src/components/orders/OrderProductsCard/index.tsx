'use client';

import Card from '@/components/common/Card';
import { ShopProductData } from '@/lib/api/types';
import useStyles from './styles';
import { Divider, Stack, Typography } from '@mui/material';



const OrderProductsCard = ({ data }: { data: ShopProductData[] }) => {
  const styles = useStyles();

  return (
    <Card iconName="list" title={('cardTitle')} border>
      <Stack sx={styles.cardBody}>
        {data.map((e, i) => (
          <Stack gap={2} key={JSON.stringify(e)}>
            <Card sx={styles.productCard}>
              <Stack sx={styles.imageContainer}>
                <img src={e.imgSrc} alt={e.name} style={styles.image} />
              </Stack>
              <Stack sx={styles.details}>
                <Stack sx={styles.header}>
                  <Typography variant="warningSemibold" sx={styles.title}>
                    {e.brand} {e.name}
                  </Typography>
                  <Typography sx={styles.variants}>
                    {e.variants
                      ?.flatMap((v) => v.options.filter((o) => o.selected)[0]?.value)
                      .join(', ')}
                  </Typography>
                  <Typography sx={styles.variants}>
                    {"qauntity"}
                  </Typography>
                </Stack>
                <Typography variant="infoValue" whiteSpace="nowrap" sx={styles.price}>
                  {(e.price.currentPrice * e.quantity, e.price.currency)}
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
