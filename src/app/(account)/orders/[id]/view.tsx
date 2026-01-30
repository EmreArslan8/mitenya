'use client';

import AddressCard from '@/components/AddressCard';
import Button from '@/components/common/Button';
import ModalCard from '@/components/common/ModalCard';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import OrderProductsCard from '@/components/orders/OrderProductsCard';
import OrderStatusCard from '@/components/orders/OrderStatusCard';
import OrderSummaryCard from '@/components/orders/OrderSummaryCard';
import { ShopOrderData } from '@/lib/api/types';
import { Stack, TextField, Typography } from '@mui/material';
import { ReceiptTurkishLira } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const OrderDetailsPageView = ({ data }: { data: ShopOrderData }) => {

  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [status, setStatus] = useState(data.status);

  const canCancel = useMemo(
    () => status === 'processing' || status === 'preparing',
    [status]
  );

  const handleCancel = async () => {
    setCanceling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${data.orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Siparis iptal edilemedi');
      }
      setStatus('cancelled');
      setCancelOpen(false);
    } catch (err: any) {
      setCancelError(err.message || 'Siparis iptal edilemedi');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Stack gap={1} width="100%">
      <Button
        size="small"
        color="tertiary"
        arrow="start"
        onClick={() => router.push('/orders')}
        sx={{ alignSelf: 'start', mx: -1 }}
      >
       Geri
      </Button>
      <TwoColumnLayout>
        <PrimaryColumn>
          <OrderStatusCard
            status={status}
            orderId={data.orderId}
            trackingNumber={data.trackingNumber}
          />
          <OrderProductsCard data={data.products} />
        </PrimaryColumn>
        <SecondaryColumn>
          <OrderSummaryCard
            data={data.paymentSummary}
            productCurrency="TRY"
          />
          {canCancel && (
            <Button
              size="small"
              color="neutral"
              variant="outlined"
              onClick={() => setCancelOpen(true)}
            >
              Siparisi Iptal Et
            </Button>
          )}
          {data.invoiceUrl && (
            <Button
              size="small"
              color="neutral"
              variant="tonal"
              href={data.invoiceUrl}
              startIcon={<ReceiptTurkishLira />}
            >
          Faturayı Gör
            </Button>
          )}
          <AddressCard hideDelete hideEdit data={data.address} />
        </SecondaryColumn>
      </TwoColumnLayout>

      <ModalCard open={cancelOpen} onClose={() => setCancelOpen(false)} title="Siparişi iptal et">
        <Stack gap={2}>
          <Typography color="text.secondary">
            Bu işlem geri alınamaz. Yalnızca hazırlık aşamasındaki siparişler iptal edilebilir.
          </Typography>
          <TextField
            label="İptal nedeni (opsiyonel)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            size="small"
          />
          {cancelError && (
            <Typography color="error.main" fontSize={14}>
              {cancelError}
            </Typography>
          )}
          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button variant="outlined" color="primary" onClick={() => setCancelOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="contained" color="primary" onClick={handleCancel} disabled={canceling}>
              {canceling ? 'İptal ediliyor...' : 'İptal Et'}
            </Button>
          </Stack>
        </Stack>
      </ModalCard>
    </Stack>
  );
};

export default OrderDetailsPageView;
