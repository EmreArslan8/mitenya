import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import Card, { CardProps } from '@/components/common/Card';
import { ShopOrderSummaryData } from '@/lib/api/types';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import useStyles from './styles';

const CheckoutCard = ({
  title,
  orderSummary,
  discountCode: initialDiscountCode,
  onSubmitDiscountCode,
  loading,
  action,
  showLines,
  hideTitleIcon = false,
  titleProps,
  sx,
}: {
  title?: ReactNode;
  numSelected?: number;
  orderSummary?: Partial<ShopOrderSummaryData>;
  discountCode: string | null;
  onSubmitDiscountCode: (value: string | null) => void;
  loading: boolean;
  action?: ReactNode;
  showLines?: boolean;
  hideTitleIcon?: boolean;
  titleProps?: CardProps['titleProps'];
  sx?: CardProps['sx'];
}) => {
  const styles = useStyles();
  const [code, setCode] = useState(initialDiscountCode ?? '');
  const currencyLabel = getDisplayCurrencyCode(orderSummary?.currency ?? 'TRY');
  const appliedDiscountCode = orderSummary?.discountCode;

  useEffect(() => {
    setCode(initialDiscountCode ?? '');
  }, [initialDiscountCode]);

  const handleSubmitDiscountCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextCode = code.trim();
    onSubmitDiscountCode(nextCode || null);
  };

  const handleClearDiscountCode = () => {
    setCode('');
    onSubmitDiscountCode(null);
  };

  return (
    <Card
      iconName={title && !hideTitleIcon ? 'receipt_long' : undefined}
      iconProps={{ color: 'secondary' }}
      border={!!title}
      title={title}
      titleProps={titleProps}
      sx={sx}
    >
      <Stack sx={styles.cardBody}>
        {showLines && orderSummary && (
          <PriceLines orderSummary={orderSummary} />
        )}
        <Stack>
          {/* <Banner
            variant="success"
            title="Final Price"
            IconProps={{ name: 'handshake', fontSize: 26 }}
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          />
          <Divider sx={{ mx: -2 }} />
          <Banner
            title="Shipping"
            IconProps={{ name: 'local_shipping', fontSize: 26 }}
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          /> */}
          {/* <Divider sx={{ mx: -2 }} /> */}
          <Banner
            variant="neutral"
            title="İndirim Kuponu Uygula"
            collapsible
            defaultCollapsed

            sx={{ borderRadius: 0, p: 2 }}
          >
            <Stack component="form" gap={1.5} onSubmit={handleSubmitDiscountCode}>
              <TextField
                fullWidth
                size="small"
                value={code}
                placeholder="Kupon kodu giriniz"
                onChange={(e) => setCode(e.target.value)}
                disabled={!!appliedDiscountCode}
                sx={styles.discountInput}
              />
              {!loading && initialDiscountCode && !appliedDiscountCode && (
                <Typography variant="caption" color="error">Geçersiz İndirim Kodu</Typography>
              )}
              {appliedDiscountCode ? (
                <Stack sx={styles.appliedDiscountRow}>
                  <Typography sx={styles.appliedDiscountText}>
                    {appliedDiscountCode} uygulandı
                    {!!orderSummary?.promotionDiscount && `: -${orderSummary.promotionDiscount} ${currencyLabel}`}
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    type="button"
                    onClick={handleClearDiscountCode}
                    sx={styles.removeDiscountButton}
                  >
                    Kaldır
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!code.trim()}
                  sx={{ borderRadius: 1, width: '50%' }}
                >
                  Kuponu Uygula
                </Button>
              )}
            </Stack>
          </Banner>
          {/* {!!orderSummary?.totalDiscount && (
              <Banner
                title="Discount"
                variant="success"
                IconProps={{ name: 'trending_down' }}
                collapsible
                defaultCollapsed
                action={
                  <Typography variant="cardTitle" whiteSpace="nowrap" sx={styles.discount} mx={1}>
                    -{orderSummary.totalDiscount} {orderSummary.currency}
                  </Typography>
                }
              >
                <Stack sx={styles.priceLine}>
                  <Typography variant="caption">
                     Product Discount {orderSummary.productDiscountPercent}
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {orderSummary.productCostPreDiscount! - orderSummary.productCost!} {orderSummary.currency}
                  </Typography>
                </Stack>
                {orderSummary.discountCode && (
                  <Stack sx={styles.priceLine}>
                    <Typography variant="caption"> Promotion Discount</Typography>
                    <Typography variant="caption" fontWeight={500}>
                      {orderSummary.promotionDiscount} {orderSummary.currency}
                    </Typography>
                  </Stack>
                )}
              </Banner>
            )} */}
        </Stack>
        {action && <Stack sx={styles.checkoutAction}>{action}</Stack>}

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
  orderSummary,
}: {
  orderSummary?: Partial<ShopOrderSummaryData>;
}) => {

  const styles = useStyles();
  const currencyLabel = getDisplayCurrencyCode(orderSummary?.currency ?? 'TRY');

  return (
    <Stack sx={styles.summaryBlock}>
      <Stack sx={styles.priceLine}>
        <Typography sx={styles.priceLabel}>Ara Toplam</Typography>
        <Typography sx={styles.priceValue}>
          {orderSummary?.productCost} {currencyLabel}
        </Typography>
      </Stack>
      <Stack sx={styles.priceLine}>
        <Typography sx={styles.priceLabel}>Kargo</Typography>
        <Typography sx={orderSummary?.shipmentCost ? styles.priceValue : styles.freeShippingValue}>
          {orderSummary?.shipmentCost ? `${orderSummary.shipmentCost} ${currencyLabel}` : 'Ücretsiz'}
        </Typography>
      </Stack>
      {orderSummary?.codServiceFee && (
        <Stack sx={styles.priceLine}>
          <Typography sx={styles.priceLabel}>Kapıda Ödeme Hizmet Bedeli</Typography>
          <Typography sx={styles.priceValue}>
            {orderSummary?.codServiceFee} {currencyLabel}
          </Typography>
        </Stack>
      )}
      {!!orderSummary?.promotionDiscount && (
        <Stack sx={styles.priceLine}>
          <Typography sx={styles.discountLabel}>İndirim</Typography>
          <Typography sx={styles.discountValue}>
            -{orderSummary?.promotionDiscount} {currencyLabel}
          </Typography>
        </Stack>
      )}
      {!!orderSummary?.totalDiscount && !orderSummary?.promotionDiscount && (
        <Stack sx={styles.priceLine}>
          <Typography sx={styles.discountLabel}>İndirim</Typography>
          <Typography sx={styles.discountValue}>
            -{orderSummary.totalDiscount} {currencyLabel}
          </Typography>
        </Stack>
      )}
      <Divider sx={{ my: 1.25 }} />
      {!!orderSummary?.totalDue && (
        <Stack sx={styles.totalDuePriceLine}>
          <Typography sx={styles.totalLabel}>Toplam Tutar</Typography>
          <Typography sx={styles.totalValue}>
            {orderSummary?.totalDue} {currencyLabel}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default CheckoutCard;
