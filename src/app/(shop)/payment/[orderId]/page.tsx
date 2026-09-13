'use client';

import Card from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Typography } from '@/components/ui/Typography';
import PayTRPortal from '@/components/payment/PayTRPortal';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import { CreditCard, LockKeyhole } from '@/components/icons';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface CheckoutSessionData {
  id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  currency: string;
  order_id?: string | null;
  order_number?: string | null;
}

const PaymentPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutSessionId = params?.orderId as string;
  const successToken = searchParams?.get('t');
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paytrToken, setPaytrToken] = useState('');
  const [portalOpen, setPortalOpen] = useState(false);
  const currencyLabel = getDisplayCurrencyCode(checkoutSession?.currency ?? 'TRY');
  const successUrl = successToken ? `/success?t=${encodeURIComponent(successToken)}` : '/success';
  const trustedCards = ['visa', 'mastercard', 'troy'];
  const isAlreadyCompleted = checkoutSession?.status === 'completed';

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      try {
        const tokenParam = successToken ? `?t=${encodeURIComponent(successToken)}` : '';
        const res = await fetch(`/api/checkout/session/${checkoutSessionId}${tokenParam}`);
        if (res.ok) {
          const data = await res.json();
          setCheckoutSession(data.session);
        }
      } catch (error) {
        console.error('Checkout session fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (checkoutSessionId) {
      fetchCheckoutSession();
    }
  }, [checkoutSessionId, successToken]);

  const handlePayWithPayTR = async () => {
    if (!checkoutSession) return;
    setProcessingPayment(true);

    try {
      const res = await fetch(
        '/api/paytr/get-token',
        withCsrfHeaders({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutSessionId: checkoutSession.id, successToken: successToken ?? undefined }),
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

  const handleBackToCart = async () => {
    try {
      if (checkoutSession?.id && !isAlreadyCompleted) {
        await fetch(`/api/checkout/session/${checkoutSession.id}/expire`, {
          method: 'POST',
          ...withCsrfHeaders(),
        });
      }
    } catch (error) {
      console.error('Checkout session abandon error:', error);
    } finally {
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!checkoutSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Typography>Ödeme oturumu bulunamadı</Typography>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center bg-[radial-gradient(1200px_420px_at_50%_0%,rgba(221,202,171,0.28),transparent_62%)] px-4 py-6 md:py-12">
        <Card className="w-full max-w-[620px] rounded-3xl p-5 md:p-7">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-[30px] w-[72px] shrink-0 items-center justify-center sm:w-[84px]">
                    <Image
                      src="/static/images/paytr-logo.svg"
                      alt="PayTR"
                      width={84}
                      height={24}
                      style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                      priority
                      unoptimized
                    />
                  </div>
                  <div>
                    <Typography variant="h5" className="font-bold">
                      Güvenli Ödeme
                    </Typography>
                    <Typography variant="progressLabel" className="text-text-secondary">
                      Siparişiniz SSL ile korunur, işlem PayTR altyapısında tamamlanır.
                    </Typography>
                  </div>
              </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-light px-2 py-1.5 text-success">
                  <ShieldCheck size={14} />
                  <Typography variant="caption" as="span" className="font-bold tracking-normal">
                    3D Secure
                  </Typography>
                </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-bg p-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between gap-3">
                  <Typography className="text-text-secondary">Checkout ID</Typography>
                  <Typography className="font-semibold">{checkoutSession.id.slice(0, 8)}...</Typography>
                </div>
                <div className="flex justify-between gap-3">
                  <Typography className="text-text-secondary">Ödeme Yöntemi</Typography>
                  <Typography className="font-semibold">PayTR</Typography>
                </div>
                <Divider />
                <div className="flex items-center justify-between gap-3">
                  <Typography className="font-bold">Toplam Ödeme</Typography>
                  <Typography variant="h5" className="font-extrabold text-primary">
                    {checkoutSession.total_amount} {currencyLabel}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-2 px-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-1.5">
                <LockKeyhole size={16} />
                <Typography variant="progressLabel" className="text-text-secondary">
                  Kart bilgileriniz tarafımızda tutulmaz.
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="caption" className="mr-0.5 text-text-secondary">
                  Desteklenen Kartlar
                </Typography>
                {trustedCards.map((card) => (
                  <div key={card} className="flex h-7 w-[42px] items-center justify-center rounded border border-gray-100 bg-white">
                    <Image
                      src={`/static/images/${card}.svg`}
                      alt={card}
                      width={28}
                      height={20}
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            <div className="flex flex-col gap-2.5">
              {!isAlreadyCompleted && (
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

              {isAlreadyCompleted && (
                <Typography variant="progressLabel" align="center" className="py-1.5 font-semibold text-success-dark">
                  Bu checkout için ödeme tamamlanmış durumda.
                </Typography>
              )}

              <Button variant="text" fullWidth onClick={handleBackToCart} disabled={processingPayment}>
                Sepete Dön
              </Button>
            </div>
          </div>
        </Card>
      </div>

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
