'use client';

import {
  AFFILIATE_CLICK_ID_COOKIE,
  AFFILIATE_REF_COOKIE,
  LANDING_PATH_COOKIE,
  REFERRER_COOKIE,
  UTM_COOKIE_KEYS,
} from '@/lib/analytics/attribution';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
};

const normalizeRefCode = (value: string | null) => {
  const normalized = String(value ?? '').trim().toUpperCase();
  return /^[A-Z0-9_-]{3,20}$/.test(normalized) ? normalized : null;
};

export default function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const refCode = normalizeRefCode(searchParams.get('ref'));
    const hasUtm = UTM_COOKIE_KEYS.some((key) => Boolean(searchParams.get(key)));

    if (!refCode && !hasUtm) return;

    setCookie(LANDING_PATH_COOKIE, pathname || '/');

    if (document.referrer) {
      setCookie(REFERRER_COOKIE, document.referrer, 60 * 60 * 24 * 7);
    }

    for (const key of UTM_COOKIE_KEYS) {
      const value = searchParams.get(key)?.trim();
      if (value) setCookie(key, value);
    }

    if (!refCode) return;

    setCookie(AFFILIATE_REF_COOKIE, refCode);

    const dedupeKey = `mitenya_affiliate_track:${refCode}:${pathname}:${searchParams.toString()}`;
    if (window.sessionStorage.getItem(dedupeKey)) return;

    void fetch('/api/affiliates/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: refCode,
        refererUrl: window.location.href,
      }),
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
  }, [pathname, searchParams]);

  return null;
}
