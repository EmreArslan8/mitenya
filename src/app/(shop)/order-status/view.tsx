'use client';

import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, LockKeyhole } from '@/components/icons';
import { LogIn, PackageCheck, PackageSearch, Truck, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Spinner } from '@/components/ui/Spinner';
import { TextField } from '@/components/ui/TextField';

type GuestOrder = {
  id: string;
  order_number: string;
  status: 'processing' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  tracking_number?: string | null;
  item_count: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string | null;
  }>;
};

const statusConfig = {
  processing: { label: 'Sipariş alındı', Icon: CheckCircle2, color: '#3A332B', bg: '#F4F1EC' },
  preparing: { label: 'Hazırlanıyor', Icon: PackageSearch, color: '#946200', bg: '#FFF9E6' },
  shipped: { label: 'Kargoda', Icon: Truck, color: '#B45309', bg: '#FFF7ED' },
  delivered: { label: 'Teslim edildi', Icon: PackageCheck, color: '#226B3A', bg: '#E6F4EC' },
  cancelled: { label: 'İptal edildi', Icon: AlertCircle, color: '#8B0D14', bg: '#FDEBEC' },
};

const statusSteps: Array<GuestOrder['status']> = ['processing', 'preparing', 'shipped', 'delivered'];

const formatDate = (value: string) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const OrderStatusLookupContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('t') ?? '';
  const { isAuthenticated, openAuthenticator } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useMemo(() => {
    if (!order) return statusConfig.processing;
    return statusConfig[order.status] ?? statusConfig.processing;
  }, [order]);

  useEffect(() => {
    if (!token) return;

    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/guest?t=${encodeURIComponent(token)}`);
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload?.order) {
          throw new Error(payload?.error || 'Sipariş bulunamadı');
        }
        setOrder(payload.order);
      } catch (err) {
        setOrder(null);
        setError(err instanceof Error ? err.message : 'Sipariş bulunamadı');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [token]);

  const handleLookup = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.order) {
        throw new Error(payload?.error || 'Sipariş bulunamadı');
      }
      setOrder(payload.order);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Sipariş bulunamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedTotal = order
    ? `${order.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${getDisplayCurrencyCode(order.currency)}`
    : '';
  const StatusIcon = status.Icon;
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : 0;

  return (
    <main className="flex min-h-[calc(100vh-88px)] items-start justify-center bg-[#FBFBFA] px-3 py-4 md:min-h-[calc(100vh-112px)] md:px-8 md:py-8">
      <div className="flex w-full max-w-[980px] min-w-0 flex-col gap-4">
        {loading ? (
          <Card className="grid min-h-[280px] place-items-center rounded-[20px] border border-[#E9E5DD] p-8 shadow-[0_22px_60px_rgba(16,24,32,0.06)]">
            <div className="flex flex-col items-center gap-3">
              <Spinner size={28} className="text-primary" />
              <p className="font-bold">Sipariş bilgisi yükleniyor</p>
            </div>
          </Card>
        ) : order ? (
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <Card className="min-w-0 overflow-hidden rounded-[18px] border border-[#E9E5DD] p-3 shadow-[0_24px_70px_rgba(16,24,32,0.08)] md:rounded-3xl md:p-6">
              <div className="flex flex-col gap-[18px]">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-[42px] shrink-0 place-items-center rounded-[14px] md:size-[52px] md:rounded-[18px]" style={{ backgroundColor: status.bg, color: status.color }}>
                      <StatusIcon size={24} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#6B7280]">Güncel durum</p>
                      <p className="[overflow-wrap:anywhere] text-[19px] font-[850] md:text-2xl" style={{ color: status.color }}>{status.label}</p>
                    </div>
                  </div>
                  <span className="max-w-full self-start overflow-hidden text-ellipsis rounded-full bg-[#F2EFE8] px-[13px] py-1.5 text-xs font-extrabold text-[#4B5563] sm:self-center">#{order.order_number}</span>
                </div>

                <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#E1EBDC] bg-[#F8FAF7] p-[10px] md:rounded-[18px] md:p-[14px]">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#E1EBDC] bg-white text-[#333942]">
                      <Clock3 size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#6B7280]">Son güncelleme</p>
                      <p className="text-[15px] font-extrabold text-[#101820]">
                        {order.tracking_number ? 'Kargo takip numarası eklendi' : 'Siparişiniz hazırlanma sürecinde'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] leading-[1.55] text-[#5F6873]">
                    Kargo firması ve teslimat detayları üyelik hesabınızda daha kapsamlı görünür.
                  </p>
                </div>

                {order.status !== 'cancelled' && (
                  <div className="grid grid-cols-4 items-center gap-1 overflow-hidden py-1 md:gap-3 md:py-1.5">
                    {statusSteps.map((step, index) => {
                      const isDone = index <= currentStepIndex;
                      const stepMeta = statusConfig[step];
                      return (
                        <div key={step} className="flex min-w-0 flex-1 items-center">
                          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                            <span className="size-3 rounded-full" style={{ backgroundColor: isDone ? stepMeta.color : '#D9D6D0', boxShadow: isDone ? `0 0 0 5px ${stepMeta.color}1A` : 'none' }} />
                            <span className={isDone ? 'text-center text-[9.5px] font-extrabold leading-[1.15] text-[#111827] sm:whitespace-nowrap sm:text-xs' : 'text-center text-[9.5px] font-semibold leading-[1.15] text-[#777E87] sm:whitespace-nowrap sm:text-xs'}>{stepMeta.label}</span>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <span className="mx-px h-0.5 min-w-0 flex-1 -translate-y-3 sm:mx-1" style={{ backgroundColor: index < currentStepIndex ? status.color : '#E5E0D8' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {order.items.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="font-[850] text-[#101820]">Ürün özeti</p>
                    {order.items.map((item) => (
                      <div
                        key={`${item.product_name}-${item.quantity}`}
                        className="flex min-h-12 min-w-0 items-center gap-3 rounded-[14px] border border-[#EEEAE3] bg-[#FCFBF8] p-1.5"
                      >
                        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-[#F3F2EF] text-[#333942] [&_img]:block [&_img]:size-full [&_img]:object-cover">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt="" />
                          ) : (
                            <PackageSearch size={18} />
                          )}
                        </span>
                        <p className="line-clamp-2 min-w-0 flex-1 [overflow-wrap:anywhere] text-sm leading-[1.35] text-[#4F565F]">{item.product_name}</p>
                        <span className="whitespace-nowrap text-sm font-extrabold text-[#101820]">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Divider />

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 sm:gap-x-6">
                  <Info label="Sipariş Tarihi" value={formatDate(order.created_at)} />
                  <Info label="Toplam" value={formattedTotal} strong />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border border-[#E9E5DD] bg-white p-3.5 text-[#101820] shadow-[0_16px_42px_rgba(16,24,32,0.055)] md:p-[18px]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-[38px] shrink-0 place-items-center rounded-xl border border-[#E9E5DD] bg-[#F5F3EF] text-[#333942]">
                    <LockKeyhole size={20} />
                  </span>
                  <p className="text-base font-[850]">Detaylı takip hesabınızda</p>
                </div>
                <p className="text-sm leading-relaxed text-[#626B75]">
                  Teslimat adresi, fatura bilgileri, tüm ürün detayları, iptal/iade işlemleri ve geçmiş siparişleriniz için giriş yapın veya hesap oluşturun.
                </p>
                <div className="flex flex-col gap-[5px] text-[13px] font-bold text-[#4F565F] [&_p]:before:mr-2 [&_p]:before:font-black [&_p]:before:text-[#8B8377] [&_p]:before:content-['+']">
                  <p>Adres ve fatura bilgileri</p>
                  <p>İade ve iptal işlemleri</p>
                  <p>Geçmiş siparişler</p>
                </div>
                <div className="flex flex-col gap-2">
                  {isAuthenticated ? (
                    <Button variant="contained" startIcon={<PackageSearch size={18} />} onClick={() => router.push('/orders')}>
                      Siparişlerime Git
                    </Button>
                  ) : (
                    <>
                      <Button variant="contained" startIcon={<LogIn size={18} />} onClick={() => openAuthenticator()}>
                        Giriş Yap
                      </Button>
                      <Button variant="outlined" startIcon={<UserPlus size={18} />} onClick={() => openAuthenticator({ type: 'uye-ol' })}>
                        Hesap Oluştur
                      </Button>
                    </>
                  )}
                  <Button variant="text" onClick={() => router.push('/')}>
                    Alışverişe Devam Et
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="rounded-[18px] bg-white p-4 shadow-[0_16px_42px_rgba(16,24,32,0.055)] sm:p-5 md:p-6">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.82fr)] md:gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <h1 className="max-w-[420px] text-[30px] font-[850] leading-[1.08] tracking-normal text-[#101820] sm:text-4xl md:text-[40px]">
                    Sipariş Takip
                  </h1>
                  <p className="max-w-[400px] text-[14.5px] leading-relaxed text-[#5F6670] md:text-[15px]">
                    Sipariş durumunuzu görmek için sipariş numarası ve e-posta adresinizi girin.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLookup} className="w-full bg-transparent p-0 md:rounded-[18px]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-lg font-[850] text-[#101820]">Siparişinizi bulun</p>
                    <p className="text-[13px] leading-[1.55] text-[#667085]">
                      Bilgiler yalnızca eşleşirse gösterilir.
                    </p>
                  </div>

                  <TextField
                    label="Sipariş No"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                  />
                  <TextField
                    label="E-posta"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {error && <p className="text-[13px] font-bold text-error">{error}</p>}

                  <Button
                    type="submit"
                    variant="contained"
                    loading={submitting}
                    disabled={!orderNumber.trim() || !email.trim()}
                    endIcon={<ArrowRight size={18} />}
                  >
                    Siparişi Göster
                  </Button>

                  <div className="mt-0.5 flex flex-col gap-1 border-t border-[#EEEAE3] pt-2.5">
                    <p className="text-[13px] leading-normal text-[#6B7280]">
                      Daha detaylı takip için giriş yapın veya üye olun.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="text" size="small" onClick={() => openAuthenticator()}>
                        Giriş Yap
                      </Button>
                      <Button variant="text" size="small" onClick={() => openAuthenticator({ type: 'uye-ol' })}>
                        Üye Ol
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};

const Info = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex min-w-0 items-baseline gap-1.5">
    <span className="text-[13px] text-[#777E87]">{label}</span>
    <span className={strong ? 'overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold text-[#101820]' : 'overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-[#101820]'}>
      {value}
    </span>
  </div>
);

const OrderStatusLookupView = () => (
  <Suspense
    fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    }
  >
    <OrderStatusLookupContent />
  </Suspense>
);

export default OrderStatusLookupView;
