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
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
}

const PaymentPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
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

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handlePayWithPayTR = async () => {
    if (!order) return;
    setProcessingPayment(true);

    try {
      const res = await fetch('/api/paytr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id }),
      });

      const data = await res.json();

      if (data.iframe_url) {
        // PayTR iframe URL'ine yönlendir
        window.location.href = data.iframe_url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('PayTR error:', error);
      alert('Odeme baslatilirken hata olustu');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSimulatePayment = async () => {
    // Test için ödeme simülasyonu
    if (!order) return;
    setProcessingPayment(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
      });

      if (res.ok) {
        router.push(`/success/${order.order_number}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
      </Stack>
    );
  }

  if (!order) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography>Siparis bulunamadi</Typography>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" py={4} px={2}>
      <Card sx={{ maxWidth: 500, width: '100%', p: 3 }}>
        {/* Header */}
        <Stack alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="payment" fontSize={30} sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Odeme
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Order Summary */}
        <Stack gap={1.5} mb={3}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Siparis No:</Typography>
            <Typography fontWeight={600}>{order.order_number}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Odeme Yontemi:</Typography>
            <Typography fontWeight={600}>
              {order.payment_method === 'stripe' ? 'Kredi Karti' :
               order.payment_method === 'paytr' ? 'PayTR' : order.payment_method}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={600}>Toplam:</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {order.total_amount} {order.currency}
            </Typography>
          </Stack>
        </Stack>

        {/* Payment Buttons */}
        <Stack gap={2}>
          {order.payment_method === 'paytr' && (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePayWithPayTR}
              loading={processingPayment}
              startIcon={<Icon name="credit_card" />}
            >
              PayTR ile Ode
            </Button>
          )}

          {/* Test/Development - Simulated Payment */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleSimulatePayment}
              loading={processingPayment}
            >
              [TEST] Odemeyi Simule Et
            </Button>
          )}

          <Button
            variant="text"
            fullWidth
            onClick={() => router.push('/cart')}
            disabled={processingPayment}
          >
            Iptal Et
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
};

export default PaymentPage;
