'use client';

import OrderListItemCard from '@/components/orders/OrderListItemCard';
import Button from '@/components/common/Button';
import { PagedResults, ShopOrderListItemData } from '@/lib/api/types';
import { Stack, Typography } from '@mui/material';
import { Info } from 'lucide-react';

const OrdersPageView = ({ data }: { data: PagedResults<ShopOrderListItemData> }) => {
  return (
    <Stack gap={2} width="100%">
      <Typography variant="h2">Siparişlerim</Typography>

      <Stack gap={1}>
        {data.totalRecordCount ? (
          data.results.map((e) => <OrderListItemCard data={e} key={e.id} />)
        ) : (
          <Stack gap={2} textAlign="center" alignItems="center">
            <Info />
            <Typography variant="h3">
              Henüz bir siparişiniz yok
            </Typography>

            <Typography variant="body">
              Siparişleriniz burada listelenecektir. Alışverişe başlayarak
              ilk siparişinizi oluşturabilirsiniz.
            </Typography>

            <Button variant="contained" href="/">
              Alışverişe Başla
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default OrdersPageView;
