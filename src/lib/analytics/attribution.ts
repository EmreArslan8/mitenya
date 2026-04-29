export const AFFILIATE_REF_COOKIE = 'affiliate_ref';
export const AFFILIATE_CLICK_ID_COOKIE = 'affiliate_click_id';
export const LANDING_PATH_COOKIE = 'mitenya_landing_path';
export const REFERRER_COOKIE = 'mitenya_referrer';
export const TIKTOK_CLICK_ID_COOKIE = 'ttclid';
export const TIKTOK_TTP_COOKIE = '_ttp';

export const UTM_COOKIE_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmCookieKey = (typeof UTM_COOKIE_KEYS)[number];

export type OrderAttribution = {
  affiliateCode?: string | null;
  affiliateClickId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  landingPath?: string | null;
  referrer?: string | null;
  tikTokClickId?: string | null;
  tikTokTtp?: string | null;
  tikTokMarketingConsent?: boolean | null;
};

type CookieMap = Record<string, string>;

type CheckoutNotesEnvelope = {
  customerNote: string | null;
  attribution: OrderAttribution | null;
};

const CHECKOUT_NOTES_PREFIX = '__mitenya_checkout__:';
const CHECKOUT_NOTES_MAX_LENGTH = 500;

const sanitizeValue = (value: string | null | undefined, maxLength = 255) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
};

export const parseCookieHeader = (cookieHeader: string | undefined | null): CookieMap => {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce<CookieMap>((acc, entry) => {
    const [rawKey, ...rawValueParts] = entry.split('=');
    const key = rawKey?.trim();
    if (!key) return acc;

    const rawValue = rawValueParts.join('=').trim();
    if (!rawValue) return acc;

    try {
      acc[key] = decodeURIComponent(rawValue);
    } catch {
      acc[key] = rawValue;
    }

    return acc;
  }, {});
};

export const buildAttributionFromCookieMap = (
  cookies: CookieMap,
  extras?: Partial<OrderAttribution>
): OrderAttribution | null => {
  const attribution: OrderAttribution = {
    affiliateCode: sanitizeValue(cookies[AFFILIATE_REF_COOKIE], 20),
    affiliateClickId: sanitizeValue(cookies[AFFILIATE_CLICK_ID_COOKIE], 100),
    utmSource: sanitizeValue(cookies.utm_source, 120),
    utmMedium: sanitizeValue(cookies.utm_medium, 120),
    utmCampaign: sanitizeValue(cookies.utm_campaign, 160),
    utmContent: sanitizeValue(cookies.utm_content, 160),
    utmTerm: sanitizeValue(cookies.utm_term, 160),
    landingPath: sanitizeValue(cookies[LANDING_PATH_COOKIE], 255),
    referrer: sanitizeValue(cookies[REFERRER_COOKIE], 500),
    tikTokClickId: sanitizeValue(cookies[TIKTOK_CLICK_ID_COOKIE], 500),
    tikTokTtp: sanitizeValue(cookies[TIKTOK_TTP_COOKIE], 500),
    tikTokMarketingConsent: cookies.mitenya_marketing_consent === '1' ? true : null,
    ...extras,
  };

  return Object.values(attribution).some(Boolean) ? attribution : null;
};

export const buildAttributionFromDocument = (
  cookieHeader: string | undefined | null,
  extras?: Partial<OrderAttribution>
) => buildAttributionFromCookieMap(parseCookieHeader(cookieHeader), extras);

export const serializeCheckoutNotes = (
  customerNote: string | null | undefined,
  attribution: OrderAttribution | null | undefined
) => {
  const note = sanitizeValue(customerNote, 500);
  const normalizedAttribution = attribution && Object.values(attribution).some(Boolean) ? attribution : null;

  if (!normalizedAttribution) return note;

  const encodeEnvelope = (payload: OrderAttribution | null, customerNote = note) =>
    `${CHECKOUT_NOTES_PREFIX}${encodeURIComponent(
      JSON.stringify({
        customerNote,
        attribution: payload,
      } satisfies CheckoutNotesEnvelope)
    )}`;

  let serialized = encodeEnvelope(normalizedAttribution);
  if (serialized.length <= CHECKOUT_NOTES_MAX_LENGTH) return serialized;

  const trimmedAttribution: OrderAttribution = { ...normalizedAttribution };
  const optionalFieldsInDropOrder: Array<keyof OrderAttribution> = [
    'referrer',
    'landingPath',
    'utmTerm',
    'utmContent',
    'utmCampaign',
    'utmMedium',
    'utmSource',
  ];

  for (const field of optionalFieldsInDropOrder) {
    delete trimmedAttribution[field];
    serialized = encodeEnvelope(trimmedAttribution);
    if (serialized.length <= CHECKOUT_NOTES_MAX_LENGTH) return serialized;
  }

  const minimalAttribution: OrderAttribution = {
    affiliateCode: normalizedAttribution.affiliateCode ?? null,
    affiliateClickId: normalizedAttribution.affiliateClickId ?? null,
    tikTokClickId: normalizedAttribution.tikTokClickId ?? null,
    tikTokTtp: normalizedAttribution.tikTokTtp ?? null,
    tikTokMarketingConsent: normalizedAttribution.tikTokMarketingConsent ?? null,
  };

  serialized = encodeEnvelope(
    Object.values(minimalAttribution).some(Boolean) ? minimalAttribution : null
  );

  if (serialized.length <= CHECKOUT_NOTES_MAX_LENGTH) return serialized;

  serialized = encodeEnvelope(minimalAttribution, null);
  if (serialized.length <= CHECKOUT_NOTES_MAX_LENGTH) return serialized;

  return note;
};

export const parseCheckoutNotes = (rawNotes: string | null | undefined): CheckoutNotesEnvelope => {
  const note = sanitizeValue(rawNotes, 500);
  if (!note || !note.startsWith(CHECKOUT_NOTES_PREFIX)) {
    return {
      customerNote: note,
      attribution: null,
    };
  }

  try {
    const decoded = decodeURIComponent(note.slice(CHECKOUT_NOTES_PREFIX.length));
    const parsed = JSON.parse(decoded) as CheckoutNotesEnvelope;
    return {
      customerNote: sanitizeValue(parsed.customerNote, 500),
      attribution: parsed.attribution ?? null,
    };
  } catch {
    return {
      customerNote: null,
      attribution: null,
    };
  }
};
