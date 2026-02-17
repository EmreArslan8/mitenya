'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthenticator } = useAuth();
  const token = searchParams?.get('t');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currencyLabel = getDisplayCurrencyCode(order?.currency ?? 'TRY');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!token) {
          setOrder(null);
          setErrorMessage('Geçersiz başarı linki');
          return;
        }

        const res = await fetch(`/api/orders/success?t=${encodeURIComponent(token)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
          setErrorMessage(null);
          return;
        }

        setOrder(null);
        setErrorMessage(res.status === 401 ? 'Lütfen giriş yapın' : 'Sipariş bulunamadı');
      } catch (error) {
        console.error('Order fetch error:', error);
        setOrder(null);
        setErrorMessage('Sipariş bulunamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
      </Stack>
    );
  }

  if (!order && errorMessage) {
    return (
      <Stack alignItems="center" py={6} px={2}>
        <Card sx={{ maxWidth: 500, width: '100%', p: 3 }}>
          <Stack alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight={700} textAlign="center">
              {errorMessage}
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Sipariş detaylarını görüntülemek için giriş yapmanız gerekebilir.
            </Typography>
            <Button variant="contained" fullWidth onClick={() => openAuthenticator?.()}>
              Giriş Yap
            </Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" py={4} px={2}>
      <Card sx={{ maxWidth: 500, width: '100%', p: 3 }}>
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
            <Check size={40} />
          </Box>
          <Typography variant="h5" fontWeight={700} textAlign="center">
            Siparişiniz Alındı!
          </Typography>
          <Typography color="text.secondary" textAlign="center">
            Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya vereceğiz.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack gap={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Sipariş No:</Typography>
            <Typography fontWeight={600}>{order.order_number}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Durum:</Typography>
            <Typography
              fontWeight={600}
              sx={{
                color: order.status === 'processing' ? 'warning.main' : 'success.main',
              }}
            >
              {order.status === 'processing' ? 'Hazırlanıyor' : order.status}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Toplam:</Typography>
            <Typography fontWeight={700} color="primary.main">
              {order.total_amount} {currencyLabel}
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
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack gap={1.5}>
          <Button variant="contained" fullWidth onClick={() => router.push('/orders')}>
            Siparişlerimi Gör
          </Button>
          <Button variant="outlined" fullWidth onClick={() => router.push('/')}>
            Alışverişe Devam Et
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
};

export default SuccessPage;
