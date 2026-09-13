'use client';

import Card from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Typography } from '@/components/ui/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { sendPurchaseEventForOrder } from '@/lib/utils/googleAnalytics';
import { onMetaPixelReady, trackPurchase } from '@/lib/analytics/metaPixel';
import { trackTikTokPurchase, trackTikTokWithUser } from '@/lib/analytics/tiktokPixel';
import { Check } from '@/components/icons';
import { PackageSearch } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  guest_tracking_token?: string | null;
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

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customerData, openAuthenticator, isAuthenticated } = useAuth();
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
    const params = {
      value: order.total_amount,
      currency: order.currency,
      content_ids: order.items.map((i) => String(i.product_id ?? i.product_name)),
      contents: order.items.map((i) => ({
        content_id: String(i.product_id ?? i.product_name),
        content_type: 'product' as const,
        content_name: i.product_name,
        num_items: i.quantity,
      })),
      num_items: order.items.reduce((acc, i) => acc + i.quantity, 0),
      order_id: order.order_number,
    };
    const markPurchaseTracked = () => {
      window.sessionStorage.setItem(dedupeKey, '1');
    };
    const cleanupMeta = onMetaPixelReady(() => {
      trackPurchase(
        params,
        `purchase_${order.order_number}`,
      );
      markPurchaseTracked();
    });
    const cleanupTikTok = trackTikTokWithUser({
      userData: {
        email: customerData?.email,
        phone: customerData?.phone,
      },
      onReady: markPurchaseTracked,
      track: () => {
        trackTikTokPurchase(params);
      },
    });

    return () => {
      cleanupMeta();
      cleanupTikTok();
    };
  }, [customerData?.email, customerData?.phone, order, token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!order && errorMessage) {
    return (
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[500px] p-6">
          <div className="flex flex-col items-center gap-4">
            <Typography variant="h6" align="center" className="font-bold">
              {errorMessage}
            </Typography>
            <Typography align="center" className="text-text-secondary">
              Sipariş detaylarını görüntülemek için giriş yapmanız gerekebilir.
            </Typography>
            <Button variant="contained" fullWidth onClick={() => openAuthenticator?.()}>
              Giriş Yap
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!order && isProcessing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-[520px] p-6">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={28} className="text-primary" />
            <Typography variant="h6" align="center" className="font-bold">
              Ödemeniz doğrulanıyor
            </Typography>
            <Typography align="center" className="text-text-secondary">
              Siparişiniz birkaç saniye içinde oluşturulacak. Lütfen bu sayfayı kapatmayın.
            </Typography>
          </div>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[520px] p-6">
          <div className="flex flex-col items-center gap-4">
            <Typography variant="h6" align="center" className="font-bold">
              Sipariş durumu güncelleniyor
            </Typography>
            <Typography align="center" className="text-text-secondary">
              Sayfayı yenileyin ya da birkaç saniye sonra tekrar deneyin.
            </Typography>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[500px] p-6">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-light text-success">
            <Check size={40} />
          </div>
          <Typography variant="h5" align="center" className="font-bold">
            Siparişiniz Alındı!
          </Typography>
          <Typography align="center" className="text-text-secondary">
            Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya vereceğiz.
          </Typography>
        </div>

        <Divider className="my-4" />

        <div className="flex flex-col gap-3">
          <div className="flex justify-between gap-4">
            <Typography className="text-text-secondary">Sipariş No:</Typography>
            <Typography className="font-semibold">{order.order_number}</Typography>
          </div>

          <div className="flex justify-between gap-4">
            <Typography className="text-text-secondary">Durum:</Typography>
            <Typography className={order.status === 'processing' ? 'font-semibold text-warning' : 'font-semibold text-success'}>
              {order.status === 'processing' ? 'Hazırlanıyor' : order.status}
            </Typography>
          </div>

          <div className="flex justify-between gap-4">
            <Typography className="text-text-secondary">Toplam:</Typography>
            <Typography className="font-bold text-primary">
              {order.total_amount} {currencyLabel}
            </Typography>
          </div>

          {order.shipping_address && (
            <div className="flex justify-between gap-4">
              <Typography className="text-text-secondary">Teslimat:</Typography>
              <Typography variant="body2" align="right">
                {order.shipping_address.contactName}
                <br />
                {order.shipping_address.city}
              </Typography>
            </div>
          )}
        </div>

        <Divider className="my-4" />

        <div className="flex flex-col gap-3">
          {order.guest_tracking_token && isAuthenticated === false ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={<PackageSearch size={18} />}
              onClick={() => router.push(`/siparis-takip?t=${encodeURIComponent(order.guest_tracking_token || '')}`)}
            >
              Siparişi Takip Et
            </Button>
          ) : (
            <Button variant="contained" fullWidth onClick={() => router.push('/orders')}>
              Siparişlerimi Gör
            </Button>
          )}
          <Button variant="outlined" fullWidth onClick={() => router.push('/')}>
            Alışverişe Devam Et
          </Button>
        </div>
      </Card>
    </div>
  );
};

const SuccessPageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner className="text-primary" />
  </div>
);

const SuccessPage = () => {
  return (
    <Suspense fallback={<SuccessPageFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
