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

// Mock Supabase
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('../supabase/anon', () => ({
  getSupabaseAnon: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock r2Url
vi.mock('../utils/r2', () => ({
  r2Url: vi.fn((path) => `https://cdn.test.com/${path}`),
}));

describe('fetchProductDataSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch product by slug', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(mockFrom).toHaveBeenCalledWith('products');
    expect(mockEq).toHaveBeenCalledWith('slug', 'test-product');
    expect(result).toBeDefined();
    expect(result?.id).toBe('prod-123');
    expect(result?.name).toBe('Test Product');
  });

  it('should fallback to id if slug not found', async () => {
    // First call (slug) fails
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
    // Second call (id) succeeds
    mockSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('prod-123');

    expect(mockEq).toHaveBeenCalledWith('slug', 'prod-123');
    expect(mockEq).toHaveBeenCalledWith('id', 'prod-123');
    expect(result).toBeDefined();
  });

  it('should return null if product not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const result = await fetchProductDataSupabase('non-existent');

    expect(result).toBeNull();
  });

  it('should transform product data correctly', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

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
    mockSingle.mockResolvedValueOnce({ data: dataWithUnorderedImages, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.images?.[0]).toContain('image1.jpg');
    expect(result?.imgSrc).toContain('image1.jpg');
  });

  it('should transform price correctly', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.price).toEqual({
      currentPrice: 100,
      originalPrice: 150,
      currency: 'TRY',
    });
  });

  it('should include rating when available', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockProductData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.rating).toEqual({
      averageRating: 4.5,
      totalCount: 100,
    });
  });

  it('should not include rating when count is 0', async () => {
    const dataWithNoRating = { ...mockProductData, rating_count: 0 };
    mockSingle.mockResolvedValueOnce({ data: dataWithNoRating, error: null });

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
    mockSingle.mockResolvedValueOnce({ data: minimalData, error: null });

    const result = await fetchProductDataSupabase('test-product');

    expect(result?.price.currentPrice).toBe(0);
    expect(result?.images).toEqual([]);
    expect(result?.quantity).toBe(0);
    expect(result?.attributes).toEqual([]);
    expect(result?.description).toBe('');
  });
});
