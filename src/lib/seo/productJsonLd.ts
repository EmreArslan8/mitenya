import type { ShopProductData } from '@/lib/api/types';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';

const baseUrl = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');

const toAbsoluteUrl = (pathOrUrl: string) =>
  pathOrUrl.startsWith('http') ? pathOrUrl : `${baseUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

const toPlainText = (value: string) =>
  value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const buildProductJsonLd = (product: ShopProductData): string => {
  const canonicalPath = product.url || `/product/${product.id}`;
  const images =
    product.images?.length ? product.images.map(toAbsoluteUrl) : product.imgSrc ? [toAbsoluteUrl(product.imgSrc)] : undefined;
  const hasStock = Number(product.quantity ?? 0) > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name ?? '',
    url: toAbsoluteUrl(canonicalPath),
    ...(images ? { image: images } : {}),
    ...(product.description ? { description: toPlainText(product.description) } : {}),
    brand: {
      '@type': 'Brand',
      name: product.brand ?? '',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.currentPrice,
      priceCurrency: product.price.currency,
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceSpecification: {
        name: 'originalPrice',
        price: product.price.originalPrice,
        priceCurrency: product.price.currency,
      },
    },
    ...(product.rating?.totalCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating.averageRating,
            reviewCount: product.rating.totalCount,
          },
        }
      : {}),
  };

  return JSON.stringify(jsonLd, null, 2);
};

export const buildFaqJsonLd = (product: ShopProductData): string | null => {
  const faqItems =
    product.faqs
      ?.filter((faq) => faq.question?.trim() && faq.answer?.trim())
      .map((faq) => ({
        '@type': 'Question',
        name: toPlainText(faq.question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: toPlainText(faq.answer),
        },
      })) ?? [];

  if (!faqItems.length) return null;

  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems,
    },
    null,
    2
  );
};

export const buildBreadcrumbJsonLd = (product: ShopProductData): string => {
  const productName = product.name ?? 'Ürün';
  const productPath = product.url || `/product/${product.id}`;

  const secondLevelName = product.brand?.trim() || product.category?.trim() || 'Ürünler';
  const secondLevelPath =
    product.brandSlug || product.brandId
      ? searchUrlFromOptions({ brand: product.brandSlug ?? product.brandId })
      : product.categorySlug || product.categoryId
        ? searchUrlFromOptions({ category: product.categorySlug ?? product.categoryId })
        : '/search';

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ana Sayfa',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: secondLevelName,
      item: toAbsoluteUrl(secondLevelPath),
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: productName,
      item: toAbsoluteUrl(productPath),
    },
  ];

  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    },
    null,
    2
  );
};
