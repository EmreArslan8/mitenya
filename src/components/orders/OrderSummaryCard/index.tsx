import Banner from "@/components/common/Banner";
import Card from "@/components/common/Card";
import { ShopOrderSummaryData } from "@/lib/api/types";
import { Currency } from "@/lib/utils/currencies";
import formatPrice from "@/lib/utils/formatPrice";
import { Divider, Stack, Typography } from "@mui/material";
interface OrderSummaryCardProps {
  data: ShopOrderSummaryData;
  productCurrency: Currency;
}

const OrderSummaryCard = ({ data, productCurrency }: OrderSummaryCardProps) => {
  return (
    <Card
      iconName="receipt_long"
      title={"orders.orderPage.summary.cardTitle"}
      border
    >
      <Stack py={2} px={3}>
        <Stack gap={1}>
          <Stack gap={0.5}>
            <Stack
              gap={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="warning">
                {"orders.orderPage.summary.productsTotal"}
              </Typography>
              <Typography fontSize={17} fontWeight={600} whiteSpace="nowrap">
                {(data.productCost, productCurrency)}
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
                {`orders.orderPage.summary.customsChargesLabels.${charge.label}`}
              </Typography>
              <Typography
                fontSize={17}
                fontWeight={600}
                lineHeight="normal"
                whiteSpace="nowrap"
              >
                {(charge.price, data.currency)}
              </Typography>
            </Stack>
          ))}
          {data.codServiceFee && (
            <Stack
              gap={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="warning" whiteSpace="nowrap">
                {"orders.orderPage.summary.codServiceFee"}
              </Typography>
              <Typography fontSize={17} fontWeight={600} whiteSpace="nowrap">
                {(data.codServiceFee, data.currency)}
              </Typography>
            </Stack>
          )}
          <Stack
            gap={1}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="warning" whiteSpace="nowrap">
              {"orders.orderPage.summary.shipping-handling"}
            </Typography>
            <Typography fontSize={17} fontWeight={600} whiteSpace="nowrap">
              {(data.shipmentCost, data.currency)}
            </Typography>
          </Stack>
          {/* TODO: Need to change this to promotionDiscount */}
          {Boolean(data.promotionDiscount) && (
            <>
              <Divider flexItem />
              <Stack
                gap={1}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="warning" fontWeight={600}>
                  {"orders.orderPage.summary.total"}
                </Typography>
                <Typography fontSize={17} fontWeight={600}>
                  {(data.total, data.currency)}
                </Typography>
              </Stack>
              <Banner variant="success" horizontal noIcon sx={{ mx: -1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack gap={1} direction="row" alignItems="center">
                    <Typography fontSize={15} fontWeight={600} color="success">
                      {`orders.orderPage.summary.discount`}
                    </Typography>
                  </Stack>
                  <Typography fontSize={17} fontWeight={600}>
                  {`- ${(data.promotionDiscount ?? 0, data.currency)}`}
                  </Typography>
                </Stack>
              </Banner>
            </>
          )}
        </Stack>
      </Stack>
      <Divider flexItem />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        py={2}
        px={3}
      >
        <Typography fontSize={15} fontWeight={700} lineHeight={1}>
          {"orders.orderPage.summary.totalDue"}
        </Typography>
        <Typography fontSize={18} fontWeight={700} lineHeight={1}>
          {(data.totalDue, data.currency)}
        </Typography>
      </Stack>
    </Card>
  );
};

export default OrderSummaryCard;
