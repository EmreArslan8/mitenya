import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ShopOrderSummaryData } from '@/lib/api/types';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, ReactNode, useState } from 'react';
import useStyles from './styles';
import Markdown from '@/components/common/Markdown';
import { Delete, TrendingDown } from 'lucide-react';

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
  const styles = useStyles();
  const [code, setCode] = useState(initialDiscountCode);
  const currencyLabel = getDisplayCurrencyCode(orderSummary?.currency ?? 'TRY');

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
            {orderSummary?.totalDue} {currencyLabel}
          </Typography>
          {!!orderSummary?.totalDiscount && (
            <Stack direction="row" gap={0.5} alignItems="center">
              <TrendingDown color="green" style={{ marginTop: -1, marginBottom: -1 }} />
              <Markdown
                component="span"
                text={`Kazancınız ${orderSummary.totalDiscount} ${currencyLabel}`}
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
            IconProps={{ name: 'redeem', fontSize: 26 }}
            title="İndirim Kodu"
            collapsible
            defaultCollapsed
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          >
            <Stack component="form" gap={1} onSubmit={handleSubmitDiscountCode}>
              <TextField
                fullWidth
                size="small"
                defaultValue={initialDiscountCode}
                placeholder="İndirim kodunu girin"
                onChange={(e) => setCode(e.target.value)}
                sx={styles.discountInput}
                InputProps={{
                  endAdornment: (
                    <Delete
                      name="clear"
                      fontSize={18}
                      color="tertiary"
                      onClick={handleClearDiscountCode}
                    />
                  ),
                }}
              />
              {!loading && initialDiscountCode && !orderSummary?.discountCode && (
                <Typography variant="caption">Geçersiz İndirim Kodu</Typography>
              )}
              {orderSummary?.promotionDiscount && (
                <Typography variant="caption" mx={1}>
                   İndirim Uygulandı: {orderSummary.promotionDiscount} {currencyLabel}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                type="submit"
                sx={{ minWidth: 0, px: 2 }}
              >
                 Uygula
              </Button>
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

  const styles = useStyles();
  const currencyLabel = getDisplayCurrencyCode(orderSummary?.currency ?? 'TRY');

  return (
    <Stack>
      <Stack sx={styles.priceLine}>
        <Typography variant="warning">Ürünler Toplamı</Typography>
        <Typography variant="warningSemibold">
          {orderSummary?.productCost} {currencyLabel}
        </Typography>
      </Stack>
      {!!orderSummary?.shipmentCost && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">Kargo</Typography>
          <Typography variant="warningSemibold">
            {orderSummary?.shipmentCost} {currencyLabel}
          </Typography>
        </Stack>
      )}
      {orderSummary?.codServiceFee && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">COD Service Fee</Typography>
          <Typography variant="warningSemibold">
            {orderSummary?.codServiceFee} {currencyLabel}
          </Typography>
        </Stack>
      )}
      {!!orderSummary?.promotionDiscount && (
        <Stack sx={{ ...styles.priceLine, ...styles.discount }}>
          <Typography variant="warning">İndirim</Typography>
          <Typography variant="warningSemibold">
            -{orderSummary?.promotionDiscount} {currencyLabel}
          </Typography>
        </Stack>
      )}
      <Divider sx={{ my: 1 }} />
      {!!orderSummary?.totalDue && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">Ödeme Tutarı</Typography>
          <Typography variant="warningSemibold">
            {orderSummary?.totalDue} {currencyLabel}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default CheckoutCard;
