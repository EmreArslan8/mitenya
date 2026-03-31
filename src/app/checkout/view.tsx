'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import AddressSelector from '@/components/AddressSelector';
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
import { buildAttributionFromDocument } from '@/lib/analytics/attribution';
import { AddressData, PaymentType, ShopOrderSummaryData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { readStoredWelcomeCoupon, storeWelcomeCoupon } from '@/lib/shop/welcomeCoupon';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import formatPrice from '@/lib/utils/formatPrice';
import { pushItemToDataLayer, useCheckoutAnalytics } from '@/lib/utils/googleAnalytics';
import { onMetaPixelReady, trackInitiateCheckout } from '@/lib/analytics/metaPixel';
import {
  generatePreInfoHtml,
  generateDistanceSaleHtml,
  type ContractData,
} from '@/lib/legal/contractTemplates';
import LegalDocumentModal from '@/components/contracts/LegalDocumentModal';
import { Box, Checkbox, Divider, Snackbar, Stack, Typography, debounce } from '@mui/material';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useStyles from './styles';
import { Check, CheckCircle, ChevronDown, CreditCard, ShoppingBag, Truck } from 'lucide-react';

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
  const [orderSummary, setOrderSummary] = useState<ShopOrderSummaryData | undefined>();
  const [discountCode, setDiscountCode] = useState<string | null>(searchParams?.get('dc') ?? null);
  const attribution = useMemo(
    () =>
      typeof document !== 'undefined'
        ? buildAttributionFromDocument(document.cookie, {
            referrer: document.referrer || undefined,
          })
        : null,
    []
  );
  const affiliateCode = attribution?.affiliateCode ?? null;
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [continueButtonLoading, setContinueButtonLoading] = useState(false);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [directToPaymentOnAddressAdded, setDirectToPaymentOnAddressAdded] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [showDiscountCodeSnackbar, setShowDiscountCodeSnackbar] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [preInfoAccepted, setPreInfoAccepted] = useState(false);
  const [distanceSaleAccepted, setDistanceSaleAccepted] = useState(false);
  const [preInfoModalOpen, setPreInfoModalOpen] = useState(false);
  const [distanceSaleModalOpen, setDistanceSaleModalOpen] = useState(false);
  const mobileCheckoutBarOffset = 'calc(56px + env(safe-area-inset-bottom, 0px) - 2px)';
  const handleDestinationChange = (newValue: AddressData) => setDestination(newValue);
  const handleAddressAdded = (newAddress: AddressData) => {
    setDestination(newAddress);
    setAddresses((prev) => [...(prev ?? []), newAddress]);
  };

  const handleCheckoutRef = useRef<() => Promise<void>>(async () => {});

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
      setCheckoutError('Devam etmek için lütfen giriş yapın.');
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

      // Sözleşme HTML'lerini oluştur
      const consents = contractData
        ? {
            pre_info_accepted: preInfoAccepted,
            distance_sale_accepted: distanceSaleAccepted,
            pre_info_html: generatePreInfoHtml(contractData),
            distance_sale_html: generateDistanceSaleHtml(contractData),
          }
        : undefined;

        
      const endpoint = paymentType === 'COD' ? '/api/orders/create' : '/api/checkout/session';
      const response = await fetch(
        endpoint,
        withCsrfHeaders({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: customerData.email,
            items: orderItems,
            shipping_address: shippingAddress,
            payment_method: paymentType === 'COD' ? 'cod' : 'paytr',
            shipping_cost: orderSummary?.shipmentCost || 0,
            discount_amount: orderSummary?.promotionDiscount || 0,
            discount_code: discountCode,
            affiliate_code: orderSummary?.affiliateCode ?? affiliateCode,
            attribution,
            currency: 'TRY',
            consents,
          }),
        })
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sipariş oluşturulamadı');
      }

      if (paymentType !== 'COD') {
        const checkoutSessionId = data?.checkoutSessionId;
        if (!checkoutSessionId) {
          throw new Error('Checkout session oluşturulamadı');
        }
        const tokenParam = data?.success_token ? `?t=${encodeURIComponent(data.success_token)}` : '';
        router.push(`/payment/${encodeURIComponent(checkoutSessionId)}${tokenParam}`);
        return;
      }

      removeItems(selected);
      const tokenParam = data?.success_token ? `?t=${encodeURIComponent(data.success_token)}` : '';
      router.push(`/success${tokenParam}`);
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Bir hata oluştu';
      setCheckoutError(message);
    } finally {
      setContinueButtonLoading(false);
    }
  };

  // Ref'i her render'da güncelle — stale closure'ı engeller
  handleCheckoutRef.current = handleCheckout;

  const handleUpdateOrderSummary = useCallback(
    debounce(async (selected, destination, paymentType, discountCode) => {
      try {
        const data = await getOrderSummary({
          products: selected,
          destination,
          discountCode,
          draftPaymentMethod: paymentType,
        });
        setOrderSummary(data?.orderSummary);
      } catch {
        // summary yüklenemedi, mevcut değer korunur
      } finally {
        setSummaryLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    const queryCode = searchParams?.get('dc')?.trim().toUpperCase() ?? null;
    const storedCode = readStoredWelcomeCoupon();
    const nextCode = queryCode || storedCode;

    if (!nextCode || discountCode === nextCode) return;

    storeWelcomeCoupon(nextCode);
    setDiscountCode(nextCode);
    pushItemToDataLayer({
      event: 'promo_code_applied',
      promo_location: 'checkout',
      promo_code: nextCode,
      apply_method: queryCode ? 'query' : 'auto',
    });
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated === false && !searchParams?.get('allow')) {
      router.push('/cart');
    }
  }, [isAuthenticated, router, searchParams]);

  useEffect(() => {
    if (!selected?.length) return setOrderSummary(undefined);
    if (isAuthenticated === undefined) return;
    setSummaryLoading(true);
    handleUpdateOrderSummary(selected, destination, paymentType, discountCode);
  }, [selected, destination, paymentType, discountCode, isAuthenticated]);

  useEffect(() => {
    if (!selected?.length) return;
    sendBeginCheckout(selected);
    return onMetaPixelReady(() => {
      trackInitiateCheckout({
        content_ids: selected.map((p) => String(p.id)),
        value: selected.reduce((acc, p) => acc + p.price.currentPrice * p.quantity, 0),
        currency: selected[0]?.price.currency ?? 'TRY',
        num_items: selected.reduce((acc, p) => acc + p.quantity, 0),
      });
    });
  }, [selected]);

  // Adres, ürün veya ödeme yöntemi değiştiğinde sözleşme onaylarını sıfırla
  useEffect(() => {
    setPreInfoAccepted(false);
    setDistanceSaleAccepted(false);
  }, [destination, selected, paymentType]);

  const paymentMethodLabel =
    paymentType === 'COD'
      ? 'Kapıda Ödeme'
      : paymentType === 'UniversalBank'
        ? 'Uzcard / Humo'
        : 'Kredi / Banka Kartı';

  const contractData = useMemo((): ContractData | null => {
    if (!selected?.length) return null;

    const buyerAddress = destination
      ? [
          destination.line1,
          destination.line2,
          destination.district,
          destination.city,
          destination.postcode,
        ]
          .filter(Boolean)
          .join(', ')
      : '';

    return {
      buyer: {
        fullName: destination
          ? `${destination.contactName} ${destination.contactSurname}`
          : (customerData?.fullName ?? ''),
        address: buyerAddress,
        phone: destination
          ? `${destination.phoneCode}${destination.phoneNumber}`
          : (customerData?.phone ?? ''),
        email: customerData?.email ?? '',
      },
      products: selected.map((item) => {
        const variantStr = item.variants
          ?.map((v) => {
            const sel = v.options.find((o) => o.selected);
            return sel ? `${v.name}: ${sel.value}` : null;
          })
          .filter(Boolean)
          .join(', ');
        return {
          name: item.name || '',
          quantity: item.quantity,
          unitPrice: item.price.currentPrice,
          totalPrice: item.price.currentPrice * item.quantity,
          variant: variantStr || undefined,
        };
      }),
      orderSummary: {
        subtotal: orderSummary?.productCost ?? 0,
        shippingCost: orderSummary?.shipmentCost ?? 0,
        discount: orderSummary?.totalDiscount ?? 0,
        total: orderSummary?.totalDue ?? 0,
        currency: orderSummary?.currency ?? 'TRY',
      },
      paymentMethod: paymentMethodLabel,
      deliveryAddress: buyerAddress,
      date: new Date().toLocaleDateString('tr-TR'),
    };
  }, [destination, selected, customerData, orderSummary, paymentMethodLabel]);

  useEffect(() => {
    if (!directToPaymentOnAddressAdded || !orderSummary) return;
    setDirectToPaymentOnAddressAdded(false);
    void handleCheckoutRef.current();
  }, [directToPaymentOnAddressAdded, orderSummary]);

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
      <Snackbar
        open={!!checkoutError}
        autoHideDuration={4000}
        onClose={() => setCheckoutError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Banner variant="error" title={checkoutError ?? ''} sx={{ width: '100%' }} />
      </Snackbar>
      {!orderSummary && <LoadingOverlay loading />}
      <Stack gap={3}>
        <TwoColumnLayout sx={{ pb: 3, gap: { xs: 2, sm: 3 } }}>
          <PrimaryColumn>
            <Card
              border
              customIcon={
                <Box component="span" sx={{ color: 'secondary.main', display: 'inline-flex' }}>
                  <Truck size={20} />
                </Box>
              }
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
                    <Check size={16} strokeWidth={3} />
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
                      icon={<CheckCircle size={20} />}
                    />
                  </Card>
                </Stack>
              </Stack>
            </Card>
            <Card
              border
              customIcon={
                <Box component="span" sx={{ color: 'secondary.main', display: 'inline-flex' }}>
                  <CreditCard size={20} />
                </Box>
              }
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
                    <Check size={16} strokeWidth={3} />
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
                {/* <Stack>
                  <Stack
                    onClick={() => {
                      if (codAvailable) setPaymentType('COD');
                    }}
                    sx={{
                      ...styles.checkbox,
                    }}
                  >
                    <Checkbox disabled={!codAvailable} size="small" checked={paymentType === 'COD'} />
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
                </Stack> */}
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
                      {['visa', 'mastercard', 'troy'].map((e) => (
                        <Image
                          src={`/static/images/${e}.svg`}
                          alt={e}
                          key={e}
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
                customIcon={
                  <Box component="span" sx={{ color: 'primary.main', display: 'inline-flex' }}>
                    <ShoppingBag size={20} />
                  </Box>
                }
                title={`Sepetinizdeki Ürünler (${numSelected})`}
                collapsible
                defaultCollapsed
              >
                <Stack sx={styles.products}>
                  {selected?.map((e, i) => (
                    <Stack gap={2} px={2} key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
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
                <Stack gap={1.5}>
                  <Stack gap={0.5}>
                    <Stack direction="row" alignItems="flex-start">
                      <Checkbox
                        size="small"
                        checked={preInfoAccepted}
                        onChange={(e) => setPreInfoAccepted(e.target.checked)}
                        sx={{ mt: -0.5 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: 13, lineHeight: '20px' }}>
                        <span
                          style={{ textDecoration: 'underline', cursor: 'pointer' }}
                          onClick={() => setPreInfoModalOpen(true)}
                        >
                          Ön Bilgilendirme Formu
                        </span>
                        {`'nu okudum ve kabul ediyorum.`}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="flex-start">
                      <Checkbox
                        size="small"
                        checked={distanceSaleAccepted}
                        onChange={(e) => setDistanceSaleAccepted(e.target.checked)}
                        sx={{ mt: -0.5 }}
                      />
                      <Typography variant="body2" sx={{ fontSize: 13, lineHeight: '20px' }}>
                        <span
                          style={{ textDecoration: 'underline', cursor: 'pointer' }}
                          onClick={() => setDistanceSaleModalOpen(true)}
                        >
                          Mesafeli Satış Sözleşmesi
                        </span>
                        {`'ni okudum ve kabul ediyorum.`}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Button
                    loading={continueButtonLoading}
                    variant="contained"
                    arrow="end"
                    disabled={
                      !selected?.length ||
                      summaryLoading ||
                      !preInfoAccepted ||
                      !distanceSaleAccepted ||
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
                customIcon={
                  <Box component="span" sx={{ color: 'primary.main', display: 'inline-flex' }}>
                    <ShoppingBag size={20} />
                  </Box>
                }
                title={`Sepetinizdeki Ürünler (${numSelected})`}
                collapsible
                defaultCollapsed={!isMobile}
              >
                <Stack sx={styles.products}>
                  {selected?.map((e, i) => (
                    <Stack gap={2} px={2} key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
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
                  disabled={
                    !selected?.length ||
                    !preInfoAccepted ||
                    !distanceSaleAccepted ||
                    (paymentType === 'COD' &&
                      orderSummary?.cashOnDeliveryAvailability.isAvailable === false)
                  }
                  onClick={handleCheckout}
                >
                  Ödeme
                </Button>
                <ModalCard
                  open={summaryModalOpen}
                  onClose={() => setSummaryModalOpen(false)}
                  layout="bottom-sheet"
                  bottomOffset={mobileCheckoutBarOffset}
                  BodyProps={{ sx: { p: 0 } }}
                  sx={{ zIndex: 1297 }}
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
      <LegalDocumentModal
        open={preInfoModalOpen}
        title="Ön Bilgilendirme Formu"
        html={contractData ? generatePreInfoHtml(contractData) : ''}
        onClose={() => setPreInfoModalOpen(false)}
      />
      <LegalDocumentModal
        open={distanceSaleModalOpen}
        title="Mesafeli Satış Sözleşmesi"
        html={contractData ? generateDistanceSaleHtml(contractData) : ''}
        onClose={() => setDistanceSaleModalOpen(false)}
      />
    </>
  );
};

export default CheckoutPageView;
