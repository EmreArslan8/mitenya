'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import AddressForm from '@/components/AddressCard/AddressForm';
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
import {
  readGuestCheckoutDraft,
  saveGuestCheckoutDraft,
} from '@/lib/checkout/guestCheckoutStorage';
import useScreen from '@/lib/hooks/useScreen';
import { readStoredWelcomeCoupon, storeWelcomeCoupon } from '@/lib/shop/welcomeCoupon';
import { withCsrfHeaders } from '@/lib/utils/csrf';
import formatPrice from '@/lib/utils/formatPrice';
import { pushItemToDataLayer, useCheckoutAnalytics } from '@/lib/utils/googleAnalytics';
import { onMetaPixelReady, trackInitiateCheckout } from '@/lib/analytics/metaPixel';
import {
  trackTikTokAddPaymentInfo,
  trackTikTokInitiateCheckout,
  trackTikTokWithUser,
} from '@/lib/analytics/tiktokPixel';
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
  const { isAuthenticated, isGuest, customerData, openAuthenticator, signInAsGuest } = useAuth();
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
  const [guestChoiceLoading, setGuestChoiceLoading] = useState(false);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [directToPaymentOnAddressAdded, setDirectToPaymentOnAddressAdded] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [showDiscountCodeSnackbar, setShowDiscountCodeSnackbar] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestInitialValues, setGuestInitialValues] = useState<Partial<AddressData>>();
  const [guestLiveAddress, setGuestLiveAddress] = useState<Partial<AddressData>>();
  const [guestAddressReady, setGuestAddressReady] = useState(false);
  const [preInfoAccepted, setPreInfoAccepted] = useState(false);
  const [distanceSaleAccepted, setDistanceSaleAccepted] = useState(false);
  const [addressFormTrigger, setAddressFormTrigger] = useState(0);
  const [preInfoModalOpen, setPreInfoModalOpen] = useState(false);
  const [distanceSaleModalOpen, setDistanceSaleModalOpen] = useState(false);
  const mobileCheckoutBarOffset = 'calc(56px + env(safe-area-inset-bottom, 0px) - 2px)';
  const handleDestinationChange = (newValue: AddressData) => setDestination(newValue);
  const tikTokUserRef = useRef<{ email?: string; phone?: string }>();
  const handleAddressAdded = (newAddress: AddressData) => {
    setDestination(newAddress);
    setAddresses((prev) => [...(prev ?? []), newAddress]);
  };
  const isCompleteGuestAddress = (address: Partial<AddressData>) =>
    !!(
      address.contactName &&
      address.contactSurname &&
      address.phoneNumber &&
      address.line1 &&
      address.city &&
      address.district &&
      address.email
    );

  const handleCheckoutRef = useRef<() => Promise<void>>(async () => {});
  const summaryLoadingRef = useRef(false);

  const handleCheckout = async () => {
    if (summaryLoading || !selected || selected.length === 0) return;
    if (isAuthenticated === undefined) return;

    if (isAuthenticated === false) {
      setCheckoutError('Devam etmek için giriş yapın veya misafir olarak devam edin.');
      return;
    }

    // Misafir için önce inline adres formunu submit edip değerleri state'e al.
    if (isGuest && !guestAddressReady) {
      setGuestAddressReady(false);
      setDirectToPaymentOnAddressAdded(true);
      setAddressFormTrigger((prev) => prev + 1);
      return;
    }

    // Adres kontrolü
    if (!destination) {
      setNewAddressModalOpen(true);
      setDirectToPaymentOnAddressAdded(true);
      return;
    }

    const effectiveEmail = customerData?.email ?? guestEmail;
    if (!effectiveEmail) {
      setCheckoutError('Devam etmek için lütfen e-posta adresinizi girin.');
      return;
    }

    setContinueButtonLoading(true);

    try {
      // Analytics gönder
      if (orderSummary) {
        sendAddShippingInfo(selected, orderSummary);
        sendAddPaymentInfo(selected, orderSummary, paymentType);
        trackTikTokWithUser({
          userData: {
            email: customerData?.email,
            phone: destination ? `${destination.phoneCode}${destination.phoneNumber}` : customerData?.phone,
          },
          track: () => trackTikTokAddPaymentInfo({
            content_ids: selected.map((p) => String(p.id)),
            contents: selected.map((p) => ({
              content_id: String(p.id),
              content_type: 'product',
              content_name: p.name,
              num_items: p.quantity,
            })),
            value: orderSummary.totalDue,
            currency: orderSummary.currency ?? 'TRY',
            num_items: selected.reduce((acc, p) => acc + p.quantity, 0),
            payment_type: paymentType,
          }),
        });
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
            user_email: effectiveEmail,
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
      if (isGuest) setGuestAddressReady(false);
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
        summaryLoadingRef.current = false;
      }
    }, 1000),
    []
  );

  const handleStartGuestCheckout = async () => {
    setGuestChoiceLoading(true);
    try {
      await signInAsGuest();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Misafir oturumu başlatılamadı';
      setCheckoutError(message);
    } finally {
      setGuestChoiceLoading(false);
    }
  };

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
    if (!isGuest) return;

    const draft = readGuestCheckoutDraft();
    if (!draft) return;

    setGuestInitialValues(draft.address);
    setGuestEmail(draft.email);
    if (isCompleteGuestAddress(draft.address)) {
      setDestination(draft.address as AddressData);
    }
    setGuestAddressReady(false);
  }, [isGuest]);

  useEffect(() => {
    if (!selected?.length) return setOrderSummary(undefined);
    if (isAuthenticated === undefined) return;
    setSummaryLoading(true);
    summaryLoadingRef.current = true;
    handleUpdateOrderSummary(selected, destination, paymentType, discountCode);
  }, [selected, destination, paymentType, discountCode, isAuthenticated]);

  useEffect(() => {
    tikTokUserRef.current = {
      email: customerData?.email,
      phone: destination ? `${destination.phoneCode}${destination.phoneNumber}` : customerData?.phone,
    };
  }, [customerData?.email, customerData?.phone, destination]);

  useEffect(() => {
    if (!selected?.length) return;
    sendBeginCheckout(selected);
    const params = {
      content_ids: selected.map((p) => String(p.id)),
      contents: selected.map((p) => ({
        content_id: String(p.id),
        content_type: 'product' as const,
        content_name: p.name,
        num_items: p.quantity,
      })),
      value: selected.reduce((acc, p) => acc + p.price.currentPrice * p.quantity, 0),
      currency: selected[0]?.price.currency ?? 'TRY',
      num_items: selected.reduce((acc, p) => acc + p.quantity, 0),
    };
    const cleanupMeta = onMetaPixelReady(() => {
      trackInitiateCheckout({
        ...params,
      });
    });
    const cleanupTikTok = trackTikTokWithUser({
      userData: tikTokUserRef.current,
      track: () => trackTikTokInitiateCheckout(params),
    });

    return () => {
      cleanupMeta();
      cleanupTikTok();
    };
  }, [selected]);

  // Ürün veya ödeme yöntemi değiştiğinde sözleşme onaylarını sıfırla
  useEffect(() => {
    setPreInfoAccepted(false);
    setDistanceSaleAccepted(false);
  }, [selected, paymentType]);

  // Kayıtlı kullanıcı farklı adres seçtiğinde sıfırla
  // Misafir için destination form gönderiminden gelir; onaylar o sırada zaten doğrudur
  useEffect(() => {
    if (isGuest) return;
    setPreInfoAccepted(false);
    setDistanceSaleAccepted(false);
  }, [destination, isGuest]);


  const paymentMethodLabel =
    paymentType === 'COD'
      ? 'Kapıda Ödeme'
      : paymentType === 'UniversalBank'
        ? 'Uzcard / Humo'
        : 'Kredi / Banka Kartı';

  const contractData = useMemo((): ContractData | null => {
    if (!selected?.length) return null;

    // Misafir için destination henüz set edilmemişse canlı form verisi kullan
    const effectiveAddr = destination ?? (isGuest ? guestLiveAddress : undefined);

    const buyerAddress = effectiveAddr
      ? [
          effectiveAddr.line1,
          effectiveAddr.line2,
          effectiveAddr.district,
          effectiveAddr.city,
          effectiveAddr.postcode,
        ]
          .filter(Boolean)
          .join(', ')
      : '';

    return {
      buyer: {
        fullName: effectiveAddr
          ? `${effectiveAddr.contactName} ${effectiveAddr.contactSurname}`
          : (customerData?.fullName ?? ''),
        address: buyerAddress,
        phone: effectiveAddr
          ? `${effectiveAddr.phoneCode}${effectiveAddr.phoneNumber}`
          : (customerData?.phone ?? ''),
        email: customerData?.email ?? guestEmail,
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
  }, [destination, isGuest, guestLiveAddress, selected, customerData, guestEmail, orderSummary, paymentMethodLabel]);

  useEffect(() => {
    if (!directToPaymentOnAddressAdded) return;
    if (!orderSummary) return;
    // summaryLoadingRef is set synchronously before this effect runs in the same
    // render cycle, so it correctly blocks when destination just changed.
    if (summaryLoadingRef.current) return;
    if (isGuest && !guestAddressReady) return;
    setDirectToPaymentOnAddressAdded(false);
    void handleCheckoutRef.current();
  }, [directToPaymentOnAddressAdded, orderSummary, summaryLoading, isGuest, guestAddressReady]);

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
                    {isAuthenticated === undefined ? (
                      <Stack alignItems="center" justifyContent="center" minHeight={120}>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                          Oturum kontrol ediliyor...
                        </Typography>
                      </Stack>
                    ) : isAuthenticated === false ? (
                      <Stack gap={{ xs: 1.5, sm: 1 }} sx={{ width: '100%', maxWidth: 420 }}>
                        <Stack gap={0.5}>
                          <Typography
                            sx={{
                              fontSize: { xs: 16, sm: 12.5 },
                              color: 'text.secondary',
                              lineHeight: { xs: 1.45, sm: 1.35 },
                            }}
                          >
                            Kayıtlı adreslerinle devam edebilir veya misafir olarak sipariş verebilirsin.
                          </Typography>
                        </Stack>
                        <Stack gap={{ xs: 1.5, sm: 0.5 }} sx={{ width: '100%' }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => openAuthenticator?.({ onSuccess: () => router.refresh() })}
                            sx={{
                              minHeight: { xs: 56, sm: 36 },
                              borderRadius: 1,
                              borderColor: 'text.primary',
                              borderWidth: { xs: 2, sm: 1 },
                              color: 'text.primary',
                              fontSize: { xs: 15, sm: 12 },
                              fontWeight: 800,
                              '&:hover': {
                                borderColor: 'text.primary',
                                borderWidth: { xs: 2, sm: 1 },
                                backgroundColor: 'rgba(0,0,0,0.035)',
                              },
                            }}
                          >
                            GİRİŞ YAP
                          </Button>
                          <Button
                            variant="text"
                            fullWidth
                            loading={guestChoiceLoading}
                            onClick={handleStartGuestCheckout}
                            sx={{
                              minHeight: { xs: 34, sm: 32 },
                              borderRadius: 1,
                              fontSize: { xs: 15, sm: 12 },
                              fontWeight: 800,
                              color: 'text.primary',
                              textDecoration: 'underline',
                              textUnderlineOffset: '4px',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            MİSAFİR OLARAK DEVAM ET →
                          </Button>
                        </Stack>
                      </Stack>
                    ) : isGuest ? (
                      <AddressForm
                        showEmail
                        autoName="Teslimat Adresi"
                        initialValues={guestInitialValues}
                        submitTrigger={addressFormTrigger}
                        onDraftChange={(addr) => {
                          saveGuestCheckoutDraft(addr);
                          setGuestEmail(addr.email ?? '');
                          setGuestLiveAddress(addr);
                        }}
                        onSubmit={(addr) => {
                          saveGuestCheckoutDraft(addr);
                          setDestination(addr);
                          setGuestEmail(addr.email ?? '');
                          setGuestAddressReady(true);
                        }}
                      />
                    ) : (
                      <AddressSelector
                        value={destination}
                        options={addresses}
                        onAddressAdded={handleAddressAdded}
                        onChange={handleDestinationChange}
                      />
                    )}
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
                      isAuthenticated === undefined ||
                      isAuthenticated === false ||
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
                    summaryLoading ||
                    isAuthenticated === undefined ||
                    isAuthenticated === false ||
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
