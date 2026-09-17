'use client';

// Client island: sepet ShopContext'te (tarayıcı). Sayfanın geri kalanı server component.

import { useState } from 'react';
import Banner from '@/components/common/Banner';
import Link from '@/components/common/Link';
import QuickAddDialogs from '@/components/QuickAddModal/QuickAddDialogs';
import Button from '@/components/ui/Button';
import { buttonVariants } from '@/components/ui/Button/variants';
import { Toast } from '@/components/ui/Toast';
import { Check } from '@/components/icons';
import type { ShopProductListItemData } from '@/lib/api/types';
import { useQuickAdd } from '@/lib/hooks/useQuickAdd';
import { cn } from '@/lib/utils/cn';

const BUTTON_CLASS = 'h-12 w-full font-semibold normal-case';

const AddToCartButton = ({ product }: { product: ShopProductListItemData }) => {
  const [error, setError] = useState<string | null>(null);
  const { quickAdd, loading, showAdded, dialogs } = useQuickAdd(product, { onError: setError });
  const isOutOfStock = typeof product.quantity === 'number' && product.quantity <= 0;

  if (isOutOfStock) {
    return (
      <Link href={product.url} className={cn(buttonVariants({ variant: 'outlined', color: 'primary' }), BUTTON_CLASS)}>
        Gelince Haber Ver
      </Link>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        className={BUTTON_CLASS}
        loading={loading}
        disabled={loading || showAdded}
        onClick={() => void quickAdd()}
      >
        {showAdded ? (
          <span className="inline-flex items-center gap-2">
            <Check size={16} />
            Eklendi
          </span>
        ) : (
          'Sepete ekle'
        )}
      </Button>

      <QuickAddDialogs state={dialogs} />

      <Toast open={Boolean(error)} duration={2000} onClose={() => setError(null)} position="bottom-center">
        <Banner variant="error" title={error ?? ''} />
      </Toast>
    </>
  );
};

export default AddToCartButton;
