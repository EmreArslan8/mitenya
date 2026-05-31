import crypto from 'crypto';

const CAPI_VERSION = 'v20.0';

const hash = (value: string) =>
  crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');

const hashPhone = (value: string) =>
  crypto.createHash('sha256').update(value.replace(/\D/g, '')).digest('hex');

export type CapiUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type CapiPurchaseData = {
  eventId: string;
  value: number;
  currency: string;
  contentIds: string[];
  numItems?: number;
  orderId?: string;
  userData: CapiUserData;
  eventSourceUrl?: string;
};

export type CapiInitiateCheckoutData = {
  eventId: string;
  value: number;
  currency: string;
  contentIds: string[];
  numItems?: number;
  userData: CapiUserData;
  eventSourceUrl?: string;
};

export type CapiAddToCartData = {
  eventId: string;
  value: number;
  currency: string;
  contentIds: string[];
  contentName?: string;
  numItems?: number;
  userData: CapiUserData;
  eventSourceUrl?: string;
};

export type CapiViewContentData = {
  eventId: string;
  value?: number;
  currency?: string;
  contentIds: string[];
  contentName?: string;
  contentCategory?: string;
  userData: CapiUserData;
  eventSourceUrl?: string;
};

function buildUserData(userData: CapiUserData): Record<string, string> {
  const out: Record<string, string> = {};
  if (userData.email) out.em = hash(userData.email);
  if (userData.phone) out.ph = hashPhone(userData.phone);
  if (userData.firstName) out.fn = hash(userData.firstName);
  if (userData.lastName) out.ln = hash(userData.lastName);
  if (userData.city) out.ct = hash(userData.city);
  if (userData.country) out.country = hash(userData.country.toLowerCase());
  if (userData.clientIp) out.client_ip_address = userData.clientIp;
  if (userData.clientUserAgent) out.client_user_agent = userData.clientUserAgent;
  if (userData.fbp) out.fbp = userData.fbp;
  if (userData.fbc) out.fbc = userData.fbc;
  return out;
}

async function sendCapiEvent(events: object[]): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[MetaCAP] Missing NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN');
    return;
  }

  const url = `https://graph.facebook.com/${CAPI_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const payload: Record<string, unknown> = { data: events };
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testCode) payload.test_event_code = testCode;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[MetaCAP] API error', { status: res.status, body: text.slice(0, 500) });
    }
  } catch (err) {
    console.error('[MetaCAP] fetch error', err);
  }
}

export async function sendCapiPurchase(data: CapiPurchaseData): Promise<void> {
  await sendCapiEvent([
    {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      event_source_url: data.eventSourceUrl ?? 'https://mitenya.com/success',
      action_source: 'website',
      user_data: buildUserData(data.userData),
      custom_data: {
        value: data.value,
        currency: data.currency,
        content_ids: data.contentIds,
        content_type: 'product',
        num_items: data.numItems ?? data.contentIds.length,
        order_id: data.orderId,
      },
    },
  ]);
}

export async function sendCapiAddToCart(data: CapiAddToCartData): Promise<void> {
  await sendCapiEvent([
    {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      event_source_url: data.eventSourceUrl ?? 'https://mitenya.com',
      action_source: 'website',
      user_data: buildUserData(data.userData),
      custom_data: {
        value: data.value,
        currency: data.currency,
        content_ids: data.contentIds,
        content_name: data.contentName,
        content_type: 'product',
        num_items: data.numItems ?? data.contentIds.length,
      },
    },
  ]);
}

export async function sendCapiViewContent(data: CapiViewContentData): Promise<void> {
  await sendCapiEvent([
    {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      event_source_url: data.eventSourceUrl ?? 'https://mitenya.com',
      action_source: 'website',
      user_data: buildUserData(data.userData),
      custom_data: {
        value: data.value,
        currency: data.currency,
        content_ids: data.contentIds,
        content_name: data.contentName,
        content_category: data.contentCategory,
        content_type: 'product',
      },
    },
  ]);
}

export async function sendCapiInitiateCheckout(data: CapiInitiateCheckoutData): Promise<void> {
  await sendCapiEvent([
    {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      event_source_url: data.eventSourceUrl ?? 'https://mitenya.com/checkout',
      action_source: 'website',
      user_data: buildUserData(data.userData),
      custom_data: {
        value: data.value,
        currency: data.currency,
        content_ids: data.contentIds,
        content_type: 'product',
        num_items: data.numItems ?? data.contentIds.length,
      },
    },
  ]);
}
