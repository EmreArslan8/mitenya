'use client';

import AddressCard from '@/components/AddressCard';
import { Button } from '@/components/ui/Button';
import ModalCard from '@/components/common/ModalCard';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import OrderProductsCard from '@/components/orders/OrderProductsCard';
import OrderStatusCard from '@/components/orders/OrderStatusCard';
import OrderSummaryCard from '@/components/orders/OrderSummaryCard';
import { ShopOrderData } from '@/lib/api/types';
import { ArrowLeft, Ban, ReceiptText } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { TextField } from '@/components/ui/TextField';

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
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Sipariş iptal edilemedi');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Back button */}
      <Button
        size="small"
        color="tertiary"
        onClick={() => router.push('/orders')}
        startIcon={<ArrowLeft size={16} />}
        className="self-start px-0 text-sm font-semibold normal-case text-text-medium-light hover:bg-transparent hover:text-text"
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
          <div className="flex flex-col gap-2">
            {canCancel && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<Ban size={14} />}
                onClick={() => setCancelOpen(true)}
                className="rounded-[10px] text-[13px] font-semibold normal-case"
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
                className="rounded-[10px] text-[13px] font-semibold normal-case"
              >
                Faturayı Görüntüle
              </Button>
            )}
          </div>

          <AddressCard hideDelete hideEdit data={data.address} />
        </SecondaryColumn>
      </TwoColumnLayout>

      {/* Cancel Modal */}
      <ModalCard open={cancelOpen} onClose={() => setCancelOpen(false)} title="Siparişi İptal Et">
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-text-medium-light">
            Bu işlem geri alınamaz. Yalnızca hazırlık aşamasındaki siparişler iptal edilebilir.
          </p>

          <TextField
            label="İptal nedeni (opsiyonel)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            minRows={2}
            className="rounded-[10px]"
          />

          {cancelError && (
            <p className="text-[13px] font-medium text-error">
              {cancelError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setCancelOpen(false)}
              className="rounded-[10px] font-semibold normal-case"
            >
              Vazgeç
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleCancel}
              disabled={canceling}
              className="rounded-[10px] font-semibold normal-case"
            >
              {canceling ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
            </Button>
          </div>
        </div>
      </ModalCard>
    </div>
  );
};

export default OrderDetailsPageView;
