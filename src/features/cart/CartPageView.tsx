'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import CartTrustBar from '@/components/ShoppingCart/CartTrustBar';
import CheckoutCard from '@/components/ShoppingCart/CheckoutCard';
import ShopCartProductCard from '@/components/ShoppingCart/ShopCartProductCard';
import ModalCard from '@/components/common/ModalCard';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Typography } from '@/components/ui/Typography';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { getOrderSummary } from '@/lib/api/checkout';
import { ShopOrderSummaryData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { readStoredWelcomeCoupon } from '@/lib/shop/welcomeCoupon';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import EmptyCart from './EmptyCart';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ChevronUp } from '@/components/icons';
import formatPrice from '@/lib/utils/formatPrice';
import { Trash } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';


export interface CartPageViewProps {
  hideTitle?: boolean;
  onContinue?: () => void;
  onItemClick?: () => void;
  visible?: boolean;
}

/** Kargo bedava eşiği (TL) — FreeShippingBar'da da aynı değer kullanılıyordu. */
const FREE_SHIPPING_THRESHOLD = 750;

const CartPageView = ({
  hideTitle = false,
  onContinue,
  onItemClick,
  visible = true,
}: CartPageViewProps) => {
  const isMobile = useScreen('smDown');
  const router = useRouter();
  const pathname = usePathname();
  const {
    cart,
    selected,
    toggleSelected,
    numSelected,
    isSelected,
    totalSelectedDue,
    unavailableItems,
    handleDismissUnavailableItem,
  } = useContext(ShopContext);
  const [orderSummary, setOrderSummary] = useState<ShopOrderSummaryData | undefined>();
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const isCartPage = pathname?.includes('/cart') ?? false;
  const currencyLabel = getDisplayCurrencyCode(orderSummary?.currency ?? 'TRY');
  /** Kargo bedava eşiğine kalan tutar; ilk ürün kartının marka şeridinde gösterilir. */
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalSelectedDue);
  /** Başlıktaki sayaç: satır sayısı değil, sepetteki toplam adet. */
  const itemCount = cart?.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 0;
  /**
   * Tam boş sepet: `cart` henüz undefined iken (ilk yükleme) boş state basmıyoruz,
   * yoksa sepeti dolu olan kullanıcı bir an "sepetin boş" yazısını görüyor.
   * Stokta kalmayan ürünler duruyorsa da sayfa tümden boş sayılmaz.
   */
  const isEmpty = !!cart && cart.length === 0 && unavailableItems.length === 0;

  const handleContinue = async () => {
    if (!selected?.length) {
      return;
    }
    setButtonLoading(true);
    onContinue?.();
    const params = new URLSearchParams({ allow: 'guest' });
    if (discountCode) params.set('dc', discountCode);
    router.push(`/checkout?${params.toString()}`);
  };

  useEffect(() => {
    const storedCode = readStoredWelcomeCoupon();
    if (!storedCode || discountCode) return;

    setDiscountCode(storedCode);
    pushItemToDataLayer({
      event: 'promo_code_applied',
      promo_location: 'cart',
      promo_code: storedCode,
      apply_method: 'auto',
    });
  }, [discountCode]);

  useEffect(() => {
    if (!selected?.length) {
      setOrderSummary(undefined);
      setSummaryLoading(false);
      return;
    }

    // Oturum durumu daha çözülmediyse istek atamayız; spinner'ı da açmıyoruz.
    // (Önce açılıp burada return edilince, auth hiç çözülmezse spinner sonsuza
    // kadar dönüyordu.) isAuthenticated değişince bu effect yeniden çalışır.
    if (isAuthenticated === undefined) return;

    let cancelled = false;
    setSummaryLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await getOrderSummary({ products: selected, discountCode: discountCode ?? undefined });
        if (!cancelled) setOrderSummary(data?.orderSummary);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selected, discountCode, isAuthenticated]);


  if (isEmpty) {
    return <EmptyCart compact={hideTitle} onAction={onItemClick} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {visible && <LoadingOverlay loading={summaryLoading} />}
      {!hideTitle && <CartTrustBar />}
      {!hideTitle && (
        <div className="flex items-baseline gap-2">
          <Typography variant="h1" className="font-semibold md:text-[32px] md:leading-[38px]">
            Sepet
          </Typography>
          {!!itemCount && (
            <Typography variant="body2" as="span" className="tracking-normal text-text-medium-light md:text-[16px] md:leading-[19px]">
              {itemCount} ürün
            </Typography>
          )}
        </div>
      )}
      <TwoColumnLayout className="gap-6 pb-6">
        <PrimaryColumn className="gap-1">
          <div className="flex flex-col gap-4 rounded-none">
            {cart &&
              (cart.length ? (
                cart.map((e, i) => (
                  <div className="flex flex-col gap-4" key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
                    <div className="flex items-center">
                      <ShopCartProductCard
                        data={e}
                        selection={
                          <Checkbox
                            checked={isSelected(e)}
                            onCheckedChange={() => toggleSelected(e)}
                            className="mr-2"
                            aria-label="Ürünü seç"
                          />
                        }
                        editable
                        onClick={onItemClick}
                        headerAction={
                          i === 0 ? (
                            // Eşik aşıldıysa kazanılmış bir hak — yeşille söylüyoruz.
                            <div className={cn('flex items-center gap-1', freeShippingRemaining <= 0 && 'text-success')}>
                              <Typography variant="caption" className="leading-4 tracking-normal">
                                {freeShippingRemaining > 0
                                  ? `${formatPrice(freeShippingRemaining, orderSummary?.currency ?? 'TRY')}'lik daha ekle kargo bedava`
                                  : 'Kargo bedava'}
                              </Typography>
                              <ChevronRight size={16} />
                            </div>
                          ) : undefined
                        }
                      />
                    </div>
                    {i < cart.length - 1 && <Divider />}
                  </div>
                ))
              ) : null)}
          </div>
          
          {unavailableItems.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              <Divider />
              <Typography variant="cardTitle" className="mt-4 text-tertiary">
                Stokta Yok
              </Typography>
              <div className="flex flex-col gap-4 rounded-none">
                {unavailableItems.map((e) => (
                  <div className="flex items-center pr-4" key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent px-2 text-error"
                      onClick={() => handleDismissUnavailableItem(e)}
                      aria-label="Stokta olmayan ürünü kaldır"
                    >
                      <Trash size={18} />
                    </button>
                    <ShopCartProductCard data={e} unavailable />
                  </div>
                ))}
              </div>
            </div>
          )}


        </PrimaryColumn>
       
        <SecondaryColumn>
          {!isMobile && !!cart?.length && (
            <CheckoutCard
              title="Sipariş Özeti"
              titleClassName="text-2xl font-semibold leading-[34px] normal-case"
              orderSummary={orderSummary}
              numSelected={numSelected}
              discountCode={discountCode}
              onSubmitDiscountCode={setDiscountCode}
              loading={summaryLoading}
              showLines
              action={
                !isMobile && (
                  <Button
                    variant="contained"
                    arrow="end"
                    loading={buttonLoading}
                    disabled={!selected?.length}
                    onClick={handleContinue}
                  >
                    Sepeti Onayla
                  </Button>
                )
              }
            />
          )}
        </SecondaryColumn>
       
      </TwoColumnLayout>
      {isMobile && !!selected?.length && (() => {
        const mobileBar = (
          <div className={cn('fixed bottom-0 left-0 flex w-full items-center justify-between bg-bg px-4 py-2 shadow-[0_0_5px_#00000010]', isCartPage ? 'z-0' : 'z-[1300]')}>
            <div className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setSummaryModalOpen((prev) => !prev)}
                className={cn('flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-gray-100 bg-transparent transition-transform duration-200', summaryModalOpen && 'rotate-180')}
                aria-label="Sipariş özetini göster"
              >
                <ChevronUp size={18} />
              </button>
              <div className="flex flex-1 flex-col items-center">
                <Typography variant="caption" className="text-[11px] leading-[1.2] tracking-normal text-text-secondary">Toplam</Typography>
                <Typography variant="body1" className="font-bold leading-[1.3] tracking-normal">
                  {orderSummary?.totalDue} {currencyLabel}
                </Typography>
              </div>
            </div>
            <Button
              variant="contained"
              loading={buttonLoading}
              disabled={!selected?.length}
              onClick={handleContinue}
              className="whitespace-nowrap"
            >
              Sepeti Onayla
            </Button>
          </div>
        );
        return visible && typeof document !== 'undefined' ? createPortal(mobileBar, document.body) : mobileBar;
      })()}
      {isMobile && (
        <ModalCard
          open={visible && summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          layout="bottom-sheet"
          fullWidth
          bodyClassName="p-0"
          bottomOffset={64}
          layer={1298}
        >
          <CheckoutCard
            showLines
            orderSummary={orderSummary}
            numSelected={numSelected}
            discountCode={discountCode}
            onSubmitDiscountCode={setDiscountCode}
            loading={summaryLoading}
          />
        </ModalCard>
      )}
    </div>
  );
};

export default CartPageView;
