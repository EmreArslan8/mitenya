import Icon from '@/components/Icon';
import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ShopOrderSummaryData } from '@/lib/api/types';
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
            {orderSummary?.totalDue} {orderSummary?.currency}
          </Typography>
          {!!orderSummary?.totalDiscount && (
            <Stack direction="row" gap={0.5} alignItems="center">
              <Icon name="trending_down" fontSize={16} color="success" sx={{ my: -1 }} />
              <Markdown
                component="span"
                text={`You saved ${orderSummary.totalDiscount} ${orderSummary.currency}`}
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
            title="Discount Code"
            collapsible
            defaultCollapsed
            sx={{ mx: -2, borderRadius: 0, p: 2 }}
          >
            <Stack component="form" gap={1} onSubmit={handleSubmitDiscountCode}>
              <TextField
                fullWidth
                size="small"
                defaultValue={initialDiscountCode}
                placeholder="Enter discount code"
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
                <Typography variant="caption">Invalid discount code</Typography>
              )}
              {orderSummary?.promotionDiscount && (
                <Typography variant="caption" mx={1}>
                   Discount applied: {orderSummary.promotionDiscount} {orderSummary.currency}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                type="submit"
                sx={{ minWidth: 0, px: 2 }}
              >
                 Apply
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

  return (
    <Stack>
      <Stack sx={styles.priceLine}>
        <Typography variant="warning">Items Total</Typography>
        <Typography variant="warningSemibold">
          {orderSummary?.productCost} {orderSummary?.currency}
        </Typography>
      </Stack>
      {!!orderSummary?.shipmentCost && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">Shipping</Typography>
          <Typography variant="warningSemibold">
            {orderSummary?.shipmentCost} {orderSummary?.currency}
          </Typography>
        </Stack>
      )}
      {orderSummary?.codServiceFee && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">COD Service Fee</Typography>
          <Typography variant="warningSemibold">
            {orderSummary?.codServiceFee} {orderSummary?.currency}
          </Typography>
        </Stack>
      )}
      {!orderSummary?.shipmentCost && (
        <Banner
          variant="neutral"
          IconProps={{ name: 'info' }}
          title="Select country for shipping quote"
          sx={{ mt: 1 }}
        />
      )}
      {!!orderSummary?.promotionDiscount && (
        <Stack sx={{ ...styles.priceLine, ...styles.discount }}>
          <Typography variant="warning">Discount</Typography>
          <Typography variant="warningSemibold">
            -{orderSummary?.promotionDiscount} {orderSummary?.currency}
          </Typography>
        </Stack>
      )}
      <Divider sx={{ my: 1 }} />
      {!!orderSummary?.totalDue && (
        <Stack sx={styles.priceLine}>
          <Typography variant="warning">Total Due</Typography>
          <Typography variant="warningSemibold">
            {orderSummary?.totalDue} {orderSummary?.currency}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default CheckoutCard;
