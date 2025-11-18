import Banner from '@/components/common/Banner';
import Card from '@/components/common/Card';
import { ShopOrderSummaryData } from '@/lib/api/types';
import useLocale from '@/lib/hooks/useLocale';
import { Currency } from '@/lib/utils/currencies';
import formatPrice from '@/lib/utils/formatPrice';
import { Divider, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl'
interface OrderSummaryCardProps {
  data: ShopOrderSummaryData;
  productCurrency: Currency;
}

const OrderSummaryCard = ({ data, productCurrency }: OrderSummaryCardProps) => {
  const t = useTranslations('shop');
  const { locale } = useLocale();

  return (
    <Card iconName="receipt_long" title={t('orders.orderPage.summary.cardTitle')} border>
      <Stack py={2} px={3}>
        <Stack gap={1}>
          <Stack gap={0.5}>
            <Stack gap={1} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="warning">
                {t('orders.orderPage.summary.productsTotal')}
              </Typography>
              <Typography fontSize={17} fontWeight={600} whiteSpace="nowrap">
                {formatPrice(data.productCost, productCurrency, locale)}
              </Typography>
            </Stack>
          </Stack>
          <Divider flexItem />
          {data.customsCharges?.map((charge) => (
            <Stack
              gap={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              key={charge.label}
            >
              <Typography variant="warning">
                {t(`orders.orderPage.summary.customsChargesLabels.${charge.label}`)}
              </Typography>
              <Typography fontSize={17} fontWeight={600} lineHeight="normal" whiteSpace="nowrap">
                {formatPrice(charge.price, data.currency, locale)}
              </Typography>
            </Stack>
          ))}
          {data.codServiceFee && (
            <Stack gap={1} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="warning" whiteSpace="nowrap">
                {t('orders.orderPage.summary.codServiceFee')}
              </Typography>
              <Typography fontSize={17} fontWeight={600} whiteSpace="nowrap">
                {formatPrice(data.codServiceFee, data.currency, locale)}
              </Typography>
            </Stack>
          )}
          <Stack gap={1} direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="warning" whiteSpace="nowrap">
              {t('orders.orderPage.summary.shipping-handling')}
            </Typography>
            <Typography fontSize={17} fontWeight={600} whiteSpace="nowrap">
              {formatPrice(data.shipmentCost, data.currency, locale)}
            </Typography>
          </Stack>
          {/* TODO: Need to change this to promotionDiscount */}
          {Boolean((data as any).discount) && (
            <>
              <Divider flexItem />
              <Stack gap={1} direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="warning" fontWeight={600}>
                  {t('orders.orderPage.summary.total')}
                </Typography>
                <Typography fontSize={17} fontWeight={600}>
                  {formatPrice(data.total, data.currency, locale)}
                </Typography>
              </Stack>
              <Banner variant="success" horizontal noIcon sx={{ mx: -1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack gap={1} direction="row" alignItems="center">
                    <Typography fontSize={15} fontWeight={600} color="success">
                      {t(`orders.orderPage.summary.discount`)}
                    </Typography>
                  </Stack>
                  <Typography fontSize={17} fontWeight={600}>
                    {`- ${formatPrice((data as any).discount, data.currency, locale)}`}
                  </Typography>
                </Stack>
              </Banner>
            </>
          )}
        </Stack>
      </Stack>
      <Divider flexItem />
      <Stack direction="row" alignItems="center" justifyContent="space-between" py={2} px={3}>
        <Typography fontSize={15} fontWeight={700} lineHeight={1}>
          {t('orders.orderPage.summary.totalDue')}
        </Typography>
        <Typography fontSize={18} fontWeight={700} lineHeight={1}>
          {formatPrice(data.totalDue, data.currency, locale)}
        </Typography>
      </Stack>
    </Card>
  );
};

export default OrderSummaryCard;
