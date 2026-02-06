// Pagination
export const PRODUCTS_PER_PAGE = 24;
export const ORDERS_PER_PAGE = 50;

// Cart limits
export const CART_MAX_QUANTITY_PER_ITEM = 5;
export const CART_MIN_QUANTITY = 1;

// Search history
export const SEARCH_HISTORY_MAX_ITEMS = 10;

// Cache TTL (in milliseconds)
export const FILTER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// API limits
export const RECOMMENDATIONS_LIMIT = 4;
export const QUERY_MAX_LENGTH = 100;
export const PRODUCT_ID_MAX_LENGTH = 100;

// Price ranges for filters (TRY)
export const PRICE_RANGES = [
  { label: '0 - 250 TL', min: 0, max: 250 },
  { label: '250 - 500 TL', min: 250, max: 500 },
  { label: '500 - 750 TL', min: 500, max: 750 },
  { label: '750 - 1000 TL', min: 750, max: 1000 },
  { label: '1000 TL ve üzeri', min: 1000, max: Infinity },
] as const;

// Default currency
export const DEFAULT_CURRENCY = 'TRY';

// Sort options
export const SORT_OPTIONS: ('rct' | 'disc' | 'pasc' | 'pdsc')[] = ['rct', 'disc', 'pasc', 'pdsc'];
export const DEFAULT_SORT = 'rct';
