import Banner from '@/components/common/Banner';
import Card, { CardProps } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Typography } from '@/components/ui/Typography';
import { ShopOrderSummaryData } from '@/lib/api/types';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { ChevronDown } from '@/components/icons';
import formatPrice from '@/lib/utils/formatPrice';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';

const CheckoutCard = ({
  title,
  orderSummary,
  discountCode: initialDiscountCode,
  onSubmitDiscountCode,
  loading,
  action,
  showLines,
  titleClassName,
  headerClassName,
  className,
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
  titleClassName?: CardProps['titleClassName'];
  headerClassName?: CardProps['headerClassName'];
  className?: CardProps['className'];
}) => {
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
      border={!!title}
      title={title}
      titleClassName={titleClassName}
      headerClassName={headerClassName}
      className={className}
    >
      <div className="relative flex flex-col overflow-hidden rounded-none">
        {showLines && orderSummary && (
          <PriceLines orderSummary={orderSummary} />
        )}
        <div className="flex flex-col">
          <Banner
            variant="neutral"
            title="İndirim Kuponu Uygula"
            collapsible
            defaultCollapsed
            className="rounded-none p-4"
          >
            <form className="flex flex-col gap-3" onSubmit={handleSubmitDiscountCode}>
              <Input
                value={code}
                placeholder="Kupon kodu giriniz"
                aria-label="Kupon kodu"
                onChange={(e) => setCode(e.target.value)}
                disabled={!!appliedDiscountCode}
                size="large"
                variant="soft"
              />
              {!loading && initialDiscountCode && !appliedDiscountCode && (
                <Typography variant="caption" className="text-error">Geçersiz İndirim Kodu</Typography>
              )}
              {appliedDiscountCode ? (
                <div className="flex items-center justify-between gap-3">
                  <Typography variant="progressLabelBold" className="text-success">
                    {appliedDiscountCode} uygulandı
                    {!!orderSummary?.promotionDiscount && `: -${orderSummary.promotionDiscount} ${currencyLabel}`}
                  </Typography>
                  <Button
                    variant="text"
                    type="button"
                    onClick={handleClearDiscountCode}
                    size="small"
                    className="h-auto min-w-0 p-0 text-[13px] font-bold normal-case underline hover:bg-transparent hover:text-text"
                  >
                    Kaldır
                  </Button>
                </div>
              ) : (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!code.trim()}
                  className="w-1/2 rounded-sm"
                >
                  Kuponu Uygula
                </Button>
              )}
            </form>
          </Banner>
        </div>
        {action && <div className="flex flex-col gap-4 px-4 pb-4">{action}</div>}

        {loading && (
          <div className="absolute inset-0 z-1 flex items-center justify-center bg-white/[12.5%] backdrop-blur-[1px]">
            <Spinner className="text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
};

export const PriceLines = ({
  orderSummary,
}: {
  orderSummary?: Partial<ShopOrderSummaryData>;
}) => {
  const [earningsOpen, setEarningsOpen] = useState(false);
  const currency = orderSummary?.currency ?? 'TRY';
  const price = (value?: number) => formatPrice(value ?? 0, currency);

  /*
   * "Kazancın" ürün indirimini de kapsadığı için sepet tutarı indirim
   * öncesi olmalı; yoksa satırlar toplamı tutmaz:
   *   sepet tutarı - kazancın = toplam
   */
  const subtotal = orderSummary?.productCostPreDiscount ?? orderSummary?.productCost;
  const productDiscount =
    (orderSummary?.productCostPreDiscount ?? 0) - (orderSummary?.productCost ?? 0);
  const promotionDiscount = orderSummary?.promotionDiscount ?? 0;
  const earnings = orderSummary?.totalDiscount ?? productDiscount + promotionDiscount;
  /** Kırılım ancak iki kalem de varsa anlamlı — yoksa açılır ok göstermiyoruz. */
  const hasBreakdown = productDiscount > 0 && promotionDiscount > 0;
  const freeShipping = !orderSummary?.shipmentCost;

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-2 text-text-medium">
        <Typography variant="body2" className="tracking-normal text-text">Sepet Tutarı</Typography>
        <Typography variant="body2" className="font-semibold tracking-normal text-text">{price(subtotal)}</Typography>
      </div>

      <div className="flex items-center justify-between gap-2 text-text-medium">
        <Typography variant="body2" className="tracking-normal text-text">Kargo Ücreti</Typography>
        <Typography variant="body2" className={cn('font-semibold tracking-normal', freeShipping ? 'text-success' : 'text-text')}>
          {freeShipping ? 'Ücretsiz' : price(orderSummary?.shipmentCost)}
        </Typography>
      </div>

      {!!orderSummary?.codServiceFee && (
        <div className="flex items-center justify-between gap-2">
          <Typography variant="body2" className="tracking-normal text-text">Kapıda Ödeme Hizmet Bedeli</Typography>
          <Typography variant="body2" className="font-semibold tracking-normal text-text">{price(orderSummary.codServiceFee)}</Typography>
        </div>
      )}

      {earnings > 0 && (
        <>
          <Divider className="my-1 border-black/[6%]" />
          <div
            className={cn('flex items-center justify-between gap-2', hasBreakdown && 'cursor-pointer')}
            onClick={hasBreakdown ? () => setEarningsOpen((prev) => !prev) : undefined}
          >
            <div className="flex items-center gap-1">
              <Typography variant="body2" className="tracking-normal text-text">Kazancın</Typography>
              {hasBreakdown && (
                <span className={cn('inline-flex text-text-medium-light transition-transform duration-150', earningsOpen && 'rotate-180')}>
                  <ChevronDown size={18} />
                </span>
              )}
            </div>
            <Typography variant="body2" className="font-semibold tracking-normal text-success">-{price(earnings)}</Typography>
          </div>

          {hasBreakdown && (
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-in-out',
                earningsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2 pl-3 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <Typography variant="progressLabel" className="text-text-medium-light">Ürün indirimi</Typography>
                    <Typography variant="progressLabel" className="font-medium text-success">-{price(productDiscount)}</Typography>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Typography variant="progressLabel" className="text-text-medium-light">
                      Kupon indirimi{orderSummary?.discountCode ? ` (${orderSummary.discountCode})` : ''}
                    </Typography>
                    <Typography variant="progressLabel" className="font-medium text-success">-{price(promotionDiscount)}</Typography>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!!orderSummary?.totalDue && (
        <>
          <Divider className="my-1 border-black/[6%]" />
          <div className="flex items-center justify-between gap-2 text-text">
            <Typography variant="body1" className="leading-[34px] tracking-normal">Toplam</Typography>
            <Typography variant="h1" as="span" className="text-[24px] leading-[34px]">{price(orderSummary.totalDue)}</Typography>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutCard;
