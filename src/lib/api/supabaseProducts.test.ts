import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProductDataSupabase } from './supabaseProducts';

// Mock data
const mockProductData = {
  id: 'prod-123',
  slug: 'test-product',
  name: 'Test Product',
  brand_id: 'brand-1',
  brand_name: 'Test Brand',
  category_id: 'cat-1',
  category_name: 'Test Category',
  rating_average: 4.5,
  rating_count: 100,
  description: 'Test description',
  product_prices: [
    { price_current: 100, price_original: 150, currency: 'TRY' },
  ],
  product_images: [
    { image_path: 'image1.jpg', image_url: null, is_main: true, sort_order: 1 },
    { image_path: 'image2.jpg', image_url: null, is_main: false, sort_order: 2 },
  ],
  product_stock: [{ quantity: 10 }],
  attributes_json: [{ name: 'Color', value: 'Red' }],
};

// Mock Supabase (hoist-safe for vi.mock)
const supabaseMocks = vi.hoisted(() => {
  const mockProductsSingle = vi.fn();
  const mockProductsEq = vi.fn(() => ({ single: mockProductsSingle }));
  const mockProductsSelect = vi.fn(() => ({ eq: mockProductsEq }));

  const mockReviewsOrder = vi.fn();
  const mockReviewsEq = vi.fn(() => ({ order: mockReviewsOrder }));
  const mockReviewsSelect = vi.fn(() => ({ eq: mockReviewsEq }));

  const mockFrom = vi.fn((table: string) => {
    if (table === 'products') return { select: mockProductsSelect };
    if (table === 'product_reviews') return { select: mockReviewsSelect };
    return { select: vi.fn() };
  });

  return {
    mockProductsSingle,
    mockProductsEq,
    mockProductsSelect,
    mockReviewsOrder,
    mockReviewsEq,
    mockReviewsSelect,
    mockFrom,
  };
});

vi.mock('../supabase/admin', () => ({
  supabaseAdmin: {
    from: supabaseMocks.mockFrom,
  },
}));

// Mock r2Url
vi.mock('../utils/r2', () => ({
  r2Url: vi.fn((path) => `https://cdn.test.com/${path}`),
}));

describe('fetchProductDataSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.mockReviewsOrder.mockResolvedValue({ data: [], error: null });
  });

  it('should fetch product by slug', async () => {
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(supabaseMocks.mockFrom).toHaveBeenCalledWith('products');
    expect(supabaseMocks.mockProductsEq).toHaveBeenCalledWith('slug', 'test-product');
    expect(result).toBeDefined();
    expect(result?.id).toBe('prod-123');
    expect(result?.name).toBe('Test Product');
  });

  it('should fallback to id if slug not found', async () => {
    // First call (slug) fails
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });
    // Second call (id) succeeds
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('prod-123');

    expect(supabaseMocks.mockProductsEq).toHaveBeenCalledWith('slug', 'prod-123');
    expect(supabaseMocks.mockProductsEq).toHaveBeenCalledWith('id', 'prod-123');
    expect(result).toBeDefined();
  });

  it('should return null if product not found', async () => {
    supabaseMocks.mockProductsSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const result = await fetchProductDataSupabase('non-existent');

    expect(result).toBeNull();
  });

  it('should transform product data correctly', async () => {
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result).toMatchObject({
      id: 'prod-123',
      brand: 'Test Brand',
      brandId: 'brand-1',
      name: 'Test Product',
      category: 'Test Category',
      url: '/product/test-product',
      description: 'Test description',
      quantity: 10,
    });
  });

  it('should sort images by sort_order', async () => {
    const dataWithUnorderedImages = {
      ...mockProductData,
      product_images: [
        { image_path: 'image2.jpg', image_url: null, is_main: false, sort_order: 2 },
        { image_path: 'image1.jpg', image_url: null, is_main: true, sort_order: 1 },
      ],
    };
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: dataWithUnorderedImages, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.images?.[0]).toContain('image1.jpg');
    expect(result?.imgSrc).toContain('image1.jpg');
  });

  it('should transform price correctly', async () => {
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.price).toEqual({
      currentPrice: 100,
      originalPrice: 150,
      currency: 'TRY',
    });
  });

  it('should include rating when available', async () => {
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.rating).toEqual({
      averageRating: 4.5,
      totalCount: 100,
    });
  });

  it('should not include rating when count is 0', async () => {
    const dataWithNoRating = { ...mockProductData, rating_count: 0 };
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: dataWithNoRating, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.rating).toBeUndefined();
  });

  it('should handle missing optional fields', async () => {
    const minimalData = {
      ...mockProductData,
      product_prices: [],
      product_images: [],
      product_stock: [],
      attributes_json: null,
      description: null,
    };
    supabaseMocks.mockProductsSingle.mockResolvedValueOnce({ data: minimalData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.price.currentPrice).toBe(0);
    expect(result?.images).toEqual([]);
    expect(result?.quantity).toBe(0);
    expect(result?.attributes).toEqual([]);
    expect(result?.description).toBe('');
  });
});
