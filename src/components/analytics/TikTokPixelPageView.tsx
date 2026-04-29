'use client';

import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { onTikTokPixelReady, trackTikTokPageView } from '@/lib/analytics/tiktokPixel';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function TikTokPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { consent } = useCookieConsent();
  const initialized = useRef(false);
  const routeKey = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname;

  useEffect(() => {
    if (!consent?.marketing) {
      initialized.current = false;
      return;
    }

    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    return onTikTokPixelReady(() => {
      trackTikTokPageView();
    });
  }, [routeKey, consent?.marketing]);

  return null;
}
