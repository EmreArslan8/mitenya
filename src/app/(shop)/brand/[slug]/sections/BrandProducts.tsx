import NextImage from 'next/image';
import Link from '@/components/common/Link';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import type { BrandProductView } from '../model';
import AddToCartButton from './AddToCartButton';

// Görsel kutusu: mobil 116px, masaüstü 280px.
const IMAGE_SIZES = '(max-width: 999px) 116px, 280px';

const ProductRow = ({ product, priority }: { product: BrandProductView; priority: boolean }) => {
  const hasDiscount = product.price.originalPrice > product.price.currentPrice;
  const src = product.images?.[0]?.originalUrl || product.imgSrc;

  return (
    <article className="grid grid-cols-[116px_minmax(0,1fr)] gap-x-3.5 gap-y-3 rounded-2xl border border-gray-100 p-3 md:grid-cols-[280px_minmax(0,1fr)_270px] md:gap-0 md:overflow-hidden md:rounded-3xl md:p-0">
      <Link
        href={product.url}
        className="relative row-span-1 aspect-square overflow-hidden rounded-xl bg-gray-50 md:row-span-2 md:rounded-none"
      >
        {src ? (
          <NextImage
            src={src}
            alt={product.name}
            fill
            sizes={IMAGE_SIZES}
            priority={priority}
            className="object-contain p-2 mix-blend-multiply md:p-6"
          />
        ) : null}
        {hasDiscount ? (
          <span className="absolute top-1.5 left-1.5 rounded-md bg-accentRed px-1.5 py-0.5 text-[11px] font-bold text-accentRed-contrast-text md:hidden">
            %{getDiscountPercent(product.price)}
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-col gap-1.5 md:gap-2.5 md:px-10 md:pt-8">
        {product.category ? (
          <span className="text-[11px] font-semibold tracking-[0.08em] text-green uppercase md:text-[13px]">
            {product.category}
          </span>
        ) : null}
        <h3 className="leading-snug font-semibold md:text-2xl">
          <Link href={product.url} className="hover:underline">{product.name}</Link>
        </h3>
        {/* Mobilde fiyat başlığın altında; masaüstünde sağ sütunda. */}
        <p className="flex items-baseline gap-2 md:hidden">
          <span className="text-lg font-bold">{formatPrice(product.price.currentPrice, product.price.currency)}</span>
          {hasDiscount ? (
            <s className="text-[13px] text-text-light">{formatPrice(product.price.originalPrice, product.price.currency)}</s>
          ) : null}
        </p>
      </div>

      <div className="col-span-2 flex flex-col gap-3 md:col-span-1 md:col-start-2 md:row-start-2 md:justify-end md:px-10 md:pb-8">
        {product.note ? <p className="text-sm leading-normal text-text-medium md:text-base">{product.note}</p> : null}
        {product.benefits.length ? (
          <ul className="flex flex-wrap gap-1.5 md:gap-2">
            {product.benefits.map((benefit) => (
              <li key={benefit} className="rounded-full bg-green-light px-2.5 py-1 text-xs font-semibold text-green-dark md:px-3 md:py-1.5 md:text-[13px]">
                {benefit}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="col-span-2 flex flex-col justify-center gap-3.5 md:col-span-1 md:col-start-3 md:row-span-2 md:row-start-1 md:border-l md:border-gray-100 md:p-8">
        <div className="hidden flex-col gap-1 md:flex">
          {hasDiscount ? (
            <p className="flex items-center gap-2.5">
              <s className="text-text-light">{formatPrice(product.price.originalPrice, product.price.currency)}</s>
              <span className="rounded-md bg-accentRed px-2 py-0.5 text-xs font-bold text-accentRed-contrast-text">
                %{getDiscountPercent(product.price)}
              </span>
            </p>
          ) : null}
          <p className="text-[32px] font-bold">{formatPrice(product.price.currentPrice, product.price.currency)}</p>
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
};

type BrandProductsProps = {
  products: BrandProductView[];
  /** Liste üst sınıra dayandıysa tüm ürünler için arama sayfası. */
  moreHref?: string;
};

const BrandProducts = ({ products, moreHref }: BrandProductsProps) => (
  <div className="flex flex-col gap-3 md:gap-5">
    {products.map((product, index) => (
      <ProductRow key={product.id} product={product} priority={index === 0} />
    ))}
    {moreHref ? (
      <Link href={moreHref} className="self-center font-semibold underline">
        Tüm ürünleri gör
      </Link>
    ) : null}
  </div>
);

export default BrandProducts;
