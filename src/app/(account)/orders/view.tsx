'use client';

import OrderListItemCard from '@/components/orders/OrderListItemCard';
import Button from '@/components/common/Button';
import { PagedResults, ShopOrderListItemData } from '@/lib/api/types';
import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { Info } from 'lucide-react';

const OrdersPageView = ({ data }: { data: PagedResults<ShopOrderListItemData> }) => {
  const total = data.totalRecordCount ?? 0;

  return (
    <Stack gap={3} width="100%">
      <Stack gap={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h2">Siparişlerim</Typography>
          <Chip
            label={`${total} sipariş`}
            size="small"
            sx={{
              bgcolor: 'text.main',
              color: 'white.main',
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          />
        </Stack>
        <Typography color="text.secondary" maxWidth={560}>
          Teslimat ve ödeme durumlarını buradan takip edin.
        </Typography>
      </Stack>

      <Stack gap={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Son Siparişler</Typography>
          <Typography color="text.secondary" fontSize={14}>
            {total} kayıt
          </Typography>
        </Stack>
        <Divider />

        {total ? (
          <Stack gap={1.5}>
            {data.results.map((e) => (
              <OrderListItemCard data={e} key={e.id} />
            ))}
          </Stack>
        ) : (
          <Stack gap={2.5} textAlign="center" alignItems="center" py={6}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                border: (theme) => `1px dashed ${theme.palette.gray[300]}`,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'bg.light',
              }}
            >
              <Info />
            </Box>
            <Typography variant="h3">Henüz bir siparişiniz yok</Typography>
            <Typography variant="body" color="text.secondary" maxWidth={520}>
              Siparişleriniz burada listelenecektir. Alışverişe başlayarak ilk siparişinizi
              oluşturabilirsiniz.
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
