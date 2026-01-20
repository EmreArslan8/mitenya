'use client';

import AddressCard from '@/components/AddressCard';
import Button from '@/components/common/Button';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import OrderProductsCard from '@/components/orders/OrderProductsCard';
import OrderStatusCard from '@/components/orders/OrderStatusCard';
import OrderSummaryCard from '@/components/orders/OrderSummaryCard';
import { ShopOrderData } from '@/lib/api/types';
import { Stack } from '@mui/material';
import { ReceiptTurkishLira } from 'lucide-react';
import { useRouter } from 'next/navigation';

const OrderDetailsPageView = ({ data }: { data: ShopOrderData }) => {

  const router = useRouter();

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
            status={data.status}
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
    </Stack>
  );
};

export default OrderDetailsPageView;
