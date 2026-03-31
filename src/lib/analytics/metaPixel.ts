declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
    __metaPixelReady?: boolean;
  }
}

export const fbq = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
};

export const isMetaPixelReady = () =>
  typeof window !== 'undefined' &&
  Boolean(window.__metaPixelReady) &&
  typeof window.fbq === 'function';

export const onMetaPixelReady = (callback: () => void) => {
  if (typeof window === 'undefined') return () => undefined;

  if (isMetaPixelReady()) {
    callback();
    return () => undefined;
  }

  const handleReady = () => callback();
  window.addEventListener('meta-pixel-ready', handleReady, { once: true });

  return () => window.removeEventListener('meta-pixel-ready', handleReady);
};

export const trackPageView = () => fbq('track', 'PageView');

export const trackViewContent = (params: {
  content_ids: string[];
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}) => fbq('track', 'ViewContent', { ...params, content_type: 'product' });

export const trackAddToCart = (params: {
  content_ids: string[];
  content_name?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}) => fbq('track', 'AddToCart', { ...params, content_type: 'product' });

export const trackInitiateCheckout = (params: {
  content_ids: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}) => fbq('track', 'InitiateCheckout', params);

export const trackPurchase = (params: {
  value: number;
  currency: string;
  content_ids: string[];
  num_items?: number;
  order_id?: string;
}) => fbq('track', 'Purchase', params);

export const trackSearch = (params: { search_string: string }) =>
  fbq('track', 'Search', params);

export const trackAddToWishlist = (params: {
  content_ids: string[];
  content_name?: string;
}) => fbq('track', 'AddToWishlist', { ...params, content_type: 'product' });
