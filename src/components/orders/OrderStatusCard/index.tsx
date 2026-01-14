'use client';

import { ShopOrderStatus } from '@/lib/api/types';
import Banner, { BannerProps } from '../../common/Banner';
import { Stack, Typography } from '@mui/material';
import SupportButton from '../../SupportButtonSimple';
import Button from '../../common/Button';
import Icon from '../../Icon';

const bannerProps: Record<ShopOrderStatus, BannerProps> = {
  processing: {
    variant: 'info',
    IconProps: { name: 'pending' },
  },
  preparing: {
    variant: 'info',
    IconProps: { name: 'deployed_code_account' },
  },
  shipped: {
    variant: 'success',
    IconProps: { name: 'local_shipping' },
  },
  cancelled: {
    variant: 'error',
    IconProps: { name: 'cancel' },
  },
};

const statusLabels: Record<ShopOrderStatus, string> = {
  processing: 'Sipariş Alındı',
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  cancelled: 'İptal Edildi',
};

const statusDescriptions: Record<ShopOrderStatus, string> = {
  processing: 'Siparişiniz alınmıştır ve işleme alınmaktadır.',
  preparing: 'Siparişiniz hazırlanmaktadır. En kısa sürede kargoya verilecektir.',
  shipped: 'Siparişiniz kargoya verilmiştir. Kargo sürecini takip edebilirsiniz.',
  cancelled: 'Siparişiniz iptal edilmiştir. Detaylı bilgi için destek ekibimizle iletişime geçebilirsiniz.',
};

const OrderStatusCard = ({
  status,
  trackingNumber,
  orderId,
}: {
  status: ShopOrderStatus;
  trackingNumber?: string;
  orderId: string;
}) => {
  return (
    <Banner
      {...bannerProps[status]}
      title={statusLabels[status]}
      sx={{ p: 1.5 }}
    >
      <Stack gap={1.5} alignItems="start">
        <Typography variant="warningSemibold">
          Sipariş No: {orderId}
        </Typography>

        <Typography variant="warningSemibold">
          {statusDescriptions[status]}
        </Typography>

        {status === 'cancelled' && <SupportButton size="small" />}

        {status === 'shipped' && trackingNumber && (
          <>
            <Typography variant="warningSemibold">
              Kargo Takip No: {trackingNumber}
            </Typography>

            <Button
              size="small"
              color="neutral"
              variant="outlined"
              href={`https://my.fargo.uz/track?id=${trackingNumber}`}
              target="_blank"
              endIcon={<Icon name="open_in_new" fontSize={20} />}
            >
              Kargoyu Takip Et
            </Button>
          </>
        )}
      </Stack>
    </Banner>
  );
};

export default OrderStatusCard;
