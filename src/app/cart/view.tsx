'use client';

import FreeShippingBar from '@/components/FreeShippingBar';
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
import { bannerHeight, headerHeight } from '@/theme/theme';
import { Box, Checkbox, Divider, Portal, Stack, Typography, debounce } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import useStyles from './styles';
import { usePathname, useRouter } from 'next/navigation';
import ProductRecommendations from '../product/[id]/components/ProductRecommendations';
import { ChevronDown, Trash, Trash2, User } from 'lucide-react';


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
  const { isAuthenticated, openAuthenticator } = useAuth();
  const isCartPage = pathname?.includes('/cart') ?? false;
  const recommendationTarget = selected?.[0] ?? cart?.[0];

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
    if (!selected?.length) {
      return;
    }
    setButtonLoading(true);
    onContinue?.();
    router.push('/checkout?allow=guest');
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


  return (
    <Stack
      gap={3}
      
    >
      {visible && <LoadingOverlay loading={summaryLoading} />}
      {!hideTitle && <Typography variant="h1">Sepet</Typography>}
      <TwoColumnLayout sx={{ pb: 3, gap: 3 }}>
        <PrimaryColumn sx={{ gap: 0.5 }}>
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
        {/*
        {recommendationTarget?.brandId && (
          <Stack sx={{ my: 10 }}>
            <ProductRecommendations
              brandId={recommendationTarget.brandId}
              productId={recommendationTarget.id}
            />
          </Stack>
        )}
        */}
   
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
          {isMobile && (
            <Stack gap={2}>
              <PriceLines numSelected={numSelected} orderSummary={orderSummary} />
              <Banner
                variant="info"
                title={
                  orderSummary?.productCost && orderSummary.productCost >= 1000
                    ? 'Kargo ücretsiz'
                    : `Ücretsiz kargo için ${
                        Math.max(1000 - (orderSummary?.productCost ?? 0), 0)
                      } ${orderSummary?.currency ?? 'TRY'} değerinde daha ürün ekleyin`
                }
                IconProps={{ name: 'truck', size: 26 }}
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
                    label="Ödenecek tutar"
                    value={
                      <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
                        {orderSummary?.totalDue} {orderSummary?.currency}
                        <Box component="span" sx={styles.expandIcon(summaryModalOpen)}>
                          <ChevronDown size={18} />
                        </Box>
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
              Sipariş Ver
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
