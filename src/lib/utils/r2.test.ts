import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productMainImagePath, r2Url } from './r2';

describe('r2Url', () => {
  const originalEnv = process.env.NEXT_PUBLIC_R2_BASE_URL;

  beforeEach(() => {
    // Clear console.warn mock before each test
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original env
    process.env.NEXT_PUBLIC_R2_BASE_URL = originalEnv;
    vi.restoreAllMocks();
  });

  describe('with R2_BASE_URL set', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_R2_BASE_URL = 'https://cdn.example.com';
    });

    it('should return empty string for empty input', () => {
      expect(r2Url('')).toBe('');
    });

    it('should combine base URL with path', () => {
      expect(r2Url('images/product.jpg')).toBe('https://cdn.example.com/images/product.jpg');
    });

    it('should handle path with leading slash', () => {
      expect(r2Url('/images/product.jpg')).toBe('https://cdn.example.com/images/product.jpg');
    });

    it('should handle multiple leading slashes', () => {
      expect(r2Url('///images/product.jpg')).toBe('https://cdn.example.com/images/product.jpg');
    });

    it('should handle base URL with trailing slash', () => {
      process.env.NEXT_PUBLIC_R2_BASE_URL = 'https://cdn.example.com/';
      expect(r2Url('images/product.jpg')).toBe('https://cdn.example.com/images/product.jpg');
    });

    it('should return full URL as-is if starts with http', () => {
      expect(r2Url('http://other.com/image.jpg')).toBe('http://other.com/image.jpg');
    });

    it('should return full URL as-is if starts with https', () => {
      expect(r2Url('https://other.com/image.jpg')).toBe('https://other.com/image.jpg');
    });

    it('should handle HTTP case insensitively', () => {
      expect(r2Url('HTTP://other.com/image.jpg')).toBe('HTTP://other.com/image.jpg');
      expect(r2Url('HTTPS://other.com/image.jpg')).toBe('HTTPS://other.com/image.jpg');
    });
  });

  describe('without R2_BASE_URL', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_R2_BASE_URL;
    });

    it('should return raw path and log warning', () => {
      const result = r2Url('images/product.jpg');
      expect(result).toBe('images/product.jpg');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should still return empty string for empty input', () => {
      expect(r2Url('')).toBe('');
    });
  });
});

describe('productMainImagePath', () => {
  it('builds the PDP main image path from the product slug', () => {
    expect(productMainImagePath('celimax-retinol-shot-tightening-serum-30ml')).toBe(
      'products/celimax-retinol-shot-tightening-serum-30ml/main.webp'
    );
  });

  it('normalizes accidental leading and trailing slashes', () => {
    expect(productMainImagePath('/sample-product/')).toBe('products/sample-product/main.webp');
  });
});
