type CapiClientEvent = {
  eventName: 'ViewContent' | 'AddToCart' | 'InitiateCheckout';
  eventId: string;
  eventSourceUrl?: string;
  contentIds: string[];
  contentName?: string;
  contentCategory?: string;
  value?: number;
  currency?: string;
  numItems?: number;
  email?: string;
  phone?: string;
};

// Fire-and-forget — sayfa yüküne etkisi yok, hata sessizce yutulur
export const sendCapiFromClient = (event: CapiClientEvent): void => {
  if (typeof window === 'undefined') return;
  fetch('/api/analytics/capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...event,
      eventSourceUrl: event.eventSourceUrl ?? window.location.href,
    }),
    keepalive: true, // Sayfa kapansa bile isteği tamamlar
  }).catch(() => undefined);
};

export const generateCapiEventId = (prefix: string): string => {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${prefix}_${rand}`;
};
