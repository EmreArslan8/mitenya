import { describe, it, expect } from 'vitest';
import {
  ProductsQuerySchema,
  ProductIdSchema,
  BrandIdSchema,
  ShopSearchSortSchema,
} from './products';

describe('ProductsQuerySchema', () => {
  describe('page validation', () => {
    it('should parse valid page number', () => {
      const result = ProductsQuerySchema.safeParse({ page: '5' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
      }
    });

    it('should default to 1 when page is not provided', () => {
      const result = ProductsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should convert negative page to 1', () => {
      const result = ProductsQuerySchema.safeParse({ page: '-5' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should convert zero page to 1', () => {
      const result = ProductsQuerySchema.safeParse({ page: '0' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should convert invalid string to 1', () => {
      const result = ProductsQuerySchema.safeParse({ page: 'abc' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });
  });

  describe('sort validation', () => {
    it('should accept valid sort options', () => {
      const validSorts = ['rct', 'asc', 'dsc'];
      validSorts.forEach((sort) => {
        const result = ProductsQuerySchema.safeParse({ sort });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sort).toBe(sort);
        }
      });
    });

    it('should reject invalid sort option', () => {
      const result = ProductsQuerySchema.safeParse({ sort: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should default to rct when not provided', () => {
      const result = ProductsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe('rct');
      }
    });
  });

  describe('brand validation', () => {
    it('should accept valid single brand', () => {
      const result = ProductsQuerySchema.safeParse({ brand: 'brand-123' });
      expect(result.success).toBe(true);
    });

    it('should accept valid multiple brands', () => {
      const result = ProductsQuerySchema.safeParse({ brand: 'brand-1,brand-2,brand-3' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid brand format with special chars', () => {
      const result = ProductsQuerySchema.safeParse({ brand: 'brand<script>' });
      expect(result.success).toBe(false);
    });
  });

  describe('category validation', () => {
    it('should accept valid single category', () => {
      const result = ProductsQuerySchema.safeParse({ category: 'cat-456' });
      expect(result.success).toBe(true);
    });

    it('should accept valid multiple categories', () => {
      const result = ProductsQuerySchema.safeParse({ category: 'cat-1,cat-2' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid category format', () => {
      const result = ProductsQuerySchema.safeParse({ category: 'cat;DROP TABLE' });
      expect(result.success).toBe(false);
    });
  });

  describe('concern validation', () => {
    it('should accept valid single concern', () => {
      const result = ProductsQuerySchema.safeParse({ concern: 'akne' });
      expect(result.success).toBe(true);
    });

    it('should accept valid multiple concerns', () => {
      const result = ProductsQuerySchema.safeParse({ concern: 'akne,leke,kuruluk' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid concern format', () => {
      const result = ProductsQuerySchema.safeParse({ concern: 'akne;DROP TABLE' });
      expect(result.success).toBe(false);
    });
  });

  describe('benefit validation', () => {
    it('should accept valid single benefit', () => {
      const result = ProductsQuerySchema.safeParse({ benefit: 'yaslanma-karsiti' });
      expect(result.success).toBe(true);
    });

    it('should accept valid multiple benefits', () => {
      const result = ProductsQuerySchema.safeParse({ benefit: 'yaslanma-karsiti,aydinlik-parlaklik,yogun-nem-destegi' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid benefit format', () => {
      const result = ProductsQuerySchema.safeParse({ benefit: 'yaslanma-karsiti;DROP TABLE' });
      expect(result.success).toBe(false);
    });
  });

  describe('query validation', () => {
    it('should accept valid search query', () => {
      const result = ProductsQuerySchema.safeParse({ query: 'lipstick' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('lipstick');
      }
    });

    it('should trim whitespace from query', () => {
      const result = ProductsQuerySchema.safeParse({ query: '  lipstick  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('lipstick');
      }
    });

    it('should reject query longer than max length', () => {
      const longQuery = 'a'.repeat(101);
      const result = ProductsQuerySchema.safeParse({ query: longQuery });
      expect(result.success).toBe(false);
    });
  });

  describe('price validation', () => {
    it('should accept valid price range', () => {
      const result = ProductsQuerySchema.safeParse({ price: '100-500' });
      expect(result.success).toBe(true);
    });

    it('should accept open-ended price range', () => {
      const result = ProductsQuerySchema.safeParse({ price: '1000-' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid price format', () => {
      const result = ProductsQuerySchema.safeParse({ price: 'cheap' });
      expect(result.success).toBe(false);
    });

    it('should reject price with negative values', () => {
      const result = ProductsQuerySchema.safeParse({ price: '-100-500' });
      expect(result.success).toBe(false);
    });
  });
});

describe('ProductIdSchema', () => {
  it('should accept valid product ID', () => {
    const result = ProductIdSchema.safeParse('product-123');
    expect(result.success).toBe(true);
  });

  it('should accept UUID format', () => {
    const result = ProductIdSchema.safeParse('abc123-def456');
    expect(result.success).toBe(true);
  });

  it('should reject empty string', () => {
    const result = ProductIdSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should reject ID with special characters', () => {
    const result = ProductIdSchema.safeParse('product<script>');
    expect(result.success).toBe(false);
  });

  it('should reject ID longer than max length', () => {
    const longId = 'a'.repeat(101);
    const result = ProductIdSchema.safeParse(longId);
    expect(result.success).toBe(false);
  });
});

describe('BrandIdSchema', () => {
  it('should accept valid brand ID', () => {
    const result = BrandIdSchema.safeParse('brand-abc');
    expect(result.success).toBe(true);
  });

  it('should reject empty string', () => {
    const result = BrandIdSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should reject null', () => {
    const result = BrandIdSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});

describe('ShopSearchSortSchema', () => {
  it('should accept all valid sort options', () => {
    const validOptions = ['dsc', 'asc', 'rct'];
    validOptions.forEach((option) => {
      const result = ShopSearchSortSchema.safeParse(option);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid sort option', () => {
    const result = ShopSearchSortSchema.safeParse('newest');
    expect(result.success).toBe(false);
  });
});
