'use client';

import { AFFILIATE_CLICK_ID_COOKIE } from '@/lib/analytics/attribution';
import { useEffect } from 'react';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
};

const normalizeRefCode = (value: string | null) => {
  const normalized = String(value ?? '').trim().toUpperCase();
  return /^[A-Z0-9_-]{3,20}$/.test(normalized) ? normalized : null;
};

/**
 * Attribution COOKIE yakalama (UTM / ttclid / landing / referrer / affiliate_ref)
 * artık MIDDLEWARE'de (server-side) yapılıyor — JS/chunk yüklenmeden, anında bounce'ta
 * bile kaybolmaz. (bkz. src/middleware.ts)
 *
 * Bu bileşen SADECE affiliate tıklama kaydını yapar: ?ref ile gelen GERÇEK tıklamada
 * /api/affiliates/track'e async, non-blocking çağrı + clickId. Veri-kaybı-hassas değil:
 * fast-bounce'ta tıklama sayımı eksik kalsa bile, affiliate_ref cookie'si middleware'de
 * yazıldığı için sonraki dönüşüm yine kredilenir.
 */
export default function AttributionTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ?ref yalnızca gerçek tıklama URL'sinde bulunur (kalıcı cookie'den okumayız —
    // yoksa her organik ziyarette tıklama tekrar sayılır).
    const refCode = normalizeRefCode(new URLSearchParams(window.location.search).get('ref'));
    if (!refCode) return;

    const currentHref = window.location.href;
    const dedupeKey = `mitenya_affiliate_track:${refCode}:${window.location.pathname}:${window.location.search}`;

    const run = async () => {
      // LCP penceresini bloklamamak için idle'a ertele.
      if ('requestIdleCallback' in window) {
        await new Promise((resolve) => window.requestIdleCallback(resolve, { timeout: 1500 }));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (window.sessionStorage.getItem(dedupeKey)) return;

      void fetch('/api/affiliates/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: refCode, refererUrl: currentHref }),
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as { ok?: boolean; clickId?: string };
        })
        .then((payload) => {
          if (!payload?.ok) return;

          window.sessionStorage.setItem(dedupeKey, '1');

          if (payload.clickId) {
            setCookie(AFFILIATE_CLICK_ID_COOKIE, payload.clickId);
            window.localStorage.setItem(`mitenya_affiliate_click:${refCode}`, payload.clickId);
          }
        })
        .catch(() => {
          // Best effort tracking only.
        });
    };

    run();
  }, []);

  return null;
}
