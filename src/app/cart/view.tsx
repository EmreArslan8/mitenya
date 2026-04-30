'use client';

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
import { readStoredWelcomeCoupon } from '@/lib/shop/welcomeCoupon';
import { getDisplayCurrencyCode } from '@/lib/utils/currencies';
import { pushItemToDataLayer } from '@/lib/utils/googleAnalytics';
import { Box, Checkbox, Divider, Portal, Stack, Typography, debounce } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import useStyles from './styles';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Trash } from 'lucide-react';


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
    unavailableItems,
    handleDismissUnavailableItem,
  } = useContext(ShopContext);
  const [orderSummary, setOrderSummary] = useState<ShopOrderSummaryData | undefined>();
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
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

  const navigateToCheckout = () => {
    const params = new URLSearchParams();
    if (discountCode) params.set('dc', discountCode);
    const qs = params.toString();
    router.push(`/checkout${qs ? `?${qs}` : ''}`);
  };

  const handleContinue = async () => {
    if (!selected?.length) return;
    setButtonLoading(true);
    onContinue?.();
    navigateToCheckout();
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
                      } ${currencyLabel} değerinde daha ürün ekleyin`
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
                        {orderSummary?.totalDue} {currencyLabel}
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
