import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchProducts,
  fetchProductData,
  fetchProductVariants,
  fetchRecommendations,
} from './shop';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Shop API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchProducts', () => {
    it('should fetch products with default options', async () => {
      const mockResponse = {
        products: [{ id: '1', name: 'Product 1' }],
        totalCount: 1,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchProducts({});

      expect(mockFetch).toHaveBeenCalledWith('/api/products?');
      expect(result).toEqual(mockResponse);
    });

    it('should include all query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ products: [] }),
      });

      await fetchProducts({
        page: 2,
        sort: 'asc',
        brand: 'brand-1',
        category: 'cat-1',
        collection: 'summer-2024',
        query: 'lipstick',
        price: '0-100',
      });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('sort=asc');
      expect(calledUrl).toContain('brand=brand-1');
      expect(calledUrl).toContain('category=cat-1');
      expect(calledUrl).toContain('collection=summer-2024');
      expect(calledUrl).toContain('query=lipstick');
      expect(calledUrl).toContain('price=0-100');
    });

    it('should return undefined on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchProducts({});

      expect(result).toBeUndefined();
    });

    it('should return undefined on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchProducts({});

      expect(result).toBeUndefined();
    });
  });

  describe('fetchProductData', () => {
    it('should fetch product by id', async () => {
      const mockProduct = { id: 'prod-123', name: 'Test Product' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      });

      const result = await fetchProductData('prod-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/products/prod-123');
      expect(result).toEqual(mockProduct);
    });

    it('should use baseUrl when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await fetchProductData('prod-123', 'https://example.com');

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/products/prod-123');
    });

    it('should return undefined on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await fetchProductData('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('fetchProductVariants', () => {
    it('should fetch variants for product', async () => {
      const mockVariants = [{ name: 'Size', options: ['S', 'M', 'L'] }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVariants),
      });

      const result = await fetchProductVariants('prod-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/products/prod-123/variants');
      expect(result).toEqual(mockVariants);
    });

    it('should return null on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await fetchProductVariants('prod-123');

      expect(result).toBeNull();
    });
  });

  describe('fetchRecommendations', () => {
    it('should fetch recommendations', async () => {
      const mockRecommendations = [{ id: '2', name: 'Related Product' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecommendations),
      });

      const result = await fetchRecommendations({
        brandId: 'brand-1',
        productId: 'prod-123',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/products/prod-123/recommendations?brandId=brand-1'
      );
      expect(result).toEqual(mockRecommendations);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await fetchRecommendations({
        brandId: 'brand-1',
        productId: 'prod-123',
      });

      expect(result).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchRecommendations({
        brandId: 'brand-1',
        productId: 'prod-123',
      });

      expect(result).toEqual([]);
    });
  });
});
