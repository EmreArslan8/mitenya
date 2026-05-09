'use client';

import { onMetaPixelReady, trackPageView } from '@/lib/analytics/metaPixel';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { isInternalTraffic } from '@/lib/analytics/isInternalTraffic';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { consent } = useCookieConsent();
  const initialized = useRef(false);
  const routeKey = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname;

  useEffect(() => {
    if (!consent?.marketing || isInternalTraffic()) {
      initialized.current = false;
      return;
    }
    // Init script fires the first PageView when it loads.
    // Skip here to avoid double tracking; subsequent navigations fire normally.
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    return onMetaPixelReady(() => {
      trackPageView();
    });
  }, [routeKey, consent?.marketing]);

  return null;
}
