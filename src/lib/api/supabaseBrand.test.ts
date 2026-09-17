import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { fetchBrandProducts, mapBrandProductRow } from './supabaseBrand';

const row = {
  id: 'p1',
  slug: 'relief-sun',
  name: 'Relief Sun',
  brand_id: 'b1',
  brand_name: 'Beauty of Joseon',
  category_name: 'Yüz Güneş Kremleri',
  current_price: 949,
  original_price: 999,
  currency: 'TRY',
  rating_average: null,
  rating_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  has_variants: false,
  product_images: [{ image_url: 'products/relief-sun/main.webp', sort_order: 0 }],
  product_stock: [{ quantity: 5 }],
  product_benefits: [
    { benefits: { name_tr: 'Güneş Koruması' } },
    { benefits: null },
    { benefits: { name_tr: null } },
  ],
};

const createClient = (result: { data: unknown; error: { message: string } | null }) => {
  const calls: Array<[string, unknown[]]> = [];
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'order']) {
    builder[method] = vi.fn((...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    });
  }
  builder.limit = vi.fn((...args: unknown[]) => {
    calls.push(['limit', args]);
    return Promise.resolve(result);
  });
  const client = { from: vi.fn(() => builder) } as unknown as SupabaseClient;
  return { client, calls };
};

describe('mapBrandProductRow', () => {
  it('keeps the slug and only named benefits', () => {
    const product = mapBrandProductRow(row);
    expect(product.slug).toBe('relief-sun');
    expect(product.url).toBe('/product/relief-sun');
    expect(product.benefits).toEqual(['Güneş Koruması']);
    expect(product.price).toEqual({ currentPrice: 949, originalPrice: 999, currency: 'TRY' });
  });

  it('falls back to id when slug is missing', () => {
    expect(mapBrandProductRow({ ...row, slug: null, product_benefits: null }).slug).toBe('p1');
  });
});

describe('fetchBrandProducts', () => {
  it('runs a single query filtered by brand and active status with the limit', async () => {
    const { client, calls } = createClient({ data: [row], error: null });
    const products = await fetchBrandProducts(client, 'b1', 12);

    expect(client.from).toHaveBeenCalledTimes(1);
    expect(client.from).toHaveBeenCalledWith('products');
    expect(calls).toContainEqual(['eq', ['brand_id', 'b1']]);
    expect(calls).toContainEqual(['eq', ['status', 'active']]);
    expect(calls).toContainEqual(['limit', [12]]);
    expect(products).toHaveLength(1);
  });

  it('throws instead of caching an empty list on error', async () => {
    const { client } = createClient({ data: null, error: { message: 'boom' } });
    await expect(fetchBrandProducts(client, 'b1')).rejects.toThrow('boom');
  });
});
