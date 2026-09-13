'use client';

import { ShopProductData } from '@/lib/api/types';
import formatPrice from '@/lib/utils/formatPrice';
import { Divider } from '@/components/ui/Divider';

const OrderProductsCard = ({ data }: { data: ShopProductData[] }) => {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 sm:px-6">
        <span className="text-[13px] font-bold uppercase text-text-medium">Ürünler</span>
        <span className="text-[13px] font-bold text-text-medium-light">({data.length})</span>
      </div>

      {/* Products */}
      <div>
        {data.map((e, i) => (
          <div key={e.id ?? JSON.stringify(e)}>
            <div className="flex w-full gap-4 px-5 py-5 transition-colors hover:bg-bg-light sm:gap-5 sm:px-6">
              {/* Image */}
              <div className="size-20 shrink-0 overflow-hidden rounded-[10px] border border-gray-100 bg-bg-light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.imgSrc}
                  alt={e.name}
                  className="size-full object-contain"
                />
              </div>

              {/* Details */}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="line-clamp-2 text-[15px] font-semibold leading-[1.4] text-text">
                  {e.brand && (
                    <span className="font-bold">
                      {e.brand}{' '}
                    </span>
                  )}
                  {e.name}
                </p>

                {e.variants && (
                  <p className="text-xs font-medium leading-[1.3] text-text-medium-light">
                    {e.variants
                      .flatMap((v) =>
                        v.options.filter((o) => o.selected).map((o) => o.value)
                      )
                      .join(' / ')}
                  </p>
                )}

                <p className="text-xs font-medium leading-[1.3] text-text-medium-light">
                  Adet: {e.quantity}
                </p>
              </div>

              {/* Price */}
              <div className="flex shrink-0 flex-col items-end justify-center gap-0.5">
                <span className="whitespace-nowrap text-base font-bold leading-none text-text">
                  {formatPrice(e.price.currentPrice * e.quantity, e.price.currency)}
                </span>
                {e.quantity > 1 && (
                  <span className="whitespace-nowrap text-[11px] font-semibold text-text-light">
                    {formatPrice(e.price.currentPrice, e.price.currency)} / adet
                  </span>
                )}
              </div>
            </div>

            {i < data.length - 1 && <Divider className="mx-5 w-auto border-gray-100" />}
          </div>
        ))}
      </div>
    </section>
  );
};

export default OrderProductsCard;
