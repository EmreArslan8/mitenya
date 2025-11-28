import 'server-only';

import { ShopSearchOptions } from '@/lib/api/types';
import { ProductHunter } from '..';
import { getFilters, transformProductData, normalizePage } from './helpers';

const defaultQuery = 'krem';

const rossmannHunter: ProductHunter = async (params: ShopSearchOptions) => {
  const { page, query, brand, category } = params;
  const normalizedPage = normalizePage(page);

  const searchQuery = query || defaultQuery;

  const searchParams = {
    query: searchQuery,
    row_per_page: 12,      // UI performansı için 12 ideal
    page_number: normalizedPage,     // 🔥 infinite scroll için KRİTİK
  };

  const url = `https://rossmann.wawlabs.com/search_v2?search_params=${encodeURIComponent(
    JSON.stringify(searchParams)
  )}`;

  console.log('🟢 Rossmann API →', url);

  try {
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('❌ Rossmann API Error:', res.status);
      return undefined;
    }

    const json = await res.json(); // { res: [...], total_item_count }

    let products = transformProductData(json.res || []);

    // --- Local filters ---
    if (brand) {
      const b = brand.toLowerCase();
      products = products.filter((p) => p.brand?.toLowerCase() === b);
    }

    if (category) {
      const c = category.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(c)
      );
    }

    return {
      products,
      totalCount: json.total_item_count, // 🔥 infinite scroll için doğru total
      filters: await getFilters(params),
      session: {
        _S1: `${page}`, // sayfa state'i
      },
    };
  } catch (err) {
    console.error('❌ Rossmann Hunter Exception:', err);
    return undefined;
  }
};

export default rossmannHunter;
