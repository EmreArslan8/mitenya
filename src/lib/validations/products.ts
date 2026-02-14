import { z } from 'zod';
import { QUERY_MAX_LENGTH, PRODUCT_ID_MAX_LENGTH, DEFAULT_SORT, SORT_OPTIONS } from '../constants/shop';

// Sort options
export const ShopSearchSortSchema = z.enum(SORT_OPTIONS);

// Products list query params validation
export const ProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  sort: ShopSearchSortSchema.optional().default(DEFAULT_SORT),
  brand: z
    .string()
    .optional()
    .refine((val) => !val || /^[\w-]+(,[\w-]+)*$/.test(val), {
      message: 'Invalid brand format',
    }),
  category: z
    .string()
    .optional()
    .refine((val) => !val || /^[\w-]+(,[\w-]+)*$/.test(val), {
      message: 'Invalid category format',
    }),
  collection: z
    .string()
    .optional()
    .refine((val) => !val || /^[\w-]+$/.test(val), {
      message: 'Invalid collection format',
    }),
  query: z
    .string()
    .max(QUERY_MAX_LENGTH, 'Query too long')
    .optional()
    .transform((val) => val?.trim()),
  price: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+-\d*$/.test(val), {
      message: 'Invalid price format. Expected: min-max or min-',
    }),
});

// Product ID/Slug validation
export const ProductIdSchema = z
  .string()
  .min(1, 'Product ID is required')
  .max(PRODUCT_ID_MAX_LENGTH, 'Product ID too long')
  .refine((val) => /^[\w-]+$/.test(val), {
    message: 'Invalid product ID format',
  });

// Brand ID validation (for recommendations)
export const BrandIdSchema = z
  .string()
  .min(1, 'Brand ID is required')
  .max(PRODUCT_ID_MAX_LENGTH, 'Brand ID too long');

// Type exports
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;
export type ShopSearchSortType = z.infer<typeof ShopSearchSortSchema>;
