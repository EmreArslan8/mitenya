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
import { ArrowLeft, Ban } from '@/components/icons';
import { ReceiptText } from 'lucide-react';
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
        throw new Error(payload?.error || 'Sipariş iptal edilemedi');
      }
      setStatus('cancelled');
      setCancelOpen(false);
    } catch (err: any) {
      setCancelError(err.message || 'Sipariş iptal edilemedi');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <Stack gap={2} width="100%">
      {/* Back button */}
      <Button
        size="small"
        color="tertiary"
        onClick={() => router.push('/orders')}
        startIcon={<ArrowLeft size={16} />}
        sx={{
          alignSelf: 'start',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 14,
          color: 'text.mediumLight',
          px: 0,
          '&:hover': { color: 'text.main', bgcolor: 'transparent' },
        }}
      >
        Siparişlerim
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

          {/* Action buttons */}
          <Stack gap={1}>
            {canCancel && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<Ban size={14} />}
                onClick={() => setCancelOpen(true)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Siparişi İptal Et
              </Button>
            )}
            {data.invoiceUrl && (
              <Button
                size="small"
                color="neutral"
                variant="tonal"
                href={data.invoiceUrl}
                startIcon={<ReceiptText size={16} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Faturayı Görüntüle
              </Button>
            )}
          </Stack>

          <AddressCard hideDelete hideEdit data={data.address} />
        </SecondaryColumn>
      </TwoColumnLayout>

      {/* Cancel Modal */}
      <ModalCard open={cancelOpen} onClose={() => setCancelOpen(false)} title="Siparişi İptal Et">
        <Stack gap={2.5}>
          <Typography sx={{ color: 'text.mediumLight', fontSize: 14, lineHeight: 1.6 }}>
            Bu işlem geri alınamaz. Yalnızca hazırlık aşamasındaki siparişler iptal edilebilir.
          </Typography>

          <TextField
            label="İptal nedeni (opsiyonel)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
              },
            }}
          />

          {cancelError && (
            <Typography sx={{ color: 'error.main', fontSize: 13, fontWeight: 500 }}>
              {cancelError}
            </Typography>
          )}

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setCancelOpen(false)}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              Vazgeç
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleCancel}
              disabled={canceling}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              {canceling ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
            </Button>
          </Stack>
        </Stack>
      </ModalCard>
    </Stack>
  );
};

export default OrderDetailsPageView;
