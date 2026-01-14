'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import AddressSelector from '@/components/AddressSelector';
import Icon from '@/components/Icon';
import InfoItem from '@/components/InfoItem';
import LoadingOverlay from '@/components/LoadingOverlay';
import CheckoutCard from '@/components/ShoppingCart/CheckoutCard';
import ShopCartProductCard from '@/components/ShoppingCart/ShopCartProductCard';
import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ModalCard from '@/components/common/ModalCard';
import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { getOrderSummary } from '@/lib/api/checkout';
import { AddressData, PaymentType, ShopOrderSummaryData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import formatPrice from '@/lib/utils/formatPrice';
import { useCheckoutAnalytics } from '@/lib/utils/googleAnalytics';
import { Box, Checkbox, Divider, Snackbar, Stack, Typography, debounce } from '@mui/material';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import useStyles from './styles';

export interface CheckoutPageViewProps {
  initialAddresses?: AddressData[] | null;
}

const CheckoutPageView = ({ initialAddresses }: CheckoutPageViewProps) => {
  const { isMobile } = useScreen();
  const styles = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, customerData } = useAuth();
  const { sendBeginCheckout, sendAddShippingInfo, sendAddPaymentInfo } = useCheckoutAnalytics();
  const { selected, numSelected, removeItems } = useContext(ShopContext);
  const [addresses, setAddresses] = useState<AddressData[]>(initialAddresses ?? []);
  const [destination, setDestination] = useState<AddressData | undefined>(initialAddresses?.[0]);
  const [paymentType, setPaymentType] = useState<PaymentType>('Stripe');
  const [paymentSessionId, setPaymentSessionId] = useState<string>();
  const [orderSummary, setOrderSummary] = useState<ShopOrderSummaryData | undefined>();
  const [discountCode, setDiscountCode] = useState<string | null>(searchParams?.get('dc') ?? null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [continueButtonLoading, setContinueButtonLoading] = useState(false);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [directToPaymentOnAddressAdded, setDirectToPaymentOnAddressAdded] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [paymentPortalOpen, setPaymentPortalOpen] = useState(false);
  const [showDiscountCodeSnackbar, setShowDiscountCodeSnackbar] = useState(false);
  const handleDestinationChange = (newValue: AddressData) => setDestination(newValue);
  const handleAddressAdded = (newAddress: AddressData) => {
    setDestination(newAddress);
    setAddresses((prev) => [...(prev ?? []), newAddress]);
  };

  const codAvailable =
  process.env.NODE_ENV !== 'production' ||
  orderSummary?.cashOnDeliveryAvailability?.isAvailable === true;


  const handleCheckout = async () => {
    if (summaryLoading || !selected || selected.length === 0) return;

    // Adres kontrolü
    if (!destination) {
      setNewAddressModalOpen(true);
      setDirectToPaymentOnAddressAdded(true);
      return;
    }

    // Email kontrolü
    if (!customerData?.email) {
      alert('Lütfen giriş yapın');
      return;
    }

    setContinueButtonLoading(true);

    try {
      // Analytics gönder
      if (orderSummary) {
        sendAddShippingInfo(selected, orderSummary);
        sendAddPaymentInfo(selected, orderSummary, paymentType);
      }

      // Ürünleri order items formatına dönüştür
      const orderItems = selected.map((item) => ({
        product_id: item.id,
        product_name: item.name || '',
        quantity: item.quantity,
        price: item.price.currentPrice,
        image_url: item.imgSrc || item.images?.[0],
        variant_data: item.variants?.reduce(
          (acc, v) => {
            const selectedOption = v.options.find((o) => o.selected);
            if (selectedOption) acc[v.name] = selectedOption.value;
            return acc;
          },
          {} as Record<string, string>
        ),
      }));

      // Shipping address formatla
      const shippingAddress = {
        contactName: `${destination.contactName} ${destination.contactSurname}`,
        line1: destination.line1,
        line2: destination.line2,
        city: destination.city,
        district: destination.district,
        postalCode: destination.postcode,
        country: destination.countryCode,
        phone: `${destination.phoneCode}${destination.phoneNumber}`,
      };

      // Sipariş oluştur
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: customerData.email,
          items: orderItems,
          shipping_address: shippingAddress,
          payment_method: paymentType === 'COD' ? 'cod' : paymentType === 'Stripe' ? 'stripe' : 'paytr',
          shipping_cost: orderSummary?.shipmentCost || 0,
          discount_amount: orderSummary?.totalDiscount || 0,
          discount_code: discountCode,
          currency: 'TRY',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sipariş oluşturulamadı');
      }

      // Sepetten sipariş edilen ürünleri kaldır
      removeItems(selected);

      // Başarı sayfasına yönlendir
      router.push(`/success/${data.order.order_number}`);
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Bir hata oluştu');
    } finally {
      setContinueButtonLoading(false);
    }
  };

  const handleUpdateOrderSummary = useCallback(
    debounce(async (selected, destination, paymentType, discountCode) => {
      const data = await getOrderSummary({
        products: selected,
        destination,
        discountCode,
        draftPaymentMethod: paymentType,
      });
      setOrderSummary(data?.orderSummary);
      setSummaryLoading(false);
    }, 1000),
    []
  );

  useEffect(() => {
    if (isAuthenticated === false) router.push('/cart');
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selected?.length) return setOrderSummary(undefined);
    setSummaryLoading(true);
    handleUpdateOrderSummary(selected, destination, paymentType, discountCode);
  }, [selected, destination, paymentType, discountCode]);

  useEffect(() => {
    if (!selected?.length) return;
    sendBeginCheckout(selected);
  }, [selected]);

  useEffect(() => {
    if (directToPaymentOnAddressAdded) {
      setDirectToPaymentOnAddressAdded(false);
      handleCheckout();
    }
  }, [orderSummary]);

  return (
    <>
      {showDiscountCodeSnackbar && (
        <Snackbar
          open={showDiscountCodeSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowDiscountCodeSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Banner
            variant="success"
            title="İndirim kodu başarıyla uygulandı"
            sx={{ width: '100%' }}
          />
        </Snackbar>
      )}
      {!orderSummary && <LoadingOverlay loading />}
      <Stack gap={3}>
        <TwoColumnLayout sx={{ pb: 3, gap: { xs: 2, sm: 3 } }}>
          <PrimaryColumn>
            <Card
              border
              iconName="local_shipping"
              iconProps={{ color: 'secondary' }}
              title={
                <Typography
                  variant="cardTitle"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 0.5,
                  }}
                >
                  Teslimat Bilgileri
                  {destination && (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Icon name="check" color="neutral" fontSize={16} weight={500} />
                      <Typography
                        variant="cardTitle"
                        color="text.medium"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          textTransform: 'none',
                          textDecoration: 'underline',
                        }}
                      >
                        {`${destination.name}`}
                      </Typography>
                    </Box>
                  )}
                </Typography>
              }
              collapsible
              defaultCollapsed={isMobile && !!destination}
            >
              <Stack px={{ xs: 1, sm: 2 }} py={1}>
                <Stack>
                  <Card sx={{ maxWidth: { xs: '100%', sm: 350 }, gap: 1 }}>
                    <AddressSelector
                      value={destination}
                      options={addresses}
                      onAddressAdded={handleAddressAdded}
                      onChange={handleDestinationChange}
                    />
                    <Banner
                      title="Ücretsiz kargo avantajı"
                      variant="neutral"
                      IconProps={{ name: 'check' }}
                    />
                  </Card>
                </Stack>
              </Stack>
            </Card>
            <Card
              border
              iconName="payment"
              iconProps={{ color: 'secondary' }}
              title={
                <Typography
                  variant="cardTitle"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 0.5,
                  }}
                >
                  Ödeme Yöntemi
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      maxWidth: { xs: 150, md: 'unset' },
                    }}
                  >
                    <Icon name="check" color="neutral" fontSize={16} weight={500} />
                    <Typography
                      variant="cardTitle"
                      color="text.medium"
                      sx={{
                        alignItems: 'center',
                        textTransform: 'none',
                        textDecoration: 'underline',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {paymentType === 'UniversalBank'
                        ? 'Uzcard / Humo'
                        : paymentType === 'COD'
                          ? 'Kapıda Ödeme'
                          : 'Kredi veya Banka Kartı'}
                    </Typography>
                  </Box>
                </Typography>
              }
              collapsible
            >
              <Stack pb={{ xs: 1, sm: 2 }} pt={{ sm: 1 }} pl={{ sm: 1 }} pr={1} gap={1.5}>
                <Stack>
                  <Stack
                   onClick={() => {
                    if (codAvailable) setPaymentType('COD');
                  }}
                  
                    sx={{
                      ...styles.checkbox,
                     
                    }}
                  >
                    <Checkbox
                    disabled={!codAvailable}
                      size="small"
                      checked={paymentType === 'COD'}
                    />
                    <Typography
                      variant="warningSemibold"
                      sx={{
                        opacity:
                          orderSummary?.cashOnDeliveryAvailability.isAvailable === false ? 0.7 : 1,
                      }}
                    >
                      Kapıda Ödeme
                    </Typography>
                  </Stack>
                </Stack>
                <Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    onClick={() => setPaymentType('Stripe')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Checkbox size="small" checked={paymentType === 'Stripe'} />
                    <Typography variant="warningSemibold">Kredi veya Banka Kart</Typography>
                  </Stack>
                  <Card
                    border
                    sx={{
                      ml: { xs: 1.5, sm: 5 },
                      gap: 2,
                      p: 1.5,
                      maxWidth: { xs: '100%', sm: 350 },
                    }}
                  >
                    <Stack direction="row" gap={1.5}>
                      {['visa', 'mastercard', 'amex', 'apple_pay', 'google_pay'].map((e) => (
                        <Image
                          src={`/static/images/${e}.png`}
                          alt={e}
                          width={36}
                          height={28}
                          style={{ objectFit: 'contain' }}
                        />
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              </Stack>
            </Card>
            {!isMobile && (
              <Card
                border
                iconName="shopping_bag"
                title={`Sepetinizdeki Ürünler (${numSelected})`}
                collapsible
                defaultCollapsed
              >
                <Stack sx={styles.products}>
                  {selected?.map((e, i) => (
                    <Stack gap={2} px={2} key={JSON.stringify(e)}>
                      <ShopCartProductCard data={e} />
                      {i < selected.length - 1 && <Divider flexItem />}
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}
          </PrimaryColumn>
          <SecondaryColumn>
            <CheckoutCard
              title="Sipariş Özeti"
              numSelected={numSelected}
              orderSummary={orderSummary}
              loading={summaryLoading}
              discountCode={discountCode}
              onSubmitDiscountCode={setDiscountCode}
              showLines
              action={
                <Stack gap={2}>
                  {/* <Banner noIcon variant={termsError ? 'error' : 'neutral'} border ref={termsRef}>
                    <Stack direction="row" alignItems="center">
                      <Checkbox
                        size="small"
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          setTermsError(false);
                        }}
                      />
                      <Typography sx={styles.terms}>
                        {t.rich('cart.page.checkoutCard.terms', {
                          terms: (chunks) => (
                            <Link href="/terms-of-service" colored>
                              {chunks}
                            </Link>
                          ),
                          privacy: (chunks) => (
                            <Link href="/privacy-policy" colored>
                              {chunks}
                            </Link>
                          ),
                        })}
                      </Typography>
                    </Stack>
                  </Banner> */}
                  <Button
                    loading={continueButtonLoading}
                    variant="contained"
                    arrow="end"
                    disabled={
                      !selected?.length ||
                      summaryLoading ||
                      (paymentType === 'COD' &&
                        orderSummary?.cashOnDeliveryAvailability.isAvailable === false)
                    }
                    onClick={handleCheckout}
                  >
                    Ödemeye Geç
                  </Button>
                </Stack>
              }
            />
            {isMobile && (
              <Card
                border
                iconName="shopping_bag"
                title={`Sepetinizdeki Ürünler (${numSelected})`}
                collapsible
                defaultCollapsed={!isMobile}
              >
                <Stack sx={styles.products}>
                  {selected?.map((e, i) => (
                    <Stack gap={2} px={2} key={JSON.stringify(e)}>
                      <ShopCartProductCard data={e} />
                      {i < selected.length - 1 && <Divider flexItem />}
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}
            {isMobile && (
              <Stack sx={styles.mobileCheckoutBar}>
                <Box onClick={() => setSummaryModalOpen((prev) => !prev)}>
                  <InfoItem
                    sx={{ gap: 0 }}
                    label="Ödenecek Toplam"
                    value={
                      <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }}>
                        {formatPrice(orderSummary?.totalDue ?? 0, orderSummary?.currency ?? 'TRY')}
                        <Icon name="expand_more" sx={styles.expandIcon(summaryModalOpen)} />
                      </Stack>
                    }
                  />
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  arrow="end"
                  disabled={!selected?.length}
                  onClick={handleCheckout}
                >
                  Ödeme
                </Button>
                <ModalCard
                  open={summaryModalOpen}
                  onClose={() => setSummaryModalOpen(false)}
                  BodyProps={{ sx: { p: 0 } }}
                  sx={{ zIndex: 1297, mb: '112px', '& .MuiBackdrop-root': { bottom: 112 } }}
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
              </Stack>
            )}
          </SecondaryColumn>
        </TwoColumnLayout>
      </Stack>
      <NewAddressModal
        open={newAddressModalOpen}
        onClose={() => {
          setNewAddressModalOpen(false);
          setContinueButtonLoading(false);
        }}
        onAddressAdded={handleAddressAdded}
        defaultName="Adresim"
      />
    </>
  );
};

export default CheckoutPageView;
