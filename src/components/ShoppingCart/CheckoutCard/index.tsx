import Icon from '@/components/Icon';
import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ShopOrderSummaryData } from '@/lib/api/types';
import useLocale from '@/lib/hooks/useLocale';
import formatPrice from '@/lib/utils/formatPrice';
import { CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, ReactNode, useState } from 'react';
import useStyles from './styles';
import Markdown from '@/components/common/Markdown';

const CheckoutCard = ({
  title,
  numSelected,
  orderSummary,
  discountCode: initialDiscountCode,
  onSubmitDiscountCode,
  loading,
  action,
  showLines,
}: {
  title?: ReactNode;
  numSelected: number;
  orderSummary?: Partial<ShopOrderSummaryData>;
  discountCode: string | null;
  onSubmitDiscountCode: (value: string | null) => void;
  loading: boolean;
  action?: ReactNode;
  showLines?: boolean;
}) => {
  const t = useTranslations('shop.cart.page.checkoutCard');
  const { locale } = useLocale();
  const styles = useStyles();
  const [code, setCode] = useState(initialDiscountCode);

  const handleSubmitDiscountCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmitDiscountCode(code);
  };

  const handleClearDiscountCode = () => {
    setCode(null);
    onSubmitDiscountCode(null);
  };

  return (
    <Card
      iconName={title ? 'receipt_long' : undefined}
      iconProps={{ color: 'secondary' }}
      border={!!title}
      title={title}
    >
      <Stack sx={styles.cardBody}>
        <Stack>
          <Typography fontSize={22} fontWeight={700}>
            {formatPrice(orderSummary?.totalDue, orderSummary?.currency, locale)}
          </Typography>
          {!!orderSummary?.totalDiscount && (
            <Stack direction="row" gap={0.5} alignItems="center">
              <Icon name="trending_down" fontSize={16} color="success" sx={{ my: -1 }} />
              <Markdown
                component="span"
                text={t('totalDiscountNote', {
                  discount: formatPrice(
                    orderSummary.totalDiscount,
                    orderSummary.currency,
                    locale
                  ).trim(),
                })}
                options={styles.discountMdOptions}
                sx={styles.discount}
              />
            </Stack>
          )}
        </Stack>
        {action}
        {showLines && orderSummary && (
          <PriceLines numSelected={numSelected} orderSummary={orderSummary} />
        )}
        <Stack>
          {/* <Banner
            variant="success"
            title={t('finalPriceBanner')}
            IconProps={{ name: 'handshake', fontSize: 26 }}
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          />
          <Divider sx={{ mx: -2 }} />
          <Banner
            title={t('shippingBanner')}
            IconProps={{ name: 'local_shipping', fontSize: 26 }}
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          /> */}
          {/* <Divider sx={{ mx: -2 }} /> */}
          <Banner
            variant="neutral"
            IconProps={{ name: 'redeem', fontSize: 26 }}
            title={t('discountCodeLabel')}
            collapsible
            defaultCollapsed
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          >
            <Stack component="form" gap={1} onSubmit={handleSubmitDiscountCode}>
              <TextField
                fullWidth
                size="small"
                defaultValue={initialDiscountCode}
                placeholder={t('discountCodePlaceholder')}
                onChange={(e) => setCode(e.target.value)}
                sx={styles.discountInput}
                InputProps={{
                  endAdornment: (
                    <Icon
                      name="clear"
                      fontSize={18}
                      color="tertiary"
                      onClick={handleClearDiscountCode}
                    />
                  ),
                }}
              />
              {!loading && initialDiscountCode && !orderSummary?.discountCode && (
                <Typography variant="caption">{t('discountCodeError')}</Typography>
              )}
              {orderSummary?.promotionDiscount && (
                <Typography variant="caption" mx={1}>
                  {t('discountCodeSuccess', {
                    totalDiscount: formatPrice(
                      orderSummary.promotionDiscount,
                      orderSummary.currency,
                      locale
                    ),
                  })}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                type="submit"
                sx={{ minWidth: 0, px: 2 }}
              >
                {t('discountCodeSubmit')}
              </Button>
            </Stack>
          </Banner>
          {/* {!!orderSummary?.totalDiscount && (
              <Banner
                title={t('discount')}
                variant="success"
                IconProps={{ name: 'trending_down' }}
                collapsible
                defaultCollapsed
                action={
                  <Typography variant="cardTitle" whiteSpace="nowrap" sx={styles.discount} mx={1}>
                    -{formatPrice(orderSummary.totalDiscount, orderSummary.currency, locale)}
                  </Typography>
                }
              >
                <Stack sx={styles.priceLine}>
                  <Typography variant="caption">
                    {t('productDiscount', { percent: orderSummary.productDiscountPercent })}
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {formatPrice(
                      orderSummary.productCostPreDiscount! - orderSummary.productCost!,
                      orderSummary.currency,
                      locale
                    )}
                  </Typography>
                </Stack>
                {orderSummary.discountCode && (
                  <Stack sx={styles.priceLine}>
                    <Typography variant="caption">{t('promotionDiscount')}</Typography>
                    <Typography variant="caption" fontWeight={500}>
                      {formatPrice(orderSummary.promotionDiscount, orderSummary.currency, locale)}
                    </Typography>
                  </Stack>
                )}
              </Banner>
            )} */}
        </Stack>

        {loading && (
          <Stack sx={styles.loadingOverlay}>
            <CircularProgress />
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export const PriceLines = ({
  numSelected,
  orderSummary,
}: {
  numSelected: number;
  orderSummary?: Partial<ShopOrderSummaryData>;
}) => {
  const t = useTranslations('shop.cart.page.checkoutCard');
  const { locale, region } = useLocale();
  const styles = useStyles();

  return (
    <Stack>
      <Stack sx={styles.priceLine}>
        <Typography variant="warning">{t('itemsTotal', { numSelected })}</Typography>
        <Typography variant="warningSemibold">
          {formatPrice(orderSummary?.productCost, orderSummary?.currency, locale)}
        </Typography>
      </Stack>
      {!!orderSummary?.shipmentCost && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">{t('shipping')}</Typography>
          <Typography variant="warningSemibold">
            {formatPrice(orderSummary?.shipmentCost, orderSummary?.currency, locale)}
          </Typography>
        </Stack>
      )}
      {orderSummary?.codServiceFee && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">{t('codServiceFee')}</Typography>
          <Typography variant="warningSemibold">
            {formatPrice(orderSummary?.codServiceFee, orderSummary?.currency, locale)}
          </Typography>
        </Stack>
      )}
      {!orderSummary?.shipmentCost && region === 'ww' && (
        <Banner
          variant="neutral"
          IconProps={{ name: 'info' }}
          title={t('selectCountryForShippingQuote')}
          sx={{ mt: 1 }}
        />
      )}
      {!!orderSummary?.promotionDiscount && (
        <Stack sx={{ ...styles.priceLine, ...styles.discount }}>
          <Typography variant="warning">{t('discount')}</Typography>
          <Typography variant="warningSemibold">
            -{formatPrice(orderSummary?.promotionDiscount, orderSummary?.currency, locale)}
          </Typography>
        </Stack>
      )}
      <Divider sx={{ my: 1 }} />
      {!!orderSummary?.totalDue && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">{t('totalDue')}</Typography>
          <Typography variant="warningSemibold">
            {formatPrice(orderSummary?.totalDue, orderSummary?.currency, locale)}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default CheckoutCard;
