declare global {
  interface Window {
    ttq?: TikTokPixelQueue;
    __tiktokPixelReady?: boolean;
  }
}

type TikTokPixelQueue = {
  page: () => void;
  identify: (params: Record<string, string>) => void;
  track: (event: string, params?: Record<string, unknown>) => void;
};

type TikTokContent = {
  content_id: string;
  content_type: 'product' | 'product_group';
  content_name?: string;
  num_items?: number;
};

type ProductEventParams = {
  content_ids: string[];
  content_name?: string;
  content_category?: string;
  contents?: TikTokContent[];
  value?: number;
  currency?: string;
  num_items?: number;
  order_id?: string;
  search_string?: string;
};

type TikTokUserData = {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
};

type TrackWithUserOptions = {
  userData?: TikTokUserData;
  onReady?: () => void;
  track: () => void;
};

export const ttq = (method: keyof TikTokPixelQueue, ...args: unknown[]) => {
  if (typeof window === 'undefined') return;

  const pixel = window.ttq;
  const fn = pixel?.[method];
  if (typeof fn === 'function') {
    (fn as (...methodArgs: unknown[]) => void)(...args);
  }
};

export const isTikTokPixelReady = () =>
  typeof window !== 'undefined' &&
  Boolean(window.__tiktokPixelReady) &&
  typeof window.ttq?.track === 'function';

export const onTikTokPixelReady = (callback: () => void | Promise<void>) => {
  if (typeof window === 'undefined') return () => undefined;

  if (isTikTokPixelReady()) {
    void callback();
    return () => undefined;
  }

  const handleReady = () => {
    void callback();
  };
  window.addEventListener('tiktok-pixel-ready', handleReady, { once: true });

  return () => window.removeEventListener('tiktok-pixel-ready', handleReady);
};

const normalizeValue = (value: string) => value.trim().toLowerCase();

const normalizePhone = (value: string) => value.replace(/\D/g, '');

const hashSha256 = async (value: string) => {
  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const identifyTikTokUser = async (userData?: TikTokUserData) => {
  if (typeof window === 'undefined' || !isTikTokPixelReady() || !userData) return;

  const payload: Record<string, string> = {};

  try {
    if (userData.email) {
      payload.sha256_email = await hashSha256(normalizeValue(userData.email));
    }

    if (userData.phone) {
      const normalizedPhone = normalizePhone(userData.phone);
      if (normalizedPhone) payload.sha256_phone_number = await hashSha256(normalizedPhone);
    }

    if (userData.externalId) {
      payload.sha256_external_id = await hashSha256(normalizeValue(userData.externalId));
    }

    if (Object.keys(payload).length) {
      ttq('identify', payload);
    }
  } catch (error) {
    console.warn('[TikTokPixel] identify failed', error);
  }
};

export const trackTikTokWithUser = ({ userData, onReady, track }: TrackWithUserOptions) =>
  onTikTokPixelReady(async () => {
    onReady?.();
    await identifyTikTokUser(userData);
    track();
  });

const buildProductPayload = (params: ProductEventParams) => ({
  content_type: 'product',
  content_id: params.content_ids[0],
  content_ids: params.content_ids,
  content_name: params.content_name,
  content_category: params.content_category,
  value: params.value,
  currency: params.currency,
  quantity: params.num_items,
  num_items: params.num_items,
  order_id: params.order_id,
  search_string: params.search_string,
  contents: params.contents ?? params.content_ids.map((id) => ({
    content_id: id,
    content_type: 'product',
    content_name: params.content_name,
    num_items: params.num_items,
  })),
});

export const trackTikTokPageView = () => ttq('page');

export const trackTikTokViewContent = (params: ProductEventParams) =>
  ttq('track', 'ViewContent', buildProductPayload(params));

export const trackTikTokAddToCart = (params: ProductEventParams) =>
  ttq('track', 'AddToCart', buildProductPayload(params));

export const trackTikTokInitiateCheckout = (params: ProductEventParams) =>
  ttq('track', 'InitiateCheckout', buildProductPayload(params));

export const trackTikTokAddPaymentInfo = (params: ProductEventParams & { payment_type?: string }) =>
  ttq('track', 'AddPaymentInfo', {
    ...buildProductPayload(params),
    payment_type: params.payment_type,
  });

export const trackTikTokAddToWishlist = (params: ProductEventParams) =>
  ttq('track', 'AddToWishlist', buildProductPayload(params));

export const trackTikTokPurchase = (params: ProductEventParams & { value: number; currency: string }) =>
  ttq('track', 'Purchase', buildProductPayload(params));

export const trackTikTokSearch = (params: { search_string: string }) =>
  ttq('track', 'Search', params);
