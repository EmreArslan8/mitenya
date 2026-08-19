import { ReactNode } from 'react';
import NextLink from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ShopProductData } from '@/lib/api/types';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import formatPrice from '@/lib/utils/formatPrice';
import s from './view.module.css';
import ProductGalleryIsland from './components/ProductGalleryIsland';
import ProductRatingStars from './components/ProductRatingStars';
import ProductBenefits from './components/ProductBenefits';
import QATypewriterPill from './components/ProductShopAssistant/QATypewriterPill';
import ProductPurchaseIsland from './components/ProductPurchaseIsland';
import ProductDescription from './components/ProductDescription';
import ProductBelowFold from './components/ProductBelowFold';
import ProductAnalytics from './components/ProductAnalytics';

// Server Component: PDP layout + statik above-the-fold (HTML + CSS Modules, hydrate
// EDİLMEZ). Interaktiflik küçük client island'larda: Gallery / Purchase / Rating /
// Analytics + mevcut Benefits/QATypewriter/Description ve below-fold.

const ProductPageView = ({
  data,
  couponSlot,
  pdpBlocksSlot,
  infoSlot,
}: {
  data: ShopProductData;
  couponSlot?: ReactNode;
  pdpBlocksSlot?: ReactNode;
  infoSlot?: ReactNode;
}) => {
  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;
  const brandLabel = data.brand?.trim();
  const brandSearchToken = data.brandSlug ?? data.brandId;
  const brandHref = brandSearchToken
    ? searchUrlFromOptions({ brand: brandSearchToken })
    : undefined;
  const categoryLabel = data.category?.trim();
  const categorySearchToken = data.categorySlug ?? data.categoryId;
  const categoryHref = categorySearchToken
    ? searchUrlFromOptions({ category: categorySearchToken })
    : undefined;
  const fullName = data.name ?? '';
  const skinTypeBadge =
    data.attributes?.find((attribute) =>
      ['skinType', 'skin_type', 'ciltTipi', 'Cilt Tipi'].includes(attribute.name)
    )?.value?.trim() ?? '';
  const badgeText = skinTypeBadge || categoryLabel || 'Cilt Bakim Urunu';
  const shortDescription = data.shortDescription?.trim() ?? '';
  const shortDescriptionParagraphs = shortDescription
    ? shortDescription
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
  const stockStatusConfig =
    data.stockStatus === 'in_stock'
      ? { label: 'Stokta var', cls: s.stockSuccess }
      : data.stockStatus === 'low_stock'
        ? { label: 'Tükenmek üzere, hemen sipariş edin', cls: s.stockWarning }
        : data.stockStatus === 'out_of_stock'
          ? { label: 'Stokta yok', cls: s.stockError }
          : undefined;

  return (
    <>
      {couponSlot}
      <div className={s.root}>
        <div className={s.topSection}>
          <nav className={s.breadcrumbs}>
            <NextLink href="/" prefetch={false} className={s.breadcrumbLink}>
              <span>Ana Sayfa</span>
            </NextLink>
            {brandLabel ? <ChevronRight size={14} /> : null}
            {brandLabel ? (
              brandHref ? (
                <NextLink href={brandHref} prefetch={false} className={s.breadcrumbLink}>
                  <span>{brandLabel}</span>
                </NextLink>
              ) : (
                <span>{brandLabel}</span>
              )
            ) : null}
            {categoryLabel ? <ChevronRight size={14} /> : null}
            {categoryLabel ? (
              categoryHref ? (
                <NextLink href={categoryHref} prefetch={false} className={s.breadcrumbLink}>
                  <span className={s.breadcrumbCategory}>{categoryLabel}</span>
                </NextLink>
              ) : (
                <span className={s.breadcrumbCategory}>{categoryLabel}</span>
              )
            ) : null}
          </nav>

          <div className={s.grid}>
            <div className={s.imageCol}>
              <ProductGalleryIsland data={data} />
            </div>
            <div className={s.detailsCol}>
              <div className={s.details}>
                <div className={s.titleBlock}>
                  <NextLink
                    href={searchUrlFromOptions({ brand: brandSearchToken })}
                    prefetch={false}
                    className={s.brand}
                  >
                    {data.brand}
                  </NextLink>
                  <h1 className={s.productName}>{fullName}</h1>
                </div>

                <div className={s.metaRow}>
                  <a href="#product-reviews" className={s.rating}>
                    <ProductRatingStars value={data.rating?.averageRating ?? 0} />
                    <span className={s.ratingCount}>({data.rating?.totalCount ?? 0})</span>
                  </a>
                  {data.rating ? (
                    <div className={s.ratingMeta}>
                      <span className={s.zeroRatingText}>
                        {data.rating.totalCount} Değerlendirme
                      </span>
                      <span className={s.ratingSeparator}>|</span>
                    </div>
                  ) : (
                    <div className={s.ratingMetaNowrap}>
                      <span className={s.zeroRatingText}>0 Değerlendirme</span>
                      <a href="#product-reviews" className={s.firstReviewLink}>
                        İlk sen değerlendir
                      </a>
                    </div>
                  )}
                </div>

                <div className={s.summaryBlock}>
                  <div className={s.badgePill}>
                    <span className={s.badgePillText}>{badgeText}</span>
                  </div>
                  {shortDescriptionParagraphs.length ? (
                    <div className={s.shortDescriptionBlock}>
                      {shortDescriptionParagraphs.map((paragraph) => (
                        <p key={paragraph} className={s.shortDescription}>
                          {paragraph}
                        </p>
                      ))}
                      {data.benefits?.length ? <ProductBenefits benefits={data.benefits} /> : null}
                      <QATypewriterPill />
                    </div>
                  ) : (
                    data.benefits?.length ? <ProductBenefits benefits={data.benefits} /> : null
                  )}
                  <hr className={s.divider} />
                </div>

                {stockStatusConfig && (
                  <div className={`${s.stockRow} ${stockStatusConfig.cls}`}>
                    <span className={s.stockDot} />
                    <span className={s.stockText}>{stockStatusConfig.label}</span>
                  </div>
                )}

                <div className={s.priceContainer}>
                  {hasDiscount && (
                    <span className={s.originalPrice}>
                      {formatPrice(data.price.originalPrice, data.price.currency)}
                    </span>
                  )}
                  <span className={s.currentPrice}>
                    {formatPrice(data.price.currentPrice, data.price.currency)}
                  </span>
                  {hasDiscount && (
                    <span className={s.discountBadge}>{`%${discountPercent} İndirim`}</span>
                  )}
                </div>

                <ProductPurchaseIsland data={data} />

                {infoSlot}

                {data.description && <ProductDescription description={data.description} />}
              </div>
            </div>
          </div>
        </div>

        {pdpBlocksSlot}

        <ProductBelowFold data={data} fullName={fullName} />

        <ProductAnalytics data={data} />
      </div>
    </>
  );
};

export default ProductPageView;
