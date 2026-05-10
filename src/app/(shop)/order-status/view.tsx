'use client';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  LogIn,
  PackageCheck,
  PackageSearch,
  Truck,
  UserPlus,
} from 'lucide-react';
import { Box, CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type FormEvent } from 'react';
import styles from './styles';

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
    <Stack sx={styles.page}>
      <Stack sx={styles.container}>
        {loading ? (
          <Card sx={styles.loadingCard}>
            <Stack alignItems="center" gap={1.5}>
              <CircularProgress size={28} />
              <Typography fontWeight={700}>Sipariş bilgisi yükleniyor</Typography>
            </Stack>
          </Card>
        ) : order ? (
          <Stack sx={styles.resultLayout}>
            <Card sx={styles.statusCard}>
              <Stack gap={2.25}>
                <Stack sx={styles.statusHeader}>
                  <Stack direction="row" gap={1.5} alignItems="center" minWidth={0}>
                    <Box sx={styles.statusIconBox(status.bg, status.color)}>
                      <StatusIcon size={24} />
                    </Box>
                    <Stack minWidth={0}>
                      <Typography sx={styles.mutedLabel}>Güncel durum</Typography>
                      <Typography sx={styles.statusTitle(status.color)}>{status.label}</Typography>
                    </Stack>
                  </Stack>
                  <Box sx={styles.orderPill}>#{order.order_number}</Box>
                </Stack>

                <Stack sx={styles.deliveryPanel}>
                  <Stack direction="row" gap={1.25} alignItems="center">
                    <Box sx={styles.deliveryIconBox}>
                      <Clock3 size={18} />
                    </Box>
                    <Stack minWidth={0}>
                      <Typography sx={styles.mutedLabel}>Son güncelleme</Typography>
                      <Typography sx={styles.deliveryTitle}>
                        {order.tracking_number ? 'Kargo takip numarası eklendi' : 'Siparişiniz hazırlanma sürecinde'}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography sx={styles.deliveryText}>
                    Kargo firması ve teslimat detayları üyelik hesabınızda daha kapsamlı görünür.
                  </Typography>
                </Stack>

                {order.status !== 'cancelled' && (
                  <Stack direction="row" alignItems="center" sx={styles.timeline}>
                    {statusSteps.map((step, index) => {
                      const isDone = index <= currentStepIndex;
                      const stepMeta = statusConfig[step];
                      return (
                        <Stack key={step} direction="row" alignItems="center" flex={1} minWidth={0}>
                          <Stack gap={0.75} alignItems="center" flex={1} minWidth={0}>
                            <Box sx={styles.timelineDot(isDone, stepMeta.color)} />
                            <Typography sx={styles.timelineLabel(isDone)}>{stepMeta.label}</Typography>
                          </Stack>
                          {index < statusSteps.length - 1 && (
                            <Box sx={styles.timelineLine(index < currentStepIndex, status.color)} />
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                )}

                {order.items.length > 0 && (
                  <Stack gap={1}>
                    <Typography sx={styles.sectionTitle}>Ürün özeti</Typography>
                    {order.items.map((item) => (
                      <Stack
                        key={`${item.product_name}-${item.quantity}`}
                        sx={styles.productRow}
                        direction="row"
                        gap={1.5}
                        alignItems="center"
                      >
                        <Box sx={styles.productThumb}>
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt="" />
                          ) : (
                            <PackageSearch size={18} />
                          )}
                        </Box>
                        <Typography sx={styles.productName}>{item.product_name}</Typography>
                        <Typography sx={styles.productQuantity}>x{item.quantity}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}

                <Divider />

                <Stack sx={styles.infoGrid}>
                  <Info label="Sipariş Tarihi" value={formatDate(order.created_at)} />
                  <Info label="Toplam" value={formattedTotal} strong />
                </Stack>
              </Stack>
            </Card>

            <Card sx={styles.detailCard}>
              <Stack gap={2}>
                <Stack direction="row" gap={1.25} alignItems="center">
                  <Box sx={styles.lockIconBox}>
                    <LockKeyhole size={20} />
                  </Box>
                  <Typography sx={styles.detailTitle}>Detaylı takip hesabınızda</Typography>
                </Stack>
                <Typography sx={styles.detailDescription}>
                  Teslimat adresi, fatura bilgileri, tüm ürün detayları, iptal/iade işlemleri ve geçmiş siparişleriniz için giriş yapın veya hesap oluşturun.
                </Typography>
                <Stack sx={styles.unlockList}>
                  <Typography>Adres ve fatura bilgileri</Typography>
                  <Typography>İade ve iptal işlemleri</Typography>
                  <Typography>Geçmiş siparişler</Typography>
                </Stack>
                <Stack gap={1}>
                  {isAuthenticated ? (
                    <Button variant="contained" startIcon={<PackageSearch size={18} />} onClick={() => router.push('/orders')}>
                      Siparişlerime Git
                    </Button>
                  ) : (
                    <>
                      <Button variant="contained" startIcon={<LogIn size={18} />} onClick={() => openAuthenticator()}>
                        Giriş Yap
                      </Button>
                      <Button variant="outlined" startIcon={<UserPlus size={18} />} onClick={() => openAuthenticator()}>
                        Hesap Oluştur
                      </Button>
                    </>
                  )}
                  <Button variant="text" onClick={() => router.push('/')}>
                    Alışverişe Devam Et
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        ) : (
          <Card sx={styles.lookupCard}>
            <Stack sx={styles.lookupShell}>
              <Stack sx={styles.lookupIntro}>
                <Stack gap={1}>
                  <Typography variant="h1" sx={styles.title}>
                    Sipariş Takip
                  </Typography>
                  <Typography sx={styles.description}>
                    Sipariş durumunuzu görmek için sipariş numarası ve e-posta adresinizi girin.
                  </Typography>
                </Stack>
              </Stack>

              <Box component="form" onSubmit={handleLookup} sx={styles.formPanel}>
                <Stack gap={2}>
                  <Stack gap={0.25}>
                    <Typography sx={styles.lookupTitle}>Siparişinizi bulun</Typography>
                    <Typography sx={styles.lookupDescription}>
                      Bilgiler yalnızca eşleşirse gösterilir.
                    </Typography>
                  </Stack>

                  <TextField
                    label="Sipariş No"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="E-posta"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                  />

                  {error && <Typography sx={styles.errorText}>{error}</Typography>}

                  <Button
                    type="submit"
                    variant="contained"
                    loading={submitting}
                    disabled={!orderNumber.trim() || !email.trim()}
                    endIcon={<ArrowRight size={18} />}
                  >
                    Siparişi Göster
                  </Button>

                  <Stack sx={styles.accountPrompt}>
                    <Typography sx={styles.accountPromptText}>
                      Daha detaylı takip için giriş yapın veya üye olun.
                    </Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Button variant="text" size="small" onClick={() => openAuthenticator()}>
                        Giriş Yap
                      </Button>
                      <Button variant="text" size="small" onClick={() => openAuthenticator()}>
                        Üye Ol
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Card>
        )}
      </Stack>
    </Stack>
  );
};

const Info = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <Stack
    gap={0.25}
    sx={styles.infoCard}
  >
    <Typography sx={styles.infoLabel}>{label}</Typography>
    <Typography
      sx={styles.infoValue(strong)}
    >
      {value}
    </Typography>
  </Stack>
);

const OrderStatusLookupView = () => (
  <Suspense
    fallback={
      <Stack alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress />
      </Stack>
    }
  >
    <OrderStatusLookupContent />
  </Suspense>
);

export default OrderStatusLookupView;
