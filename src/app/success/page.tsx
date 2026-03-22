'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { sendPurchaseEventForOrder } from '@/lib/utils/googleAnalytics';
import { trackPurchase } from '@/lib/analytics/metaPixel';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  total_amount: number;
  subtotal?: number;
  shipping_cost?: number;
  discount_amount?: number;
  currency: string;
  shipping_address: {
    contactName: string;
    line1: string;
    city: string;
  };
  created_at: string;
  items: {
    product_id?: string;
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
  const { selected, removeItems } = useContext(ShopContext);
  const token = searchParams?.get('t');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cartCleanedRef = useRef(false);
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
          if (data?.order) {
            setOrder(data.order);
            setErrorMessage(null);
            setIsProcessing(false);
          } else {
            setOrder(null);
            setErrorMessage(null);
            setIsProcessing(true);
          }
          return;
        }

        if (res.status === 202) {
          setOrder(null);
          setErrorMessage(null);
          setIsProcessing(true);
          return;
        }

        setOrder(null);
        setIsProcessing(false);
        setErrorMessage(res.status === 401 ? 'Lütfen giriş yapın' : 'Sipariş bulunamadı');
      } catch (error) {
        console.error('Order fetch error:', error);
        setOrder(null);
        setIsProcessing(false);
        setErrorMessage('Sipariş bulunamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  useEffect(() => {
    if (!isProcessing || !token) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/success?t=${encodeURIComponent(token)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.order) {
          setOrder(data.order);
          setIsProcessing(false);
          setErrorMessage(null);
          clearInterval(timer);
        }
      } catch {
        // ignore polling errors
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [isProcessing, token]);

  useEffect(() => {
    if (!order || cartCleanedRef.current) return;
    if (!selected?.length) return;
    removeItems(selected);
    cartCleanedRef.current = true;
  }, [order, selected, removeItems]);

  useEffect(() => {
    if (!order || !token) return;

    const dedupeKey = `mitenya_purchase_tracked:${token}`;
    if (window.sessionStorage.getItem(dedupeKey)) return;

    sendPurchaseEventForOrder({
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      currency: order.currency,
      paymentMethod: order.payment_method,
      items: order.items,
    });
    trackPurchase({
      value: order.total_amount,
      currency: order.currency,
      content_ids: order.items.map((i) => String(i.product_id ?? i.product_name)),
      num_items: order.items.reduce((acc, i) => acc + i.quantity, 0),
      order_id: order.order_number,
    });

    window.sessionStorage.setItem(dedupeKey, '1');
  }, [order, token]);

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

  if (!order && isProcessing) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh" px={2}>
        <Card sx={{ maxWidth: 520, width: '100%', p: 3 }}>
          <Stack alignItems="center" gap={2}>
            <CircularProgress size={28} />
            <Typography variant="h6" fontWeight={700} textAlign="center">
              Ödemeniz doğrulanıyor
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Siparişiniz birkaç saniye içinde oluşturulacak. Lütfen bu sayfayı kapatmayın.
            </Typography>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (!order) {
    return (
      <Stack alignItems="center" py={6} px={2}>
        <Card sx={{ maxWidth: 520, width: '100%', p: 3 }}>
          <Stack alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight={700} textAlign="center">
              Sipariş durumu güncelleniyor
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Sayfayı yenileyin ya da birkaç saniye sonra tekrar deneyin.
            </Typography>
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
