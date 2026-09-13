'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { ShopProductData } from '@/lib/api/types';

const ProductShopAssistantPanel = dynamic(() => import('./ProductShopAssistantPanel'), {
  ssr: false,
  loading: () => null,
});

type ProductShopAssistantProps = {
  data: ShopProductData;
};

const ProductShopAssistant = ({ data }: ProductShopAssistantProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <div className="fixed right-7 bottom-7 z-[1300] hidden sm:flex">
          <button
            type="button"
            className="flex h-[54px] min-h-[54px] min-w-[132px] items-center justify-center gap-1.5 overflow-hidden rounded-full border border-white/[12%] bg-primary-gradient py-0 pr-[18px] pl-[14px] text-white shadow-[0_12px_28px_rgba(17,17,17,0.18),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-8px_16px_rgba(0,0,0,0.18)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-white/[22%] hover:shadow-[0_16px_36px_rgba(17,17,17,0.24),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-8px_16px_rgba(0,0,0,0.18)]"
            onClick={() => setOpen(true)}
            aria-label="Urun hakkinda soru sor"
            id="product-qa-trigger"
          >
            <span className="grid size-[26px] shrink-0 place-items-center text-white">
              <Sparkles size={18} strokeWidth={1.9} />
            </span>
            <span className="text-[15px] leading-none font-semibold tracking-[-0.01em] text-white">
              Danış
            </span>
          </button>
        </div>
      )}

      {open && <ProductShopAssistantPanel productId={data.id} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ProductShopAssistant;
