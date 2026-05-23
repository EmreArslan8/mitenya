'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import AddressSelector from '@/components/AddressSelector';
import LoadingOverlay from '@/components/LoadingOverlay';
import CheckoutCard from '@/components/ShoppingCart/CheckoutCard';
import ShopCartProductCard from '@/components/ShoppingCart/ShopCartProductCard';
import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
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
import { pushItemToDataLayer, useCheckoutAnalytics } from '@/lib/utils/googleAnalytics';
import { onMetaPixelReady, trackInitiateCheckout } from '@/lib/analytics/metaPixel';
import { sendCapiFromClient, generateCapiEventId } from '@/lib/analytics/sendCapiFromClient';
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
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  debounce,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useStyles from './styles';
import { Check, Info } from 'lucide-react';

export interface CheckoutPageViewProps {
  initialAddresses?: AddressData[] | null;
}

const getCheckoutErrorMessage = (data: unknown) => {
  if (!data || typeof data !== 'object') return 'Sipariş oluşturulamadı';
  const body = data as {
    error?: unknown;
    details?: {
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
    };
  };
  const fieldErrors = body.details?.fieldErrors;
  const firstFieldError = fieldErrors
    ? Object.entries(fieldErrors).find(([, messages]) => messages?.length)
    : null;

  if (firstFieldError) {
    const [field, messages] = firstFieldError;
    return `${field}: ${messages?.[0]}`;
  }

  const formError = body.details?.formErrors?.[0];
  if (formError) return formError;
  if (typeof body.error === 'string') return body.error;
  return 'Sipariş oluşturulamadı';
};

