'use client';

import Banner from '@/components/common/Banner';
import { ShopOrderSummaryData } from '@/lib/api/types';
import { Currency } from '@/lib/utils/currencies';
import formatPrice from '@/lib/utils/formatPrice';
import { Divider, Stack, Typography } from '@mui/material';

interface OrderSummaryCardProps {
  data: ShopOrderSummaryData;
  productCurrency: Currency;
}

const SummaryRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    gap={1}
  >
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: bold ? 600 : 400,
        color: 'text.mediumLight',
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: bold ? 15 : 14,
        fontWeight: bold ? 700 : 600,
        color: 'text.main',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      {value}
    </Typography>
  </Stack>
);

const OrderSummaryCard = ({ data, productCurrency }: OrderSummaryCardProps) => {
  const hasDiscount = Boolean((data as any).discount);

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        border: (theme) => `1px solid ${theme.palette.gray[100]}`,
        bgcolor: 'white.main',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Stack
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderBottom: (theme) => `1px solid ${theme.palette.gray[100]}`,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0,
            color: 'text.medium',
          }}
        >
          Sipariş Özeti
        </Typography>
      </Stack>

      {/* Summary rows */}
      <Stack sx={{ px: { xs: 2, sm: 2.5 }, py: 2, gap: 1.5 }}>
        <SummaryRow
          label="Ürünler Toplamı"
          value={formatPrice(data.productCost, productCurrency)}
        />

        {data.customsCharges?.map((charge) => (
          <SummaryRow
            key={charge.label}
            label={charge.label}
            value={formatPrice(charge.price, data.currency)}
          />
        ))}

        {data.codServiceFee && (
          <SummaryRow
            label="Kapıda Ödeme Hizmet Bedeli"
            value={formatPrice(data.codServiceFee, data.currency)}
          />
        )}

        <SummaryRow
          label="Kargo ve Hizmet Bedeli"
          value={formatPrice(data.shipmentCost, data.currency)}
        />

        {hasDiscount && (
          <>
            <Divider flexItem sx={{ borderColor: 'gray.100' }} />
            <SummaryRow
              label="Ara Toplam"
              value={formatPrice(data.total, data.currency)}
              bold
            />
            <Banner variant="success" horizontal noIcon sx={{ mx: -0.5, borderRadius: '8px' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'success.main' }}>
                  İndirim
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'success.main' }}>
                  - {formatPrice((data as any).discount, data.currency)}
                </Typography>
              </Stack>
            </Banner>
          </>
        )}
      </Stack>

      {/* Total */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          borderTop: (theme) => `1px solid ${theme.palette.gray[100]}`,
          bgcolor: 'bg.light',
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'text.main', letterSpacing: -0.1 }}>
          Ödenecek Tutar
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.main', letterSpacing: -0.2 }}>
          {formatPrice(data.totalDue, data.currency)}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default OrderSummaryCard;
