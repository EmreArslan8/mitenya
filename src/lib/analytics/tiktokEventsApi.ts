import crypto from 'crypto';

const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

const hash = (value: string) =>
  crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');

const hashPhone = (value: string) =>
  crypto.createHash('sha256').update(value.replace(/\D/g, '')).digest('hex');

export type TikTokServerContent = {
  content_id: string;
  content_type?: 'product' | 'product_group';
  content_name?: string;
  quantity?: number;
  price?: number;
};

export type TikTokServerUser = {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  ttclid?: string | null;
  ttp?: string | null;
};

export type TikTokServerEvent = {
  event: 'InitiateCheckout' | 'AddPaymentInfo' | 'Purchase';
  eventId: string;
  value?: number;
  currency?: string;
  contents?: TikTokServerContent[];
  orderId?: string;
  pageUrl?: string;
  referrer?: string | null;
  user: TikTokServerUser;
};

const compact = <T extends Record<string, unknown>>(input: T) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

const buildUserPayload = (user: TikTokServerUser) => {
  const payload: Record<string, string> = {};

  if (user.email) payload.email = hash(user.email);
  if (user.phone) {
    const normalizedPhone = user.phone.replace(/\D/g, '');
    if (normalizedPhone) payload.phone_number = hashPhone(normalizedPhone);
  }
  if (user.externalId) payload.external_id = hash(user.externalId);
  if (user.ip) payload.ip = user.ip;
  if (user.userAgent) payload.user_agent = user.userAgent;
  if (user.ttclid) payload.ttclid = user.ttclid;
  if (user.ttp) payload.ttp = user.ttp;

  return payload;
};

const resolvePixelId = () =>
  process.env.TIKTOK_PIXEL_ID ||
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export async function sendTikTokServerEvent(data: TikTokServerEvent): Promise<void> {
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;
  const pixelId = resolvePixelId();

  if (!accessToken || !pixelId) {
    console.warn('[TikTokEventsAPI] Missing TIKTOK_EVENTS_API_ACCESS_TOKEN or TIKTOK_PIXEL_ID');
    return;
  }

  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: data.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId,
        user: buildUserPayload(data.user),
        page: compact({
          url: data.pageUrl,
          referrer: data.referrer,
        }),
        properties: compact({
          contents: data.contents?.map((content) =>
            compact({
              content_id: content.content_id,
              content_type: content.content_type ?? 'product',
              content_name: content.content_name,
              quantity: content.quantity,
              price: content.price,
            })
          ),
          value: data.value,
          currency: data.currency,
          content_type: 'product',
          order_id: data.orderId,
        }),
      },
    ],
    ...(process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE
      ? { test_event_code: process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE }
      : {}),
  };

  try {
    const res = await fetch(TIKTOK_EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[TikTokEventsAPI] API error', { status: res.status, body: text.slice(0, 500) });
      return;
    }

    const body = await res.json().catch(() => null);
    if (body?.code && body.code !== 0) {
      console.error('[TikTokEventsAPI] API response error', body);
    }
  } catch (error) {
    console.error('[TikTokEventsAPI] fetch error', error);
  }
}
