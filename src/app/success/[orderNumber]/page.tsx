'use client';

import Icon from '@/components/Icon';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  shipping_address: {
    contactName: string;
    line1: string;
    city: string;
  };
  created_at: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
    image_url: string;
  }[];
}

const SuccessPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Order fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" py={4} px={2}>
      <Card sx={{ maxWidth: 500, width: '100%', p: 3 }}>
        {/* Success Icon */}
        <Stack alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'success.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check" fontSize={40} sx={{ color: 'success.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} textAlign="center">
            Siparissiniz Alindi!
          </Typography>
          <Typography color="text.secondary" textAlign="center">
            Siparissiniz basariyla olusturuldu. En kisa surede hazirlayip kargoya verecegiz.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Order Info */}
        <Stack gap={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Siparis No:</Typography>
            <Typography fontWeight={600}>{orderNumber}</Typography>
          </Stack>

          {order && (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Durum:</Typography>
                <Typography
                  fontWeight={600}
                  sx={{
                    color: order.status === 'processing' ? 'warning.main' : 'success.main',
                  }}
                >
                  {order.status === 'processing' ? 'Hazirlaniyor' : order.status}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Toplam:</Typography>
                <Typography fontWeight={700} color="primary.main">
                  {order.total_amount} {order.currency}
                </Typography>
              </Stack>

              {order.shipping_address && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Teslimat:</Typography>
                  <Typography textAlign="right" fontSize={14}>
                    {order.shipping_address.contactName}
                    <br />
                    {order.shipping_address.city}
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Stack gap={1.5}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push('/orders')}
          >
            Siparislerimi Gor
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push('/')}
          >
            Alisverise Devam Et
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
};

export default SuccessPage;
