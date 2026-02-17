'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PayTRPortal from '@/components/payment/PayTRPortal';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const successToken = searchParams?.get('t');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paytrToken, setPaytrToken] = useState('');
  const [portalOpen, setPortalOpen] = useState(false);
  const currencyLabel = getDisplayCurrencyCode(order?.currency ?? 'TRY');
  const successUrl = successToken ? `/success?t=${encodeURIComponent(successToken)}` : '/success';
  const trustedCards = ['visa', 'mastercard', 'troy'];
  const isAlreadyPaid = String(order?.payment_status || '').toLowerCase() === 'paid';

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
        router.push(successUrl);
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
      <Stack
        alignItems="center"
        py={{ xs: 3, md: 6 }}
        px={2}
        sx={{
          background:
            'radial-gradient(1200px 420px at 50% 0%, rgba(221, 202, 171, 0.28), transparent 62%)',
        }}
      >
        <Card sx={{ maxWidth: 620, width: '100%', p: { xs: 2.5, md: 3.5 }, borderRadius: 3 }}>
          <Stack gap={3}>
            <Stack gap={1.25}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: { xs: 72, sm: 84 },
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      src="/static/images/paytr-logo.svg"
                      alt="PayTR"
                      width={84}
                      height={24}
                      style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                      priority
                    />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Güvenli Ödeme
                    </Typography>
                    <Typography color="text.secondary" fontSize={13}>
                      Siparişiniz SSL ile korunur, işlem PayTR altyapısında tamamlanır.
                    </Typography>
                  </Box>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.75}
                  sx={{ px: 1, py: 0.75, bgcolor: 'success.light', borderRadius: 999 }}
                >
                  <ShieldCheck size={14} />
                  <Typography fontSize={12} fontWeight={700}>
                    3D Secure
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                bgcolor: 'background.default',
              }}
            >
              <Stack gap={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Sipariş No</Typography>
                  <Typography fontWeight={600}>{order.order_number}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Ödeme Yöntemi</Typography>
                  <Typography fontWeight={600}>
                    {order.payment_method === 'stripe'
                      ? 'Kredi Kartı'
                      : order.payment_method === 'paytr'
                        ? 'PayTR'
                        : order.payment_method}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700}>Toplam Ödeme</Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {order.total_amount} {currencyLabel}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              gap={1}
              sx={{ px: 1 }}
            >
              <Stack direction="row" alignItems="center" gap={0.75}>
                <LockKeyhole size={16} />
                <Typography fontSize={13} color="text.secondary">
                  Kart bilgileriniz tarafımızda tutulmaz.
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography fontSize={12} color="text.secondary" sx={{ mr: 0.5 }}>
                  Desteklenen Kartlar
                </Typography>
                {trustedCards.map((card) => (
                  <Box
                    key={card}
                    sx={{
                      width: 42,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: 'common.white',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      src={`/static/images/${card}.svg`}
                      alt={card}
                      width={28}
                      height={20}
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Divider />

            <Stack gap={1.25}>
              {order.payment_method === 'paytr' && !isAlreadyPaid && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePayWithPayTR}
                  loading={processingPayment}
                  startIcon={<CreditCard />}
                >
                  PayTR ile Güvenli Öde
                </Button>
              )}

              {isAlreadyPaid && (
                <Typography
                  fontSize={13}
                  fontWeight={600}
                  color="success.dark"
                  textAlign="center"
                  sx={{ py: 0.75 }}
                >
                  Bu siparişin ödemesi alınmış durumda.
                </Typography>
              )}

              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleSimulatePayment}
                  loading={processingPayment}
                  disabled={isAlreadyPaid}
                >
                  [TEST] Ödemeyi Simüle Et
                </Button>
              )}

              <Button
                variant="text"
                fullWidth
                onClick={() => router.push('/cart')}
                disabled={processingPayment}
              >
                Sepete Dön
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      <PayTRPortal
        token={paytrToken}
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        onSuccess={() => {
          setPortalOpen(false);
          router.push(successUrl);
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
