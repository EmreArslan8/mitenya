'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
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
import { usePathname, useRouter } from 'next/navigation';
import InfoItem from '@/components/InfoItem';
import FreeShippingBar from '@/components/FreeShippingBar';
import { ChevronDown, ChevronUp, Trash, User } from 'lucide-react';


export interface CartPageViewProps {
  hideTitle?: boolean;
  onContinue?: () => void;
  onItemClick?: () => void;
  visible?: boolean;
}

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
  const { isAuthenticated, openAuthenticator } = useAuth();
  const isCartPage = pathname?.includes('/cart') ?? false;
  const currencyLabel = getDisplayCurrencyCode(orderSummary?.currency ?? 'TRY');

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
    if (!selected?.length) return setOrderSummary(undefined);

    setSummaryLoading(true);

    if (isAuthenticated === undefined) return;

    handleUpdateOrderSummary(selected, discountCode);
  }, [selected, discountCode, isAuthenticated]);


  return (
    <Stack
      gap={3}
      
    >
      {visible && <LoadingOverlay loading={summaryLoading} />}
      {!hideTitle && <Typography variant="h1">Sepet</Typography>}
      <TwoColumnLayout sx={{ pb: 3, gap: 3 }}>
        <PrimaryColumn sx={{ gap: 0.5 }}>
          {!!cart?.length && (
            <Box sx={{ mb: 1.5 }}>
              <FreeShippingBar currentTotal={totalSelectedDue} currency={currencyLabel} />
            </Box>
          )}
          {isAuthenticated === false && !!cart?.length && (
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              sx={{
                px: 2,
                py: 1.25,
                mb: 1.5,
                borderRadius: 2,
                backgroundColor: '#FFFEF2', 
                border: '1px solid #F0E4C0', 
              }}
            >
              <User size={22} />

              <Typography variant="body" sx={{ fontSize: 14, color: 'text.primary' }}>
                Alışverişini daha hızlı tamamlamak için{' '}
                <Typography
                  component="span"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'warning.main',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    openAuthenticator?.({
                      onSuccess: () => {
                        // Sadece login olsun diye bırakıyoruz;
                        // istersen burada otomatik /checkout yönlendirmesi de ekleyebilirsin.
                      },
                    })
                  }
                >
                  Giriş Yap
                </Typography>
              </Typography>
            </Stack>
          )}
          <Stack sx={styles.products}>
            {cart &&
              (cart.length ? (
                cart.map((e, i) => (
                  <Stack gap={2} key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
                    <Stack direction="row" pr={2} alignItems="center">
                      <Checkbox
                        size="small"
                        checked={isSelected(e)}
                        onChange={() => toggleSelected(e)}
                      />
                      <ShopCartProductCard data={e} editable onClick={onItemClick} />
                    </Stack>
                    {i < cart.length - 1 && <Divider flexItem />}
                  </Stack>
                ))
              ) : (
                <Typography variant="body" px={1}>
                  Sepet Boş
                </Typography>
              ))}
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
              title="Siparişiniz"
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
                    Sipariş Ver
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
