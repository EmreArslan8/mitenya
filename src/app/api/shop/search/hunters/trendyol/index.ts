// src/lib/api/shop/hunters/trendyol/index.ts
import 'server-only';

import { ShopSearchOptions } from '@/lib/api/types';
import { ProductHunter } from '..';
import { getFilters, transformProductData, TrendyolSearchResponse } from './helpers';

const KOZMETIK_PATH_MODEL = 'kozmetik-x-c89';
const DEFAULT_PAGE_SIZE = 24; // Trendyol kozmetik kartlarında sayfa başı 24 ürün

const trendyolHunter: ProductHunter = async (params: ShopSearchOptions) => {
  const {
    page = 1,
    query,
    brand,
    category,
  } = params;

  // Trendyol API parametreleri
  const searchParams = new URLSearchParams({
    pi: String(page),
    pathModel: KOZMETIK_PATH_MODEL,
    channelId: '1',
    storefrontId: '1',
    culture: 'tr-TR',
  });

  // Trendyol bazen row_per_page benzeri parametre kabul ediyor olabilir;
  // örnek URL’de yoktu ama istersen ekleyebilirsin:
  searchParams.append('pageSize', String(DEFAULT_PAGE_SIZE));

  // Eğer API 'q' parametresini destekliyorsa gönderiyoruz.
  // Desteklemiyorsa bile, aşağıda *client-side filter* da yapıyoruz.
  if (query) {
    searchParams.append('q', query);
  }

  const url = `https://apigw.trendyol.com/discovery-sfint-search-service/api/search/products?${searchParams.toString()}`;

  console.log('🟣 Trendyol Kozmetik API →', url);

  try {
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('❌ Trendyol Kozmetik API Error:', res.status, await res.text());
      return undefined;
    }

    const json = (await res.json()) as TrendyolSearchResponse;

    let products = transformProductData(json.products || []);

    // 🔎 BRAND FİLTRESİ (CMS → InlineProducts searchOptions.brand)
    if (brand) {
      const b = brand.toLowerCase();
      products = products.filter((p) => p.brand?.toLowerCase() === b);
    }

    // 🔎 CATEGORY FİLTRESİ (örneğin "duş jeli" gibi text)
    if (category) {
      const c = category.toLowerCase();
      products = products.filter((p) => {
        const breadcrumbsMatch =
          p.breadcrumbs
            ?.split('>')
            ?.some((bc) => bc.toLowerCase().includes(c)) ?? false;
        return breadcrumbsMatch || p.name.toLowerCase().includes(c);
      });
    }

    // 🔎 QUERY FİLTRESİ (API q’yu umursamasa bile biz isim üstünden filtreliyoruz)
    if (query) {
      const q = query.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }

    const totalCount = json.totalCount ?? products.length;
    console.log('🟣 Trendyol Kozmetik → page:', page, 'products:', products.length, 'total:', totalCount);

    return {
      products,
      totalCount,
      filters: await getFilters(params),
      // sortOptions istersen eklenebilir; şimdilik boş bırakıyoruz.
    };
  } catch (err) {
    console.error('❌ Trendyol Kozmetik Hunter Exception:', err);
    return undefined;
  }
};

export default trendyolHunter;
