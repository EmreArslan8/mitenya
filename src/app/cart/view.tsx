'use client';

import FreeShippingBar from '@/components/FreeShippingBar';
import Icon from '@/components/Icon';
import InfoItem from '@/components/InfoItem';
import LoadingOverlay from '@/components/LoadingOverlay';
import CheckoutCard, { PriceLines } from '@/components/ShoppingCart/CheckoutCard';
import ShopCartProductCard from '@/components/ShoppingCart/ShopCartProductCard';
import Banner from '@/components/common/Banner';
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
import { Box, Checkbox, Divider, Portal, Stack, Typography, debounce } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import useStyles from './styles';
import { usePathname, useRouter } from 'next/navigation';



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
  const pathname = usePathname()
  const {
    cart,
    numItems,
    selected,
    toggleSelected,
    numSelected,
    isSelected,
    unavailableItems,
    handleDismissUnavailableItem,
  } = useContext(ShopContext);
  const [orderSummary, setOrderSummary] = useState<ShopOrderSummaryData | undefined>();
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const { isAuthenticated, openAuthenticator, customerData } = useAuth();
  const isCartPage = pathname?.includes('/cart') ?? false;

  console.log("🧩 CART PAGE LOAD", {
    isAuthenticated,
    customerData,
    selectedCount: selected?.length,
    cartLength: cart?.length,
  });
  

  const handleUpdateOrderSummary = useCallback(
    debounce(async (selected, discountCode) => {
      // 💡 LOG: Sipariş özeti API çağrısı başlıyor
      //console.log('--- LOG: Order Summary API Call STARTED ---', { selectedItems: selected.length, discountCode });

      try {
        const data = await getOrderSummary({
          products: selected,
          discountCode,
        });

        // 💡 LOG: API'den gelen veriyi logla
      //  console.log('--- LOG: Order Summary Data Received ---', data?.orderSummary);

        setOrderSummary(data?.orderSummary);
        setSummaryLoading(false);
      } catch (error) {
        // 💡 LOG: API çağrısında hata oluştu
      //  console.error('--- LOG: Order Summary API Call ERROR ---', error);
        setSummaryLoading(false);
      }
    }, 1000),
    []
  );

  const handleContinue = async () => {
    console.log("▶ handleContinue CALLED", {
      isAuthenticated,
      hasSelectedItems: (selected?.length ?? 0) > 0,
    });
  
    if (!selected?.length) {
      console.log("⛔ DEVAM EDİLEMİYOR: Ürün seçili değil");
      return;
    }
  
    if (isAuthenticated === false) {
      console.log("⚠ Kullanıcı LOGIN DEĞİL → Authenticator açılıyor");
      openAuthenticator({
        onSuccess: () => {
          console.log("✔ Login başarılı → Checkout’a yönlendiriliyor");
          setButtonLoading(true);
          onContinue?.();
          router.push('/checkout');
        },
      });
      return;
    }
  
    console.log("✔ Kullanıcı ZATEN LOGIN → Checkout’a gidiyor");
    setButtonLoading(true);
    onContinue?.();
    router.push('/checkout');
  };
  
  useEffect(() => {
    // 💡 LOG: useEffect tetiklendi
   // console.log('--- LOG: useEffect Triggered ---', { selectedCount: selected?.length, isAuthenticated });

    if (!selected?.length) {
   //   console.log('--- LOG: No selected items, resetting summary ---');
      return setOrderSummary(undefined);
    }
    
    setSummaryLoading(true);
    
    if (isAuthenticated === undefined) {
     // console.log('--- LOG: Authentication status pending, delaying API call ---');
      return;
    }
    
    // 💡 LOG: Order Summary API Çağrısı Planlandı (debounce ile)
   // console.log('--- LOG: Order Summary API Call Scheduled ---');
    handleUpdateOrderSummary(selected, discountCode);
  }, [selected, discountCode, isAuthenticated]);

  // 💡 LOG: CartPageView Rendered
 // console.log('--- LOG: CartPageView Rendered ---', { summaryLoading, cartLength: cart?.length, orderSummaryStatus: !!orderSummary ? 'LOADED' : 'PENDING' });


  return (
    <Stack gap={3}>
      {visible && <LoadingOverlay loading={summaryLoading} />}
      {!hideTitle && <Typography variant="h1">Sepet</Typography>}
      <TwoColumnLayout sx={{ pb: 3, gap: 3 }}>
        <PrimaryColumn sx={{ gap: 0.5 }}>
          <Stack sx={styles.products}>
            {cart &&
              (cart.length ? (
                cart.map((e, i) => (
                  <Stack gap={2} key={JSON.stringify(e)}>
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
                  <Stack direction="row" pr={2} alignItems="center" key={JSON.stringify(e)}>
                    <Icon
                      name="delete"
                      color="error"
                      sx={{ px: 1 }}
                      onClick={() => handleDismissUnavailableItem(e)}
                    />
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
              title= "Siparişiniz"
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
          {isMobile && (
            <Stack gap={2}>
              <PriceLines numSelected={numSelected} orderSummary={orderSummary} />
              <Banner
                variant="success"
                title= {('cart.page.checkoutCard.finalPriceBanner')}
                IconProps={{ name: 'handshake', fontSize: 26 }}
                sx={{ p: 2 }}
              />
              <Banner
                title= {('cart.page.checkoutCard.shippingBanner')}
                IconProps={{ name: 'volunteer_activism', fontSize: 26 }}
                sx={{ p: 2 }}
              />
            </Stack>
          )}
        </SecondaryColumn>
      </TwoColumnLayout>
      {isMobile && (
        <Portal disablePortal={!visible}>
          <Stack sx={styles.mobileCheckoutBar} zIndex={isCartPage ? 0 : 1300}>
            <Box onClick={() => setSummaryModalOpen((prev) => !prev)}>
              <InfoItem
                sx={{ gap: 0 }}
                label= {('cart.page.checkoutCard.totalDue')}
                value={
                  <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
                    {(orderSummary?.totalDue, orderSummary?.currency)}
                    <Icon name="expand_more" sx={styles.expandIcon(summaryModalOpen)} />
                  </Stack>
                }
              />
            </Box>
            <Button
              variant="contained"
              size="small"
              arrow="end"
              loading={buttonLoading}
              disabled={!selected?.length}
              onClick={handleContinue}
            >
               {('cart.placeOrder')}
            </Button>
          </Stack>
        </Portal>
      )}
      {isMobile && (
        <ModalCard
          open={visible && summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          BodyProps={{ sx: { p: 0 } }}
          sx={{ zIndex: 1298, mb: '112px', '& .MuiBackdrop-root': { bottom: 112 } }}
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