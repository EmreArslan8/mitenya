'use client';

import { ShopProductData } from '@/lib/api/types';
import { CloseIcon, ShoppingBag } from '@/components/icons';
import { useState, useContext } from 'react';
import Button from '@/components/ui/Button';
import { ShopContext } from '@/contexts/ShopContext';
import formatPrice from '@/lib/utils/formatPrice';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  product: ShopProductData | null;
  loading?: boolean;
  /** Ürün sepete eklenince çağrılır; çağıran "Ürün sepete eklendi" modalını gösterir. */
  onAdded?: (product: ShopProductData) => void;
}

const QuickAddModal = ({ open, onClose, product, loading, onAdded }: QuickAddModalProps) => {
  const { handleAddItem } = useContext(ShopContext);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Varyantları kontrol et (variants veya attributes'dan)
  const variants = product?.variants;
  const hasVariants = variants && variants.length > 0;

  const handleVariantSelect = (variantName: string, optionValue: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionValue,
    }));
    setError(null);
  };

  const isOptionSelected = (variantName: string, optionValue: string) => {
    return selectedVariants[variantName] === optionValue;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Varyant kontrolü
    if (hasVariants) {
      const allSelected = variants?.every(
        (variant) => selectedVariants[variant.name]
      );

      if (!allSelected) {
        setError('Lütfen tüm seçenekleri belirleyin');
        return;
      }
    }

    // Ürünü varyant bilgileriyle güncelle
    const productToAdd: ShopProductData = {
      ...product,
      quantity: 1,
      variants: hasVariants
        ? variants?.map((variant) => ({
            name: variant.name,
            options: variant.options.map((opt) => ({
              ...opt,
              selected: opt.value === selectedVariants[variant.name],
            })),
          }))
        : undefined,
    };

    // notify:false → global sepet çekmecesi açılmasın; onay modalını çağıran gösterir.
    const success = handleAddItem(productToAdd, { notify: false });
    if (!success) return;
    handleClose();
    onAdded?.(productToAdd);
  };

  const handleClose = () => {
    onClose();
    setSelectedVariants({});
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => { if (!next) handleClose(); }}
      srTitle="Hızlı ürün ekleme"
      className="max-w-[400px] rounded-3xl"
    >
      {loading ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-8">
          <Spinner className="text-primary" />
          <p className="mt-4 text-text-medium">Yükleniyor...</p>
        </div>
      ) : product ? (
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Hızlı Ekle</h2>
            <button type="button" onClick={handleClose} className="inline-flex size-8 items-center justify-center" aria-label="Kapat">
              <CloseIcon />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex gap-4 p-4">
            {product.imgSrc && (
              <Image
                src={product.imgSrc}
                alt={product.name ?? 'Ürün'}
                width={100}
                height={100}
                className="size-[100px] rounded-2xl object-cover"
              />
            )}
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm text-text-medium">{product.brand}</p>
              <p className="line-clamp-2 font-medium">{product.name}</p>
              <p className="mt-1 font-semibold text-primary">
                {formatPrice(product.price.currentPrice, product.price.currency)}
              </p>
            </div>
          </div>

          {/* Variants */}
          {hasVariants && (
            <div className="flex flex-col gap-4 px-4 pb-4">
              {variants?.map((variant) => (
                <div key={variant.name} className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">{variant.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.value}
                        onClick={() => handleVariantSelect(variant.name, option.value)}
                        variant={isOptionSelected(variant.name, option.value) ? 'filled' : 'outlined'}
                        disabled={!option.isAvailable}
                        className={cn(
                          // MUI color="primary" + variant="filled" karşılığı
                          isOptionSelected(variant.name, option.value) &&
                            'bg-primary text-primary-contrast-text hover:bg-primary-light',
                          !option.isAvailable && 'cursor-not-allowed opacity-50',
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="px-4 text-sm text-error">{error}</p>
          )}

          {/* Add to Cart Button */}
          <div className="p-4">
            <Button variant="contained" fullWidth onClick={handleAddToCart}>
              <span className="inline-flex items-center gap-2">
                <ShoppingBag size={18} />
                Sepete Ekle
              </span>
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
};

export default QuickAddModal;
