'use client';

import OrderListItemCard from '@/components/orders/OrderListItemCard';
import Button from '@/components/common/Button';
import { PagedResults, ShopOrderListItemData } from '@/lib/api/types';
import { Box, Stack, Typography } from '@mui/material';
import { Package, ShoppingBag } from 'lucide-react';

const OrdersPageView = ({ data }: { data: PagedResults<ShopOrderListItemData> }) => {
  const total = data.totalRecordCount ?? 0;

  return (
    <Stack gap={4} width="100%">
      {/* Header */}
      <Stack gap={1}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, letterSpacing: -0.3 }}
          >
            Siparişlerim
          </Typography>
          {total > 0 && (
            <Box
              sx={{
                bgcolor: 'text.main',
                color: 'white.main',
                fontSize: 11,
                fontWeight: 800,
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                lineHeight: 1.5,
                letterSpacing: 0.5,
              }}
            >
              {total}
            </Box>
          )}
        </Stack>
        <Typography
          sx={{
            color: 'text.mediumLight',
            fontSize: 15,
            fontWeight: 500,
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          Siparişlerinizi takip edin, detaylarını görüntüleyin.
        </Typography>
      </Stack>

      {/* Order List */}
      {total ? (
        <Stack gap={1.5}>
          {data.results.map((e) => (
            <OrderListItemCard data={e} key={e.id} />
          ))}
        </Stack>
      ) : (
        /* Empty State */
        <Stack
          gap={3}
          textAlign="center"
          alignItems="center"
          py={{ xs: 6, sm: 10 }}
          sx={{
            borderRadius: '16px',
            border: (theme) => `1px dashed ${theme.palette.gray[200]}`,
            bgcolor: 'bg.light',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Package size={32} strokeWidth={1.5} color="#8E8E93" />
          </Box>

          <Stack gap={1} alignItems="center">
            <Typography
              sx={{
                fontSize: { xs: 18, sm: 20 },
                fontWeight: 700,
                color: 'text.main',
                letterSpacing: -0.2,
              }}
            >
              Henüz siparişiniz yok
            </Typography>
            <Typography
              sx={{
                color: 'text.mediumLight',
                fontSize: 15,
                fontWeight: 500,
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              Siparişleriniz burada listelenecektir. Hemen alışverişe başlayın!
            </Typography>
          </Stack>

          <Button
            variant="contained"
            href="/"
            startIcon={<ShoppingBag size={18} />}
          >
            Alışverişe Başla
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default OrdersPageView;