const CheckoutPageView = ({ initialAddresses }: CheckoutPageViewProps) => {
  const { isMobile } = useScreen();
  const styles = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, customerData, openAuthenticator } = useAuth();
  const { sendBeginCheckout, sendAddShippingInfo, sendAddPaymentInfo } = useCheckoutAnalytics();
  const { selected, numSelected, removeItems } = useContext(ShopContext);
  const [addresses, setAddresses] = useState<AddressData[]>(initialAddresses ?? []);
  const [destination, setDestination] = useState<AddressData | undefined>(initialAddresses?.[0]);
  const [paymentType] = useState<PaymentType>('PayTR');
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
  const [showDiscountCodeSnackbar, setShowDiscountCodeSnackbar] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailError, setGuestEmailError] = useState('');
  const effectiveEmail = (customerData?.email || guestEmail).trim();
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billingAddress, setBillingAddress] = useState<AddressData | undefined>();
  const [preInfoAccepted, setPreInfoAccepted] = useState(false);
  const [distanceSaleAccepted, setDistanceSaleAccepted] = useState(false);
  const [preInfoModalOpen, setPreInfoModalOpen] = useState(false);
  const [distanceSaleModalOpen, setDistanceSaleModalOpen] = useState(false);
  const handleDestinationChange = (newValue: AddressData) => setDestination(newValue);
  const tikTokUserRef = useRef<{ email?: string; phone?: string }>();
  const handleAddressAdded = (newAddress: AddressData) => {
    setDestination(newAddress);
    setAddresses((prev) => [...(prev ?? []), newAddress]);
    setOrderSummary(undefined);
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

    // Fatura adresi kontrolü
    if (billingDifferent && !billingAddress) {
      setCheckoutError('Fatura adresi seçiniz veya ekleyiniz.');
      return;
    }

    // Email kontrolü
    if (!effectiveEmail) {
      setGuestEmailError('E-posta adresinizi girin.');
      return;
    }
    if (!isAuthenticated && !isValidEmail(effectiveEmail)) {
      setGuestEmailError('Geçerli bir e-posta adresi girin.');
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
            email: effectiveEmail || undefined,
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
        postalCode: destination.postcode || undefined,
        country: destination.countryCode,
        phone: `${destination.phoneCode}${(destination.phoneNumber ?? '').replace(/^0+/, '')}`,
      };

      // Sözleşme HTML'i server tarafında güvenilir sipariş özetiyle oluşturulur.
      const consents = {
        pre_info_accepted: preInfoAccepted,
        distance_sale_accepted: distanceSaleAccepted,
      };

        
      const endpoint = paymentType === 'COD' ? '/api/orders/create' : '/api/checkout/session';
      const response = await fetch(
        endpoint,
        withCsrfHeaders({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: effectiveEmail,
            guest_email: !isAuthenticated ? effectiveEmail : undefined,
            items: orderItems,
            shipping_address: shippingAddress,
            billing_address: (billingDifferent && billingAddress) ? {
              contactName: `${billingAddress.contactName} ${billingAddress.contactSurname}`,
              line1: billingAddress.line1,
              line2: billingAddress.line2,
              city: billingAddress.city,
              district: billingAddress.district,
              postalCode: billingAddress.postcode || undefined,
              country: billingAddress.countryCode,
              phone: `${billingAddress.phoneCode}${(billingAddress.phoneNumber ?? '').replace(/^0+/, '')}`,
            } : undefined,
            payment_method: paymentType === 'COD' ? 'cod' : 'paytr',
            discount_code: discountCode,
            affiliate_code: orderSummary?.affiliateCode ?? affiliateCode,
            attribution,
            currency: 'TRY',
            consents,
          }),
        })
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn('Checkout request failed', data);
        throw new Error(getCheckoutErrorMessage(data));
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
    if (selected != null && selected.length === 0) {
      router.replace('/cart');
      return;
    }
    if (!selected?.length) return setOrderSummary(undefined);
    if (isAuthenticated === undefined) return;
    setSummaryLoading(true);
    handleUpdateOrderSummary(selected, destination, paymentType, discountCode);
  }, [selected, destination, paymentType, discountCode, isAuthenticated]);

  useEffect(() => {
    tikTokUserRef.current = {
      email: effectiveEmail || undefined,
      phone: destination ? `${destination.phoneCode}${destination.phoneNumber}` : customerData?.phone,
    };
  }, [effectiveEmail, customerData?.phone, destination]);

  useEffect(() => {
    if (!selected?.length) return;
    sendBeginCheckout(selected);
    const initiateCheckoutEventId = generateCapiEventId('ic');
    const totalValue = selected.reduce((acc, p) => acc + p.price.currentPrice * p.quantity, 0);
    const currency = selected[0]?.price.currency ?? 'TRY';
    const numItems = selected.reduce((acc, p) => acc + p.quantity, 0);
    const params = {
      content_ids: selected.map((p) => String(p.id)),
      contents: selected.map((p) => ({
        content_id: String(p.id),
        content_type: 'product' as const,
        content_name: p.name,
        num_items: p.quantity,
      })),
      value: totalValue,
      currency,
      num_items: numItems,
    };
    const cleanupMeta = onMetaPixelReady(() => {
      trackInitiateCheckout({ ...params, eventID: initiateCheckoutEventId });
    });
    sendCapiFromClient({
      eventName: 'InitiateCheckout',
      eventId: initiateCheckoutEventId,
      contentIds: selected.map((p) => String(p.id)),
      value: totalValue,
      currency,
      numItems,
      email: tikTokUserRef.current?.email ?? undefined,
      phone: tikTokUserRef.current?.phone ?? undefined,
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
        email: effectiveEmail,
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
  }, [destination, selected, customerData, orderSummary, paymentMethodLabel, effectiveEmail]);

  useEffect(() => {
    if (!directToPaymentOnAddressAdded || !orderSummary) return;
    setDirectToPaymentOnAddressAdded(false);
    void handleCheckoutRef.current();
  }, [directToPaymentOnAddressAdded, orderSummary]);

  const cartProductsCard = (
    <Card
      border
      title={`Ürün Bilgileri (${numSelected})`}
      titleProps={{ sx: { fontSize: 16, fontWeight: 700 } }}
      sx={{ header: { textTransform: 'none' } }}
      collapsible
      defaultCollapsed={false}
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
  );

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
            {!isAuthenticated && (
              <Card
                border
                sx={{ header: { textTransform: 'none' } }}
                title={
                  <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                    Müşteri Bilgileri
                    </Typography>
                    <Stack direction="row" gap={0.5} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 14, color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={(event) => { event.stopPropagation(); openAuthenticator?.(); }}
                      >
                        Giriş Yap
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 14, color: 'text.secondary' }}>|</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 14, color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={(event) => { event.stopPropagation(); openAuthenticator?.(); }}
                      >
                        Üye Ol
                      </Typography>
                    </Stack>
                  </Stack>
                }
              >
                <Stack px={{ xs: 1.5, sm: 2 }} py={1.5}>
                <TextField
                  type="email"
                  fullWidth
                  value={guestEmail}
                  onChange={(e) => { setGuestEmail(e.target.value); setGuestEmailError(''); }}
                  onBlur={() => {
                    if (guestEmail && !isValidEmail(guestEmail))
                      setGuestEmailError('Geçerli bir e-posta adresi girin.');
                  }}
                  error={!!guestEmailError}
                  helperText={guestEmailError}
                  placeholder="E-posta"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: '#fff',
                      height: 'auto',
                      minHeight: 48,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.23)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#C1121F',
                      borderWidth: 1,
                    },
                    '& .MuiInputBase-input': {
                      padding: '13px 12px',
                      fontSize: 15,
                    },
                    '& input::placeholder': {
                      color: '#9B9BA1',
                      opacity: 1,
                    },
                  }}
                />
              </Stack>
              </Card>
            )}
            <Card
              border
              titleProps={{ sx: { fontSize: 16, fontWeight: 700 } }}
              sx={{ header: { textTransform: 'none' } }}
              title={
                <Typography
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 16,
                    fontWeight: 700,
                    gap: 0.5,
                  }}
                >
                  Teslimat Bilgileri
                  {destination && (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Check size={16} strokeWidth={3} />
                      <Typography
                        component="span"
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
                  <Card sx={{ maxWidth: '100%', gap: 1 }}>
                    <AddressSelector
                      value={destination}
                      options={addresses}
                      onAddressAdded={handleAddressAdded}
                      onChange={handleDestinationChange}
                    />
                    {/*
                    <Banner
                      title="Ücretsiz kargo avantajı"
                      variant="neutral"
                      icon={<CheckCircle size={20} />}
                    />
                    */}
                  </Card>
                </Stack>
              </Stack>
            </Card>
            <Card
                border
                title="Fatura Bilgileri"
                titleProps={{ sx: { fontSize: 16, fontWeight: 700 } }}
                sx={{ header: { textTransform: 'none' } }}
                collapsible
                defaultCollapsed={!billingDifferent}
              >
                <Stack px={{ xs: 1, sm: 2 }} py={1} gap={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.5}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => { setBillingDifferent(p => !p); setBillingAddress(undefined); }}
                  >
                    <Checkbox
                      size="small"
                      checked={billingDifferent}
                      onChange={() => { setBillingDifferent(p => !p); setBillingAddress(undefined); }}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ p: 0.5 }}
                    />
                    <Typography sx={{ fontSize: 14, lineHeight: 1.4 }}>
                      Fatura adresi teslimat adresinden farklı
                    </Typography>
                  </Stack>
                  {!billingDifferent && destination && (
                    <Stack
                      direction="row"
                      gap={1}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ color: 'text.secondary', mt: 0.2 }}>
                        <Check size={14} />
                      </Box>
                      <Stack>
                        <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600 }}>
                          {destination.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[destination.line1, destination.line2, destination.district, destination.city]
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                          Teslimat adresiyle aynı
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                  {billingDifferent && (
                    <Card sx={{ maxWidth: '100%', gap: 1 }}>
                      <AddressSelector
                        value={billingAddress}
                        options={addresses}
                        onAddressAdded={(a) => setBillingAddress(a)}
                        onChange={(a) => setBillingAddress(a)}
                      />
                    </Card>
                  )}
                </Stack>
              </Card>
            {/*
            <Card
              border
              titleProps={{ sx: { fontSize: 16, fontWeight: 700 } }}
              sx={{ header: { textTransform: 'none' } }}
              title={
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 16,
                    fontWeight: 700,
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
                <Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    onClick={() => setPaymentType('PayTR')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Checkbox size="small" checked={paymentType === 'PayTR'} />
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
            */}
          </PrimaryColumn>
          <SecondaryColumn>
            {cartProductsCard}
            <CheckoutCard
              title="Sipariş Özeti"
              hideTitleIcon
              titleProps={{ sx: { fontSize: 16, fontWeight: 700 } }}
              sx={{ header: { textTransform: 'none' } }}
              numSelected={numSelected}
              orderSummary={orderSummary}
              loading={summaryLoading}
              discountCode={discountCode}
              onSubmitDiscountCode={setDiscountCode}
              showLines
              action={
                <Stack gap={1.75}>
                  <Stack sx={styles.legalConsentGroup}>
                    <Stack sx={styles.legalConsentRow}>
                      <Checkbox
                        size="small"
                        checked={preInfoAccepted}
                        onChange={(e) => setPreInfoAccepted(e.target.checked)}
                        sx={{ p: 0, mr: 1 }}
                      />
                      <Typography variant="body2" sx={styles.legalConsentText}>
                        Ön Bilgilendirme Metnini okudum, kabul ediyorum.
                      </Typography>
                      <IconButton
                        aria-label="Ön Bilgilendirme Metni'ni görüntüle"
                        onClick={() => setPreInfoModalOpen(true)}
                        sx={styles.legalInfoButton}
                      >
                        <Info size={16} />
                      </IconButton>
                    </Stack>
                    <Stack sx={styles.legalConsentRow}>
                      <Checkbox
                        size="small"
                        checked={distanceSaleAccepted}
                        onChange={(e) => setDistanceSaleAccepted(e.target.checked)}
                        sx={{ p: 0, mr: 1 }}
                      />
                      <Typography variant="body2" sx={styles.legalConsentText}>
                        Mesafeli Satış Sözleşmesini okudum ve kabul ediyorum.
                      </Typography>
                      <IconButton
                        aria-label="Mesafeli Satış Sözleşmesi'ni görüntüle"
                        onClick={() => setDistanceSaleModalOpen(true)}
                        sx={styles.legalInfoButton}
                      >
                        <Info size={16} />
                      </IconButton>
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
                    sx={{ py: 1.5, borderRadius: 0.75, fontSize: 16, fontWeight: 800 }}
                  >
                    Siparişi Tamamla
                  </Button>
                </Stack>
              }
            />
            {/*
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
                  Ödemeye Geç
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
            */}
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
        guestMode={!isAuthenticated}
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
