'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { fetchProductData } from '@/lib/api/shop';
import type { ShopProductData, ShopProductListItemData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { ShopContext } from '@/contexts/ShopContext';

const ADDED_FEEDBACK_MS = 1200;

type UseQuickAddOptions = {
  /** Kullanıcıya gösterilecek hata (ör. stok bitti). Toast'ı çağıran taraf çizer. */
  onError?: (message: string) => void;
};

/**
 * Liste öğesinden "Sepete ekle" akışı — TEK kaynak (ProductCard, marka sayfası).
 *
 * Güncel ürünü çeker (liste verisi cache'li olabilir), stok biterse hata verir,
 * varyant yoksa doğrudan ekler ve "sepete eklendi" modalını açar, varyant varsa
 * seçim modalını açar. Modalları `QuickAddDialogs` çizer.
 */
export const useQuickAdd = (item: ShopProductListItemData, { onError }: UseQuickAddOptions = {}) => {
  const smUp = useScreen('smUp');
  const { handleAddItem } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [variantProduct, setVariantProduct] = useState<ShopProductData | null>(null);
  const [addedProduct, setAddedProduct] = useState<ShopProductData | null>(null);
  const [showAdded, setShowAdded] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  const triggerAddedFeedback = () => {
    if (!smUp) return;
    setShowAdded(true);
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = setTimeout(() => setShowAdded(false), ADDED_FEEDBACK_MS);
  };

  const quickAdd = async () => {
    setLoading(true);
    try {
      const detail = await fetchProductData(item.id);
      if (!detail) return;

      if (detail.quantity <= 0) {
        onError?.('Ürün stokta yok');
        return;
      }

      // Liste verisinde varyant yoksa modal açmadan doğrudan ekle.
      if (!item.hasVariant) {
        const product = { ...detail, quantity: 1 };
        // notify:false → global sepet çekmecesi yerine "Ürün sepete eklendi" modalı.
        if (handleAddItem(product, { notify: false })) {
          triggerAddedFeedback();
          setAddedProduct(product);
        }
        return;
      }

      setVariantProduct(detail);
    } catch (error) {
      console.error('Quick add error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    quickAdd,
    loading,
    showAdded,
    dialogs: {
      variantProduct,
      closeVariant: () => setVariantProduct(null),
      addedProduct,
      setAddedProduct,
      closeAdded: () => setAddedProduct(null),
      loading,
    },
  };
};

export type QuickAddDialogState = ReturnType<typeof useQuickAdd>['dialogs'];
