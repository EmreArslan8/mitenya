'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PayTRPortal from '@/components/payment/PayTRPortal';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { BadgeTurkishLira, CreditCard } from 'lucide-react';
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
  const [paytrToken, setPaytrToken] = useState('');
  const [portalOpen, setPortalOpen] = useState(false);
  const currencyLabel = getDisplayCurrencyCode(order?.currency ?? 'TRY');

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
      const res = await fetch(
        '/api/paytr/get-token',
        withCsrfHeaders({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })
      );

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.token) {
        alert(data?.error || 'PayTR token alınamadı');
        return;
      }

      setPaytrToken(data.token);
      setPortalOpen(true);
    } catch (error) {
      console.error('PayTR error:', error);
      alert('Odeme baslatilirken hata olustu');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!order) return;
    setProcessingPayment(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        ...withCsrfHeaders(),
      });

      if (res.ok) {
        router.push('/success');
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
    <>
      <Stack alignItems="center" py={4} px={2}>
        <Card sx={{ maxWidth: 500, width: '100%', p: 3 }}>
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
              <BadgeTurkishLira size={30} color="primary.main" />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Odeme
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack gap={1.5} mb={3}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Siparis No:</Typography>
              <Typography fontWeight={600}>{order.order_number}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Odeme Yontemi:</Typography>
              <Typography fontWeight={600}>
                {order.payment_method === 'stripe'
                  ? 'Kredi Karti'
                  : order.payment_method === 'paytr'
                    ? 'PayTR'
                    : order.payment_method}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>Toplam:</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {order.total_amount} {currencyLabel}
              </Typography>
            </Stack>
          </Stack>

          <Stack gap={2}>
            {order.payment_method === 'paytr' && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePayWithPayTR}
                loading={processingPayment}
                startIcon={<CreditCard />}
              >
                PayTR ile Ode
              </Button>
            )}

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

      <PayTRPortal
        token={paytrToken}
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        onSuccess={() => {
          setPortalOpen(false);
          router.push('/success');
        }}
        onError={(error) => {
          setPortalOpen(false);
          alert(error || 'Odeme basarisiz oldu');
        }}
      />
    </>
  );
};

export default PaymentPage;
