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

const OrderStatusCard = ({
  status,
  trackingNumber,
  orderId,
}: {
  status: ShopOrderStatus;
  trackingNumber?: string;
  orderId: string;
}) => {
  const t = useTranslations('shop');

  return (
    <Banner {...bannerProps[status]} title={t(`orders.statuses.${status}.label`)} sx={{ p: 1.5 }}>
      <Stack gap={1.5} alignItems="start">
        <Typography variant="warningSemibold">{t('orders.orderId')}: {orderId}</Typography>
        <Typography variant="warningSemibold">
          {t(`orders.statuses.${status}.description`)}
        </Typography>
        {status === 'cancelled' && <SupportButton size="small" />}
        {status === 'shipped' && trackingNumber && (
          <>
          <Typography variant="warningSemibold">{t('orders.trackingNumber')}: {trackingNumber}</Typography>
            <Button
              size="small"
              color='neutral'
              variant="outlined"
              href={`https://my.fargo.uz/track?id=${trackingNumber}`}
              target="_blank"
              endIcon={<Icon name="open_in_new" fontSize={20} />}
            >
              {t('orders.orderPage.trackShipmentButton')}
            </Button>
          </>
        )}
      </Stack>
    </Banner>
  );
};

export default OrderStatusCard;
