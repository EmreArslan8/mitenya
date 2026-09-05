import { fetchProductsSupabase } from '@/lib/api/supabaseShop';
import type { ShopProductListItemData } from '@/lib/api/types';

const RAIL_PRODUCT_COUNT = 3;
const MIN_TOKEN_LENGTH = 4;

const normalize = (value: string) => value.toLocaleLowerCase('tr-TR');

const tokenize = (value: string) =>
  normalize(value)
    .split(/[^a-zçğıöşü0-9]+/i)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);

// Yazının metniyle ürün adı/markası kesişiyorsa o ürün rafın başına gelir.
const relevanceScore = (product: ShopProductListItemData, haystack: string) => {
  let score = 0;

  const brand = normalize(product.brand ?? '');
  if (brand.length >= 3 && haystack.includes(brand)) score += 3;

  const category = normalize(product.category ?? '');
  if (category.length >= MIN_TOKEN_LENGTH && haystack.includes(category)) score += 2;

  const nameTokens = new Set(tokenize(product.name ?? ''));
  const nameHits = [...nameTokens].filter((token) => haystack.includes(token)).length;

  return score + Math.min(nameHits, 3);
};

/**
 * Blog detay sağ kolonu için ürün önerileri.
 * CMS'te blog↔ürün ilişkisi yok; en çok değerlendirilen ürünleri çekip
 * yazının metnine göre yeniden sıralıyoruz.
 */
export async function getArticleProducts(
  articleText: string
): Promise<ShopProductListItemData[]> {
  try {
    const data = await fetchProductsSupabase({ sort: 'bst' });
    const products = data?.products ?? [];
    if (!products.length) return [];

    const haystack = normalize(articleText);

    return products
      .map((product, index) => ({ product, index, score: relevanceScore(product, haystack) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, RAIL_PRODUCT_COUNT)
      .map((item) => item.product);
  } catch (err) {
    console.error('Blog rail products fetch error', err);
    return [];
  }
}
