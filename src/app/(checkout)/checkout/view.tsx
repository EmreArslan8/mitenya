'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import AddressSelector from '@/components/AddressSelector';
import LoadingOverlay from '@/components/LoadingOverlay';
import CheckoutCard from '@/components/ShoppingCart/CheckoutCard';
import ShopCartProductCard from '@/components/ShoppingCart/ShopCartProductCard';
import Banner from '@/components/common/Banner';
import Card from '@/components/common/Card';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Info } from '@/components/icons';
import { Checkbox } from '@/components/ui/Checkbox';
import { Toast } from '@/components/ui/Toast';
import { TextField } from '@/components/ui/TextField';

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
  const isMobile = useScreen('smDown');
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

  useEffect(() => {
    if (selected != null && selected.length === 0) {
      router.replace('/cart');
      return;
    }
    if (!selected?.length) {
      setOrderSummary(undefined);
      return;
    }
    if (isAuthenticated === undefined) return;

    let cancelled = false;
    setSummaryLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await getOrderSummary({
          products: selected,
          destination,
          discountCode: discountCode ?? undefined,
          draftPaymentMethod: paymentType,
        });
        if (!cancelled) setOrderSummary(data?.orderSummary);
      } catch {
        // summary yüklenemedi, mevcut değer korunur
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selected, destination, paymentType, discountCode, isAuthenticated, router]);

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
  }, [searchParams, discountCode]);

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
      titleClassName="text-base font-bold"
      headerClassName="normal-case"
      collapsible
      defaultCollapsed={false}
    >
      <div className="flex flex-col gap-4 py-4">
        {selected?.map((e, i) => (
          <div className="flex flex-col gap-4 px-4" key={`${e.id}-${e.variants?.map(v => v.options.find(o => o.selected)?.value ?? '').join('-') ?? ''}`}>
            <ShopCartProductCard data={e} />
            {i < selected.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <>
      {showDiscountCodeSnackbar && (
        <Toast
        open={showDiscountCodeSnackbar}
        duration={3000}
        onClose={() => setShowDiscountCodeSnackbar(false)}
        position="top-center"
      >
          <Banner
            variant="success"
            title="İndirim kodu başarıyla uygulandı"

          />
      </Toast>
      )}
      <Toast
        open={!!checkoutError}
        duration={4000}
        onClose={() => setCheckoutError(null)}
        position="top-center"
      >
        <Banner variant="error" title={checkoutError ?? ''} />
      </Toast>
      {!orderSummary && <LoadingOverlay loading />}
      <div className="flex flex-col gap-6">
        <TwoColumnLayout className="gap-4 pb-6 sm:gap-6">
          <PrimaryColumn>
            {!isAuthenticated && (
              <Card
                border
                headerClassName="normal-case"
                title={
                  <div className="flex w-full items-center justify-between">
                    <Typography variant="body1" as="span" className="font-bold tracking-normal">Müşteri Bilgileri</Typography>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="border-0 bg-transparent p-0 text-sm text-primary underline"
                        onClick={(event) => { event.stopPropagation(); openAuthenticator?.(); }}
                      >
                        Giriş Yap
                      </button>
                      <Typography variant="body2" as="span" className="text-text-secondary">|</Typography>
                      <button
                        type="button"
                        className="border-0 bg-transparent p-0 text-sm text-primary underline"
                        onClick={(event) => { event.stopPropagation(); openAuthenticator?.({ type: 'uye-ol' }); }}
                      >
                        Üye Ol
                      </button>
                    </div>
                  </div>
                }
              >
                <div className="px-3 py-3 sm:px-4">
                  <TextField
                    type="email"
                    autoComplete="email"
                    value={guestEmail}
                    onChange={(e) => { setGuestEmail(e.target.value); setGuestEmailError(''); }}
                    onBlur={() => {
                      if (guestEmail && !isValidEmail(guestEmail))
                        setGuestEmailError('Geçerli bir e-posta adresi girin.');
                    }}
                    error={guestEmailError || false}
                    placeholder="E-posta"
                    aria-label="E-posta adresi"
                    size="large"
                  />
                </div>
              </Card>
            )}
            <Card
              border
              titleClassName="text-base font-bold"
              headerClassName="normal-case"
              title={
                <div className="flex items-center justify-between gap-1 text-base font-bold">
                  <span>Teslimat Bilgileri</span>
                  {destination && (
                    <span className="inline-flex items-center">
                      <Check size={16} strokeWidth={3} />
                      <Typography variant="cardTitle" as="span" className="inline-flex items-center normal-case text-text-medium underline">
                        {`${destination.name}`}
                      </Typography>
                    </span>
                  )}
                </div>
              }
              collapsible
              defaultCollapsed={isMobile && !!destination}
            >
              <div className="px-2 py-2 sm:px-4">
                <div>
                  <Card className="max-w-full gap-2">
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
                </div>
              </div>
            </Card>
            <Card
              border
              title="Fatura Bilgileri"
              titleClassName="text-base font-bold"
              headerClassName="normal-case"
              collapsible
              defaultCollapsed={!billingDifferent}
            >
              <div className="flex flex-col gap-3 px-2 py-2 sm:px-4">
                <label className="flex cursor-pointer items-center gap-1">
                  <Checkbox
                    checked={billingDifferent}
                    onCheckedChange={(checked) => {
                      setBillingDifferent(checked);
                      setBillingAddress(undefined);
                    }}
                    aria-label="Fatura adresi teslimat adresinden farklı"
                  />
                  <Typography variant="body2" as="span" className="tracking-normal">
                    Fatura adresi teslimat adresinden farklı
                  </Typography>
                </label>
                {!billingDifferent && destination && (
                  <div className="flex gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="mt-0.5 text-text-secondary"><Check size={14} /></span>
                    <div className="flex flex-col">
                      <Typography variant="progressLabel" className="font-semibold">{destination.name}</Typography>
                      <Typography variant="caption" className="text-text-secondary">
                        {[destination.line1, destination.line2, destination.district, destination.city]
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                      <Typography variant="caption" className="mt-0.5 text-text-secondary">Teslimat adresiyle aynı</Typography>
                    </div>
                  </div>
                )}
                {billingDifferent && (
                  <Card className="max-w-full gap-2">
                    <AddressSelector
                      value={billingAddress}
                      options={addresses}
                      onAddressAdded={(address) => setBillingAddress(address)}
                      onChange={(address) => setBillingAddress(address)}
                    />
                  </Card>
                )}
              </div>
            </Card>
          </PrimaryColumn>
          <SecondaryColumn>
            {cartProductsCard}
            <CheckoutCard
              title="Sipariş Özeti"
              hideTitleIcon
              titleClassName="text-base font-bold"
              headerClassName="normal-case"
              numSelected={numSelected}
              orderSummary={orderSummary}
              loading={summaryLoading}
              discountCode={discountCode}
              onSubmitDiscountCode={setDiscountCode}
              showLines
              action={
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-4 py-2">
                    <div className="flex w-full items-center">
                      <Checkbox
                        checked={preInfoAccepted}
                        onCheckedChange={setPreInfoAccepted}
                        className="mr-2"
                        aria-label="Ön bilgilendirme formunu okudum"
                      />
                      <Typography variant="body2" className="flex-1 font-medium leading-[21px] tracking-normal text-text">
                        Ön Bilgilendirme Metnini okudum, kabul ediyorum.
                      </Typography>
                      <button
                        type="button"
                        aria-label="Ön Bilgilendirme Metni'ni görüntüle"
                        onClick={() => setPreInfoModalOpen(true)}
                        className="ml-2.5 flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-text"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                    <div className="flex w-full items-center">
                      <Checkbox
                        checked={distanceSaleAccepted}
                        onCheckedChange={setDistanceSaleAccepted}
                        className="mr-2"
                        aria-label="Mesafeli satış sözleşmesini okudum"
                      />
                      <Typography variant="body2" className="flex-1 font-medium leading-[21px] tracking-normal text-text">
                        Mesafeli Satış Sözleşmesini okudum ve kabul ediyorum.
                      </Typography>
                      <button
                        type="button"
                        aria-label="Mesafeli Satış Sözleşmesi'ni görüntüle"
                        onClick={() => setDistanceSaleModalOpen(true)}
                        className="ml-2.5 flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-text"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  </div>
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
                    className="rounded-md py-3 text-base font-extrabold"
                  >
                    Siparişi Tamamla
                  </Button>
                </div>
              }
            />
          </SecondaryColumn>
        </TwoColumnLayout>
      </div>
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
