'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { Snackbar, Stack } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Check } from '@/components/icons';
import Button from '@/components/common/Button';
import Banner from '@/components/common/Banner';
import { CrossFade } from '@/components/common/CrossFade';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import AddedToCartModal from '@/components/ShoppingCart/AddedToCartModal';
import ProductStickyBar from '../ProductStickyBar';
import ProductVariants from '../ProductVariants';
import useStyles from '../../styles';

// Client island: satın-alma çekirdeği. variants state + CTA (Hemen Al / Sepete Ekle /
// stok bildirimi) + sticky bar + kendi stok-bildirim Snackbar'ı. variants↔CTA aynı
// state'i paylaştığı için tek ada. MUI bu fazda korunur.

const ProductSizeGuide = dynamic(() => import('../ProductSizeGuide'), {
  ssr: false,
  loading: () => null,
});

const MAX_CART_QUANTITY = 5;

type FeedbackState = { title: string; variant: 'success' | 'error' } | null;

const ProductPurchaseIsland = ({ data }: { data: ShopProductData }) => {
  const { isCartReady, handleAddItem, getItemQuantity } = useContext(ShopContext);
  const { isAuthenticated, openAuthenticator } = useAuth();
  const router = useRouter();
  const styles = useStyles();
  const { smUp } = useScreen();
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [variants, setVariants] = useState(data.variants);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);
  const [showCheck, setShowCheck] = useState(false);
  /** Sepete eklendi onayı — seçili varyantlarıyla birlikte gösterilir. */
  const [addedToCart, setAddedToCart] = useState<ShopProductData | null>(null);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockAlertRequested, setStockAlertRequested] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const fullName = data.name ?? '';
  const isOutOfStock = typeof data.quantity === 'number' && data.quantity <= 0;
  const isVariantSelectionMissing =
    !!variants?.length && variants.every((v) => v.options.every((o) => !o.selected));
  const isOverCartLimit = getItemQuantity(data) >= MAX_CART_QUANTITY;
  const buyNowDisabled = showCheck || isOutOfStock || isOverCartLimit || isVariantSelectionMissing;
  const addToCartDisabled =
    showCheck || (isOutOfStock ? stockAlertRequested : isOverCartLimit || isVariantSelectionMissing);
  const addToCartLoading = (!isOutOfStock && !isCartReady) || stockAlertLoading;
  const shouldShowStickyBar = !isOutOfStock && !isMainCtaVisible;
  const isDesktop = smUp;

  const handleSelectOption = (variantName: string, optionValue: string) => {
    setVariants((prev) =>
      prev?.map((v) =>
        variantName === v.name
          ? {
            ...v,
            options: v.options.map((o) => {
              if (o.value === optionValue) {
                return { ...o, selected: true };
              } else return { ...o, selected: false };
            }),
          }
          : v
      )
    );
  };

  const handleAddToCart = () => {
    const addedProduct = { ...data, variants: variants };
    // notify:false → global sepet çekmecesi açılmasın, onay modalını biz gösteriyoruz.
    const success = handleAddItem(addedProduct, { notify: false });
    if (!success) return;
    setAddedToCart(addedProduct);
    setShowCheck(true);
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => setShowCheck(false), 1000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const success = handleAddItem({ ...data, variants: variants });
    if (!success) return;
    router.push('/checkout');
  };

  const getSelectedVariant = () => {
    const selected = variants
      ?.map((variant) => {
        const selectedOption = variant.options.find((option) => option.selected);
        if (!selectedOption) return null;
        return `${variant.name}: ${selectedOption.value}`;
      })
      .filter(Boolean);

    return selected?.join(' | ') ?? '';
  };

  const subscribeStockAlert = async () => {
    if (stockAlertLoading || stockAlertRequested) return;

    try {
      setStockAlertLoading(true);

      const selectedVariant = getSelectedVariant();
      const res = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.id,
          productName: fullName,
          productUrl: window.location.href,
          variantName: selectedVariant ? 'selected' : '',
          variantValue: selectedVariant,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          json?.error?.message ??
          json?.error ??
          'Stok bildirimi talebi su an olusturulamadi';
        throw new Error(message);
      }

      setStockAlertRequested(true);
      setFeedback({ title: 'Stok bildirimi talebiniz alindi', variant: 'success' });
    } catch {
      setFeedback({ title: 'Stok bildirimi talebi olusturulamadi', variant: 'error' });
    } finally {
      setStockAlertLoading(false);
    }
  };

  const withAuth = (cb: () => void) => {
    if (isAuthenticated) {
      cb();
      return;
    }
    openAuthenticator?.();
  };

  const handleOutOfStockClick = () => {
    withAuth(() => void subscribeStockAlert());
  };

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const target = ctaRowRef.current;
    if (!target) {
      setIsMainCtaVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting);
        setIsMainCtaVisible((prev) => (prev === nextVisible ? prev : nextVisible));
      },
      { root: null, threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {variants && (
        <ProductVariants
          variants={variants}
          onSelect={handleSelectOption}
          productId={data.id}
        />
      )}
      {(data.sizeRecommendation || data.sizeGuide) && (
        <ProductSizeGuide
          sizeRecommendation={data.sizeRecommendation}
          sizeGuide={data.sizeGuide}
        />
      )}
      <Stack sx={styles.ctaRow} ref={ctaRowRef}>
        {!isOutOfStock && (
          <Button
            variant="outlined"
            loading={!isCartReady}
            disabled={buyNowDisabled}
            onClick={handleBuyNow}
            sx={styles.buyNowButton}
          >
            Hemen Al
          </Button>
        )}
        <Button
          variant="contained"
          loading={addToCartLoading}
          disabled={addToCartDisabled}
          onClick={isOutOfStock ? handleOutOfStockClick : handleAddToCart}
          sx={styles.ctaButton}
        >
          <CrossFade
            components={[
              {
                in: showCheck,
                component: isDesktop ? (
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Check />
                    Eklendi
                  </Stack>
                ) : (
                  <Check />
                ),
              },
              {
                in: !showCheck,
                component: isOutOfStock
                  ? stockAlertRequested
                    ? 'Bildirim Talebiniz Alindi'
                    : 'Bu ürün stokta oldugunda bana bildir'
                  : 'Sepete Ekle',
              },
            ]}
          />
        </Button>
      </Stack>
      <ProductStickyBar
        imgSrc={data.imgSrc ?? data.images?.[0]}
        name={data.name}
        price={data.price}
        visible={shouldShowStickyBar}
        disabled={addToCartDisabled}
        loading={addToCartLoading}
        showCheck={showCheck}
        onAddToCart={handleAddToCart}
      />
      <AddedToCartModal
        open={!!addedToCart}
        onClose={() => setAddedToCart(null)}
        product={addedToCart ?? undefined}
      />
      <Snackbar
        open={!!feedback}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Banner
          variant={feedback?.variant ?? 'success'}
          title={feedback?.title}
        />
      </Snackbar>
    </>
  );
};

export default ProductPurchaseIsland;
