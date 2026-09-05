'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import CartTrustBar from '@/components/ShoppingCart/CartTrustBar';
import CheckoutCard, { PriceLines } from '@/components/ShoppingCart/CheckoutCard';
import ShopCartProductCard from '@/components/ShoppingCart/ShopCartProductCard';
import Button from '@/components/common/Button';
import ModalCard from '@/components/common/ModalCard';
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
import { Box, Checkbox, Divider, Portal, Stack, Typography, debounce } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import useStyles from './styles';
import EmptyCart from './EmptyCart';
import { usePathname, useRouter } from 'next/navigation';
import InfoItem from '@/components/InfoItem';
import { ChevronRight, ChevronUp } from '@/components/icons';
import formatPrice from '@/lib/utils/formatPrice';
import { Trash } from 'lucide-react';


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
  const { isMobile } = useScreen();
  const styles = useStyles();
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

  const handleUpdateOrderSummary = useCallback(
    debounce(async (selected, discountCode) => {
      try {
        const data = await getOrderSummary({
          products: selected,
          discountCode,
        });
        setOrderSummary(data?.orderSummary);
        setSummaryLoading(false);
      } catch {
        setSummaryLoading(false);
      }
    }, 1000),
    []
  );

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
  }, []);

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

    setSummaryLoading(true);
    handleUpdateOrderSummary(selected, discountCode);
  }, [selected, discountCode, isAuthenticated]);


  if (isEmpty) {
    return <EmptyCart compact={hideTitle} onAction={onItemClick} />;
  }

  return (
    <Stack
      gap={3}
      
    >
      {visible && <LoadingOverlay loading={summaryLoading} />}
      {!hideTitle && <CartTrustBar />}
      {!hideTitle && (
        <Stack sx={styles.pageTitle}>
          <Typography component="h1" sx={styles.pageTitleText}>
            Sepet
          </Typography>
          {!!itemCount && (
            <Typography component="span" sx={styles.pageTitleCount}>
              {itemCount} ürün
            </Typography>
          )}
        </Stack>
      )}
      <TwoColumnLayout sx={{ pb: 3, gap: 3 }}>
        <PrimaryColumn sx={{ gap: 0.5 }}>
          <Stack sx={styles.products}>
            {cart &&
              (cart.length ? (
                cart.map((e, i) => (
                  <Stack gap={2} key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
                    <Stack direction="row" alignItems="center">
                      <ShopCartProductCard
                        data={e}
                        selection={
                          <Checkbox
                            size="small"
                            checked={isSelected(e)}
                            onChange={() => toggleSelected(e)}
                            sx={{ mr: 1 }}
                          />
                        }
                        editable
                        onClick={onItemClick}
                        headerAction={
                          i === 0 ? (
                            // Eşik aşıldıysa kazanılmış bir hak — yeşille söylüyoruz.
                            <Stack
                              direction="row"
                              alignItems="center"
                              gap="4px"
                              sx={{ color: freeShippingRemaining > 0 ? 'inherit' : 'success.main' }}
                            >
                              <Typography sx={{ fontSize: 12, lineHeight: '16px' }}>
                                {freeShippingRemaining > 0
                                  ? `${formatPrice(freeShippingRemaining, orderSummary?.currency ?? 'TRY')}'lik daha ekle kargo bedava`
                                  : 'Kargo bedava'}
                              </Typography>
                              <ChevronRight size={16} />
                            </Stack>
                          ) : undefined
                        }
                      />
                    </Stack>
                    {i < cart.length - 1 && <Divider flexItem />}
                  </Stack>
                ))
              ) : null)}
          </Stack>
          
          {unavailableItems.length > 0 && (
            <Stack mt={3} gap={2}>
              <Divider />
              <Typography variant="cardTitle" sx={styles.unavailableItemsTitle}>
                Stokta Yok
              </Typography>
              <Stack sx={styles.products}>
                {unavailableItems.map((e) => (
                  <Stack direction="row" pr={2} alignItems="center" key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
                    <Box
                      sx={{ px: 1, color: 'error.main', cursor: 'pointer' }}
                      onClick={() => handleDismissUnavailableItem(e)}
                    >
                      <Trash size={18} color='red' />
                    </Box>
                    <ShopCartProductCard data={e} unavailable />
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}


        </PrimaryColumn>
       
        <SecondaryColumn>
          {!isMobile && !!cart?.length && (
            <CheckoutCard
              title="Sipariş Özeti"
              titleProps={{
                sx: { fontSize: 24, fontWeight: 600, lineHeight: '34px', textTransform: 'none' },
              }}
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
      {isMobile && !!selected?.length && (
        <Portal disablePortal={!visible}>
          <Stack sx={styles.mobileCheckoutBar} zIndex={isCartPage ? 0 : 1300}>
            <Stack direction="row" alignItems="center" gap={1.5} flex={1}>
              <Box
                onClick={() => setSummaryModalOpen((prev) => !prev)}
                sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid', borderColor: 'divider',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: summaryModalOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <ChevronUp size={18} />
              </Box>
              <Stack sx={{ flex: 1, alignItems: 'center' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }}>Toplam</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
                  {orderSummary?.totalDue} {currencyLabel}
                </Typography>
              </Stack>
            </Stack>
            <Button
              variant="contained"
              loading={buttonLoading}
              disabled={!selected?.length}
              onClick={handleContinue}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Sepeti Onayla
            </Button>
          </Stack>
        </Portal>
      )}
      {isMobile && (
        <ModalCard
          open={visible && summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          layout="bottom-sheet"
          fullWidth
          BodyProps={{ sx: { p: 0 } }}
          sx={{ zIndex: 1298, mb: '64px', '& .MuiBackdrop-root': { bottom: 64 } }}
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
    </Stack>
  );
};

export default CartPageView;
