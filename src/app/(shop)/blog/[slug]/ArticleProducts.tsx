import Link from '@/components/common/Link';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import type { ShopProductListItemData } from '@/lib/api/types';

const ArticleProducts = ({ products }: { products: ShopProductListItemData[] }) => {
  if (!products.length) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">Yazıdaki ürünler</h2>

      <div className="flex flex-col gap-3">
        {products.map((product) => {
          const hasDiscount = product.price.originalPrice > product.price.currentPrice;

          return (
            <Link key={product.id} href={product.url} className="block text-inherit no-underline">
              <div className="flex items-center gap-2.5 rounded-xl transition-colors hover:bg-gray-50">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  {product.imgSrc && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.imgSrc}
                      srcSet={product.imgSrcSet}
                      sizes="80px"
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="block size-full object-cover"
                    />
                  )}
                  {hasDiscount && (
                    <span className="absolute bottom-[3px] left-[3px] rounded bg-accentRed px-1 text-[10px] font-bold leading-[15px] text-white">
                      %{getDiscountPercent(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-gray-500">{product.brand}</span>
                  <p className="line-clamp-2 text-[13px] font-semibold leading-[1.35] text-gray-800">{product.name}</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-[13.5px] font-bold text-gray-800">
                      {formatPrice(product.price.currentPrice, product.price.currency)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[11.5px] text-gray-500 line-through">
                        {formatPrice(product.price.originalPrice, product.price.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <a href="/search" className="text-[12.5px] font-semibold text-accentRed no-underline hover:underline">
        Tüm ürünleri gör
      </a>
    </section>
  );
};

export default ArticleProducts;
