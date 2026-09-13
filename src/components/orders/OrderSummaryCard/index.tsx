'use client';

import Banner from '@/components/common/Banner';
import { ShopOrderSummaryData } from '@/lib/api/types';
import { Currency } from '@/lib/utils/currencies';
import formatPrice from '@/lib/utils/formatPrice';
import { Divider } from '@/components/ui/Divider';

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
  <div className="flex items-center justify-between gap-2">
    <span className={bold ? 'text-sm font-semibold leading-none text-text-medium-light' : 'text-sm leading-none text-text-medium-light'}>
      {label}
    </span>
    <span className={bold ? 'whitespace-nowrap text-[15px] font-bold leading-none text-text' : 'whitespace-nowrap text-sm font-semibold leading-none text-text'}>
      {value}
    </span>
  </div>
);

const OrderSummaryCard = ({ data, productCurrency }: OrderSummaryCardProps) => {
  const discount = data.totalDiscount || data.promotionDiscount || 0;
  const hasDiscount = discount > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <p className="text-[13px] font-bold uppercase text-text-medium">
          Sipariş Özeti
        </p>
      </div>

      {/* Summary rows */}
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
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
            <Divider className="border-gray-100" />
            <SummaryRow
              label="Ara Toplam"
              value={formatPrice(data.total, data.currency)}
              bold
            />
            <Banner variant="success" horizontal noIcon className="-mx-1 rounded-lg">
              <div className="flex w-full items-center justify-between">
                <span className="text-[13px] font-bold text-success">
                  İndirim
                </span>
                <span className="text-sm font-bold text-success">
                  - {formatPrice(discount, data.currency)}
                </span>
              </div>
            </Banner>
          </>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-bg-light px-4 py-4 sm:px-5">
        <span className="text-sm font-extrabold tracking-[-0.1px] text-text">
          Ödenecek Tutar
        </span>
        <span className="text-lg font-extrabold tracking-[-0.2px] text-text">
          {formatPrice(data.totalDue, data.currency)}
        </span>
      </div>
    </section>
  );
};

export default OrderSummaryCard;
